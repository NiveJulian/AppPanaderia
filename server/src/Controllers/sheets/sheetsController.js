require("dotenv").config();
const { google } = require("googleapis");
const { getUser } = require("../user/userController");
const { getSheetData, getSheetDataById } = require("./productController");

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  try {
    const authClient = await auth.getClient();
    return authClient;
  } catch (error) {
    console.error("Error during authentication", error);
    throw error;
  }
}

async function registerSaleDashboard(auth, data) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    const { productos, formaPago, tipoEnvio, medio, nombreCliente } = data;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A:A",
    });

    const rows = response.data.values;
    let lastId = 0;

    if (rows && rows.length > 1) {
      lastId = rows.length - 1;
    }

    const newId = lastId + 1;
    const currentDate = new Date().toLocaleDateString("es-AR").slice(0, 10);
    const currentTime = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const statePayment = "Completada";

    const ventaData = productos.map((prod) => [
      newId,
      prod.id,
      nombreCliente,
      prod.cantidad,
      prod.precio,
      formaPago,
      statePayment,
      prod.cantidad * prod.precio,
      currentDate,
      currentTime,
    ]);

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J",
      valueInputOption: "RAW",
      resource: {
        values: ventaData,
      },
    });

    for (const prod of productos) {
      const amount = parseInt(prod.cantidad);
      if (amount > 0) {
        await decreaseStock(auth, prod.id, amount);
      }
    }

    return { message: "Venta registrada exitosamente", data: res.data };
  } catch (error) {
    console.error("Error registrando la venta:", error);
    throw new Error(`Error registrando la venta: ${error.message}`);
  }
}

async function getSaleDataUnitiInfo(auth, id) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener ventas
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J",
    });
    const rows = res.data.values || [];

    // Obtener usuarios
    const users = await getUser(auth);

    const sales = rows
      .filter((row) => row[0] === id.toString())
      .map((row) => {
        const clienteId = row[2]; // ID del cliente
        const user = users.find((user) => user.uid === clienteId);
        const clienteNombre = user ? user.nombre : "Desconocido"; // Nombre del cliente

        // Inicializamos el objeto de la venta
        let saleData = {
          id: row[0],
          idProducto: row[1],
          idCliente: clienteId,
          cliente: clienteNombre,
          cantidad: parseInt(row[3]),
          subtotal: parseFloat(row[4]),
          pago: row[5],
          estadoPago: row[6],
          total: parseFloat(row[7]),
          fecha: row[8],
          hora: row[9],
        };

        return saleData;
      });

    return sales;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

async function getSaleData(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener las ventas
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J",
    });
    const rows = res.data.values || [];

    // Obtener los usuarios
    const users = await getUser(auth); // Usamos la función getUser para obtener los usuarios

    // Crear un array para almacenar los datos de las ventas
    const salesData = rows.map((row) => {
      const clienteId = row[2]; // Asumiendo que el ID del cliente está en la columna 3 (índice 2)
      const user = users.find((user) => user.uid === clienteId); // Buscar el usuario por uid
      const clienteNombre = user ? user.nombre : "Desconocido"; // Si no encuentra el nombre, poner "Desconocido"

      return {
        id: row[0],
        idProducto: row[1],
        idCliente: row[2],
        cliente: clienteNombre,
        cantidad: parseInt(row[3]),
        subtotal: parseFloat(row[4]),
        pago: row[5],
        estadoPago: row[6],
        total: parseFloat(row[7]),
        fecha: row[8],
        hora: row[9],
      };
    });

    return { salesData, lastId: rows.length };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error retrieving sales data");
  }
}

