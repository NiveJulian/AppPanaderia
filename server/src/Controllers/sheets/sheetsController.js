require("dotenv").config();
const { google } = require("googleapis");
const { getUser } = require("../user/userController");
const { getSheetData, getSheetDataById } = require("./productController");
const { getClients, getClientById } = require("./clientController");

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

    const { productos, formaPago, total, idCliente } = data;

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

    const cliente = await getClientById(auth, idCliente);

    const ventaData = productos.map((prod) => [
      newId,
      prod.id,
      cliente.id,
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
      range: "Ventas!A2:J", // Rango de la hoja de ventas
    });
    const rows = res.data.values || [];

    // Obtener usuarios
    const users = await getClients(auth);

    // Obtener productos
    const { products } = await getSheetData(auth);

    // Filtrar y mapear ventas que coinciden con el ID del cliente
    const sales = rows
      .filter((row) => row[0] === id.toString()) // Filtrar por el ID del cliente
      .map((row) => {
        const clienteId = row[2]; // ID del cliente
        const user = users.find((user) => user.id === clienteId);
        const clienteNombre = user ? user.nombre : "Desconocido"; // Nombre del cliente
        const clienteCelular = user ? user.celular : ""; // Nombre del cliente

        // Buscar información del producto correspondiente
        const productId = row[1]; // ID del producto
        const product = products.find((prod) => prod.id === productId);
        const productName = product ? product.nombre : "Producto desconocido";
        const productPrice = product ? parseFloat(product.precio) : 0;

        // Inicializamos el objeto de la venta
        let saleData = {
          id: row[0],
          idProducto: productId,
          productoNombre: productName, // Nombre del producto
          productoPrecio: productPrice, // Precio del producto
          idCliente: clienteId,
          cliente: clienteNombre,
          celular: clienteCelular,
          cantidad: parseInt(row[3]), // Cantidad comprada
          subtotal: parseFloat(row[4]), // Subtotal de la venta
          pago: row[5], // Método de pago
          estadoPago: row[6], // Estado del pago
          total: parseFloat(row[7]), // Total de la compra
          fecha: row[8], // Fecha de la venta
          hora: row[9], // Hora de la venta
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
    const clientes = await getClients(auth); // Usamos la función getUser para obtener los usuarios

    const salesData = rows.map((row) => {
      const clienteId = row[2]; // Asumiendo que el ID del cliente está en la columna 3 (índice 2)
      const cliente = clientes.find((user) => user.id === clienteId); // Buscar el usuario por uid
      const clienteNombre = cliente ? cliente.nombre : "Desconocido"; // Si no encuentra el nombre, poner "Desconocido"
      const clienteCelular = cliente ? cliente.celular : ""; // Si no encuentra el nombre, poner "Desconocido"
      

      return {
        id: row[0],
        idProducto: row[1],
        idCliente: row[2],
        cliente: clienteNombre,
        celular: clienteCelular || "",
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

async function getWeeklySalesByClient(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener los datos de las ventas desde la hoja "Ventas"
    const salesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J", // Ajusta el rango si es necesario
    });
    const salesRows = salesRes.data.values || [];

    if (salesRows.length === 0) {
      return []; // No hay ventas
    }

    // Función para convertir fecha en formato "dd/mm/yyyy" a un objeto Date
    function parseDate(dateString) {
      const [day, month, year] = dateString.split("/");
      return new Date(`${year}-${month}-${day}`);
    }

    // Ordenar las ventas por fecha
    salesRows.sort((a, b) => parseDate(a[8]) - parseDate(b[8]));

    // Crear una lista para almacenar los resultados
    const weeklySalesData = [];

    let currentStartDate = parseDate(salesRows[0][8]); // La primera fecha de venta
    currentStartDate.setHours(0, 0, 0, 0); // Ajustar a medianoche para precisión
    let currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentEndDate.getDate() + 6); // Intervalo de 7 días

    // Crear un objeto para almacenar el total de ventas por cliente y por semana
    const weeklySalesByClient = {};

    // Iterar sobre las ventas para agrupar y sumar los totales en intervalos de 7 días
    for (const row of salesRows) {
      const saleDate = parseDate(row[8]); // Fecha de la venta
      const totalSale = parseFloat(row[7]); // Total de la venta
      const clientId = row[2];

      // Verificar si la fecha de la venta está dentro del intervalo actual
      if (saleDate >= currentStartDate && saleDate <= currentEndDate) {
        if (!weeklySalesByClient[clientId]) {
          weeklySalesByClient[clientId] = {};
        }
        const weekKey = `${currentStartDate.toISOString()}-${currentEndDate.toISOString()}`;

        if (!weeklySalesByClient[clientId][weekKey]) {
          weeklySalesByClient[clientId][weekKey] = 0;
        }

        weeklySalesByClient[clientId][weekKey] += totalSale;
      } else {
        // Guardar los datos del intervalo actual en el array
        for (const clientId in weeklySalesByClient) {
          for (const weekKey in weeklySalesByClient[clientId]) {
            const clientData = await getClientById(auth, clientId); // Obtener datos del cliente

            weeklySalesData.push({
              ...clientData, // Añadir los datos del cliente
              weekStart: weekKey.split("-")[0],
              weekEnd: weekKey.split("-")[1],
              totalSales: weeklySalesByClient[clientId][weekKey],
            });
          }
        }

        // Reiniciar el intervalo
        currentStartDate = parseDate(row[8]);
        currentStartDate.setHours(0, 0, 0, 0);
        currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() + 6);

        // Acumular el total de ventas para el nuevo intervalo
        if (!weeklySalesByClient[clientId]) {
          weeklySalesByClient[clientId] = {};
        }

        const weekKey = `${currentStartDate.toISOString()}-${currentEndDate.toISOString()}`;

        if (!weeklySalesByClient[clientId][weekKey]) {
          weeklySalesByClient[clientId][weekKey] = 0;
        }

        weeklySalesByClient[clientId][weekKey] += totalSale;
      }
    }

    // Guardar los datos del último intervalo en el array
    for (const clientId in weeklySalesByClient) {
      for (const weekKey in weeklySalesByClient[clientId]) {
        const clientData = await getClientById(auth, clientId); // Obtener datos del cliente

        // Extraer la parte inicial y final del weekKey
        const [startDate, endDate] = weekKey.split("Z-");

        // Obtener solo el día de inicio y final
        const weekStart = startDate.split("-")[2].split("T")[0]; // Día de weekStart
        const weekEnd = endDate.split("-")[2].split("T")[0]; // Día de weekEnd

        weeklySalesData.push({
          ...clientData, // Añadir los datos del cliente
          weekStart, // Día de la fecha inicial
          weekEnd, // Día de la fecha final
          totalSales: weeklySalesByClient[clientId][weekKey],
        });
      }
    }

    return weeklySalesData;
  } catch (error) {
    console.error({ error: error.message });
    throw new Error("Error retrieving weekly sales data");
  }
}

async function putSaleChangeState(auth, id, state) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener todos los datos de la hoja
  const { salesData } = await getSaleData(auth);

  // Buscar la fila que coincida con el ID proporcionado
  const saleRow = salesData.find((sale) => sale.id === id);

  if (!saleRow) {
    throw new Error("ID no encontrado");
  }

  // Corregir el valor de 'state' si es necesario
  const correctedState = state === "Enproceso" ? "En proceso" : state;

  // Obtener el índice de la fila en la que está la venta (considerando que salesData es un array de filas)
  const rowIndex = salesData.indexOf(saleRow);

  // Usamos el índice de la fila para actualizar solo la columna del estado de pago
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `Ventas!G${rowIndex + 2}`, // Suponiendo que "Estado Pedido" está en la columna G (índice 6)
    valueInputOption: "RAW",
    resource: {
      values: [[correctedState]],
    },
  });

  console.log(
    `Estado de la venta con ID ${id} actualizado a "${correctedState}"`
  );
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