async function putSaleChangeState(auth, id, state) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener todos los datos de la hoja
  const { salesData } = await getSaleData(auth);

  // Filtrar todas las filas que coincidan con el ID proporcionado
  const rowsToUpdate = salesData.filter((sale) => sale.id === id);

  if (rowsToUpdate.length === 0) {
    throw new Error("ID not found");
  }

  // Corregir el valor de 'state' si es necesario
  const correctedState = state === "Enproceso" ? "En proceso" : state;

  // Obtener el ID de la hoja de cálculo
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  });

  const sheet = sheetInfo.data.sheets.find(
    (s) => s.properties.title === "Ventas" // Asegúrate de que este sea el nombre correcto de tu hoja
  );

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  const sheetId = sheet.properties.sheetId;

  // Crear las solicitudes de actualización para todas las filas coincidentes
  const requests = rowsToUpdate.map((sale) => {
    const rowIndex = salesData.indexOf(sale);
    return {
      updateCells: {
        range: {
          sheetId: sheetId, // Usamos el sheetId obtenido
          startRowIndex: rowIndex + 1, // +1 porque las filas en Google Sheets empiezan en 1
          endRowIndex: rowIndex + 2,
          startColumnIndex: 9, // Columna del estadoPago (columna J)
          endColumnIndex: 10,
        },
        rows: [
          {
            values: [
              {
                userEnteredValue: {
                  stringValue: correctedState,
                },
              },
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    };
  });

  // Ejecutar la actualización
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    resource: {
      requests,
    },
  });

  return res.data;
}

async function getSalesByDate(auth, date) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J", // Ajusta el rango según tu hoja de ventas
    });

    const rows = res.data.values || [];

    // Filtrar las ventas que coinciden con la fecha
    const salesForDate = rows
      .filter((row) => row[10] === date)
      .map((row) => row[0]);

    return salesForDate;
  } catch (error) {
    console.error("Error obteniendo ventas por fecha:", error);
    throw new Error("Error obteniendo ventas por fecha");
  }
}

async function getSaleByUserId(auth, uid) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J", // Ajusta el rango según tu hoja de ventas
    });

    const rows = res.data.values || [];

    // Filtrar las ventas que coinciden con el uid en la columna "cliente"
    const salesForUser = rows.filter((row) => row[2] === uid);

    // Obtener la información del producto para cada venta
    const salesData = await Promise.all(
      salesForUser.map(async (row) => {
        const product = await getSheetDataById(Number(row[1]), auth); // Convertir productId a número
        return {
          id: row[0],
          productId: row[1],
          clientId: row[2],
          quantity: row[3],
          price: row[4],
          paymentMethod: row[5],
          status: row[6],
          totalPrice: row[7],
          date: row[8],
          time: row[9],
          product, // Añadir la información del producto
        };
      })
    );

    return salesData;
  } catch (error) {
    console.error("Error obteniendo ventas por UID:", error);
    throw new Error("Error obteniendo ventas por UID");
  }
}

async function increaseStock(auth, productId, amount) {
  const sheets = google.sheets({ version: "v4", auth });
  const { products } = await getSheetData(auth);
  const rowIndex = products.findIndex((row) => row.id === productId);
  if (rowIndex === -1) {
    throw new Error("ID no encontrado");
  }
  // Convertir cantidad a número y sumarle la cantidad a aumentar
  const currentAmount = parseInt(products[rowIndex].cantidad) || 0;
  products[rowIndex].cantidad = currentAmount + amount;

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `Productos!A${rowIndex + 2}:J${rowIndex + 2}`,
    valueInputOption: "RAW",
    resource: {
      values: [Object.values(products[rowIndex])],
    },
  });
  return res.data;
}

async function decreaseStock(auth, productId, amount) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener los datos actuales de los productos
  const { products } = await getSheetData(auth);

  // Buscar la fila correspondiente al ID del producto
  const rowIndex = products.findIndex((row) => row.id === productId);
  if (rowIndex === -1) {
    throw new Error("ID no encontrado");
  }

  // Obtener el stock actual y disminuirlo
  const currentAmount = parseInt(products[rowIndex].stock) || 0;
  const newStock = currentAmount - amount;

  if (newStock < 0) {
    throw new Error("Stock insuficiente");
  }

  // Actualizar solo la columna del stock
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `Productos!F${rowIndex + 2}`, // Asegúrate de que la columna de stock sea la columna G (ajusta si es diferente)
    valueInputOption: "RAW",
    resource: {
      values: [[newStock]],
    },
  });

  return res.data;
}

async function deleteSalesById(auth, id) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener todos los datos de la hoja
  const { salesData } = await getSaleData(auth);

  // Filtrar todas las filas que coincidan con el ID proporcionado
  const rowsToUpdate = salesData.filter((sale) => sale.id === id);

  if (rowsToUpdate.length === 0) {
    throw new Error("ID not found");
  }

  // Estado al que queremos cambiar
  const canceledState = "Anulado";

  // Obtener el ID de la hoja de cálculo
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  });

  const sheet = sheetInfo.data.sheets.find(
    (s) => s.properties.title === "Ventas" // Asegúrate de que este sea el nombre correcto de tu hoja
  );

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  const sheetId = sheet.properties.sheetId;

  // Crear las solicitudes de actualización para todas las filas coincidentes
  const requests = rowsToUpdate.map((sale) => {
    const rowIndex = salesData.indexOf(sale);
    return {
      updateCells: {
        range: {
          sheetId: sheetId, // Usamos el sheetId obtenido
          startRowIndex: rowIndex + 1, // +1 porque las filas en Google Sheets empiezan en 1
          endRowIndex: rowIndex + 2,
          startColumnIndex: 9, // Columna del estadoPago (columna J)
          endColumnIndex: 10,
        },
        rows: [
          {
            values: [
              {
                userEnteredValue: {
                  stringValue: canceledState,
                },
              },
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    };
  });

  // Ejecutar la actualización
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    resource: {
      requests,
    },
  });

  return res.data;
}

async function getCashFlow(auth, date = null) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const cashFlowRange = "FlujoDeCaja!A2:I";

    // 1. Obtener los datos del flujo de caja
    const resCashFlow = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: cashFlowRange,
    });

    const rowsCashFlow = resCashFlow.data.values || [];
    let lastId =
      rowsCashFlow.length > 0
        ? parseInt(rowsCashFlow[rowsCashFlow.length - 1][0])
        : 0;
    let saldoAcumulado =
      rowsCashFlow.length > 0
        ? parseFloat(rowsCashFlow[rowsCashFlow.length - 1][8])
        : 0;

    const cashFlowData = [];
    const cajaInicialData = []; // Array para almacenar las entradas del tipo "Caja Inicial"
    let cajaInicialMañana = 0;
    let cajaInicialTarde = 0;

    // Procesar cada fila del flujo de caja
    rowsCashFlow.forEach((row) => {
      const tipo = row[1];
      const monto = parseFloat(row[2]);
      const descripcion = row[3];
      const fecha = row[4];
      const hora = row[5];
      const periodo = row[6];
      const cajaInicial = parseFloat(row[7]) || 0;
      const cajaFinal = parseFloat(row[8]) || 0;

      if (tipo.toLowerCase() === "caja inicial") {
        cajaInicialData.push({
          id: row[0],
          tipo: tipo,
          monto: monto,
          descripcion: descripcion,
          fecha: fecha,
          hora: hora,
          periodo: periodo,
          cajaInicial: cajaInicial,
          cajaFinal: cajaFinal,
        });

        if (periodo.toLowerCase() === "mañana") {
          cajaInicialMañana = monto;
        } else if (periodo.toLowerCase() === "tarde") {
          cajaInicialTarde = monto;
        }
      } else {
        if (tipo.toLowerCase() === "ingreso") {
          saldoAcumulado += monto;
        } else if (tipo.toLowerCase() === "gasto") {
          saldoAcumulado -= monto;
        }

        cashFlowData.push({
          id: row[0],
          tipo: tipo,
          monto: monto,
          descripcion: descripcion,
          fecha: fecha,
          hora: hora,
          periodo: periodo,
          cajaInicial: cajaInicial,
          cajaFinal: cajaFinal,
        });
      }
    });

    // 2. Obtener los datos de la hoja de ventas
    const resVentas = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J", // Ajusta el rango según tus columnas
    });

    const rowsVentas = resVentas.data.values || [];

    // Procesar cada fila de ventas y añadirlas como ingresos
    const ventasData = rowsVentas
      .map((ventaRow, index) => {
        // Verificar si la columna 9 contiene "pendiente" (sin importar mayúsculas o minúsculas)
        if (ventaRow[9].toLowerCase() === "pendiente") {
          return null; // Saltear esta fila
        }

        const id = lastId + index + 1; // Incrementar el ID para las nuevas filas
        const total = parseFloat(ventaRow[10]); // Ajusta el índice según la columna de 'Total'
        const descripcion = `Venta Producto: ${ventaRow[3]}, Cliente: ${ventaRow[2]}`; // Ajusta los índices según tus columnas
        const fechaVenta = ventaRow[11]; // Ajusta el índice según la columna de 'Fecha'
        const horaVenta = ventaRow[12]; // Ajusta el índice según la columna de 'Hora'

        // Sumar el total de la venta al saldo acumulado
        saldoAcumulado += total;

        return {
          id: id.toString(),
          tipo: "Ingreso", // Todas las ventas se consideran como ingresos
          monto: total,
          descripcion: descripcion,
          fecha: fechaVenta,
          hora: horaVenta, // Registrar la hora de la venta
          periodo: "", // Puedes asignar el periodo si es necesario
          cajaInicial: saldoAcumulado - total, // Caja inicial antes de esta venta
          cajaFinal: saldoAcumulado, // Caja final actualizada
        };
      })
      .filter((venta) => venta !== null); // Filtrar las filas que fueron saltadas

    // 3. Combinar flujo de caja existente con las ventas
    const allCashFlowData = [
      ...cashFlowData,
      ...ventasData,
      ...cajaInicialData,
    ]; // Incluir los datos de "Caja Inicial"

    // 4. Calcular la caja inicial del día siguiente
    const cajaInicialDiaSiguiente =
      cajaInicialTarde > 0 ? cajaInicialTarde : cajaInicialMañana;

    return {
      cashFlowData: allCashFlowData,
      lastId: lastId + rowsVentas.length,
      cajaInicialMañana,
      cajaInicialTarde,
      cajaInicialDiaSiguiente,
    };
  } catch (error) {
    console.error("Error al obtener el flujo de caja:", error.message);
    throw new Error("Error al obtener el flujo de caja");
  }
}