async function getSaleByClientId(auth, id) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Ventas!A2:J", // Ajusta el rango según tu hoja de ventas
    });

    const rows = res.data.values || [];

    // Filtrar las ventas que coinciden con el id en la columna "cliente"
    const salesForUser = rows.filter((row) => row[2] === id);

    if (salesForUser.length === 0) {
      return { message: "No sales found for this user" };
    }

    // Obtener la información del cliente solo una vez
    const client = await getClientById(auth, id);

    // Inicializar arrays para almacenar productos, cantidades, fechas y horas
    const products = [];
    const quantities = [];
    const paymentMethods = new Set(); // Para asegurarnos de que el método de pago sea único
    const dates = []; // Array para almacenar fechas de cada venta
    const times = []; // Array para almacenar horas de cada venta
    let totalPrice = 0;
    let status = "";

    // Recorrer todas las ventas del cliente
    for (const row of salesForUser) {
      const product = await getSheetDataById(Number(row[1]), auth); // Obtener info del producto

      // Añadir información a los arrays
      products.push(product);
      quantities.push(row[3]);

      // Asignar otros datos solo una vez (suponiendo que son iguales en todas las ventas)
      paymentMethods.add(row[5]);
      status = row[6];
      totalPrice += parseFloat(row[7]); // Sumar al total el precio

      // Agregar la fecha y hora de cada venta
      dates.push(row[8]); // Almacenar cada fecha
      times.push(row[9]); // Almacenar cada hora
    }

    // Devolver la información estructurada
    return {
      client: {
        nombre: client.nombre,
        celular: client.celular,
      },
      products,
      quantities,
      paymentMethods: [...paymentMethods], // Convertir Set a array
      status,
      totalPrice,
      dates, // Devolver array con fechas de cada venta
      times, // Devolver array con horas de cada venta
    };
  } catch (error) {
    console.error("Error obteniendo ventas por UID:", error);
    throw new Error("Error obteniendo ventas por UID");
  }
}

async function getSaleByUserId(auth, uid) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetuid: process.env.GOOGLE_SHEETS_uid,
      range: "Ventas!A2:J", // Ajusta el rango según tu hoja de ventas
    });

    const rows = res.data.values || [];

    // Filtrar las ventas que coinciden con el id en la columna "cliente"
    const salesForUser = rows.filter((row) => row[2] === id);

    // Obtener la información del producto para cada venta
    const salesData = await Promise.all(
      salesForUser.map(async (row) => {
        const product = await getSheetDataById(Number(row[1]), auth); // Convertir productId a número
        return {
          id: row[0],
          productId: row[1],
          clientId: row[2],
          quantity: row[3],
          // price: row[4],
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
    range: `Productos!C${rowIndex + 2}`, // Asegúrate de que la columna de stock sea la columna C (ajusta si es diferente)
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
          startColumnIndex: 6, // Columna del estadoPago (columna J)
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
  getWeeklySalesByClient,
  getSaleDataUnitiInfo,
  getSalesByDate,
  increaseStock,
  decreaseStock,
  deleteSalesById,
  getCashFlow,
  addCashFlowEntry,
  appendRowPayment,
  getSaleByUserId,
  getSaleByClientId,
  putSaleChangeState,
};