async function addCashFlowEntry(auth, data) {
  try {
    const { tipo, monto, descripcion, fecha, periodo } = data;
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "FlujoDeCaja!A:A",
    });

    const rows = response.data.values || [];
    let lastId =
      rows.length > 1 ? parseInt(rows[rows.length - 1][0], 10) || 0 : 0;

    // Obtener saldo acumulado y caja inicial del último movimiento del periodo específico
    const lastRowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `FlujoDeCaja!G2:H${rows.length + 1}`,
    });

    const lastRowData = lastRowResponse.data.values || [];
    let saldoAcumulado =
      lastRowData.length > 0
        ? parseFloat(lastRowData[lastRowData.length - 1][1]) || 0
        : 0;
    let cajaInicial = 0;

    if (tipo === "Caja Inicial") {
      lastId += 1;
      cajaInicial = parseFloat(monto);

      // Crear una nueva fila con todos los datos y actualizar la columna "Caja inicial"
      const newRow = [
        lastId,
        tipo,
        cajaInicial,
        descripcion,
        fecha,
        hora,
        periodo,
        cajaInicial, // Caja inicial
        saldoAcumulado, // Caja final (puede estar en 0 o depender de lógica adicional)
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: "FlujoDeCaja!A:I",
        valueInputOption: "RAW",
        resource: { values: [newRow] },
      });

      return {
        id: newRow[0],
        tipo,
        monto,
        descripcion,
        fecha,
        hora,
        periodo,
        cajaInicial: newRow[7],
        cajaFinal: newRow[8],
      };
    }

    const newSaldoAcumulado =
      tipo === "Ingreso"
        ? saldoAcumulado + parseFloat(monto)
        : saldoAcumulado - parseFloat(monto);

    const newRow = [
      lastId + 1,
      tipo,
      parseFloat(monto),
      descripcion,
      fecha,
      hora,
      periodo,
      cajaInicial,
      newSaldoAcumulado,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "FlujoDeCaja!A:I",
      valueInputOption: "RAW",
      resource: { values: [newRow] },
    });

    return {
      id: newRow[0],
      tipo,
      monto,
      descripcion,
      fecha,
      hora,
      periodo,
      cajaInicial,
      cajaFinal: newSaldoAcumulado,
    };
  } catch (error) {
    console.error("Error agregando el movimiento:", error);
    throw new Error("Error agregando el movimiento al flujo de caja");
  }
}

async function appendRowPayment(auth, rowData) {
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "PagosMp!A2:M", // Ajusta el rango y hoja según corresponda
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [rowData],
    },
  });

  return res.data.updates;
}

module.exports = {
  authorize,
  registerSaleDashboard,
  getSaleData,
  getSaleDataUnitiInfo,
  getSalesByDate,
  increaseStock,
  decreaseStock,
  deleteSalesById,
  getCashFlow,
  addCashFlowEntry,
  appendRowPayment,
  getSaleByUserId,
  putSaleChangeState,
};
