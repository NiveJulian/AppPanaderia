const { google } = require("googleapis");
const { auth } = require("googleapis/build/src/apis/abusiveexperiencereport");
const { getClientById } = require("./clientController");

async function getSheetData(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Productos!A2:F",
    });
    const rows = res.data.values || []; // Asegura que 'rows' sea un array vacío si no hay datos.

    let lastId = 0;
    if (rows.length > 0) {
      lastId = parseInt(rows[rows.length - 1][0]);
    }

    const products = await Promise.all(
      rows.map(async (row) => {
        let clientName = "";

        if (row[5]) {
          // Verifica si el ID de cliente existe y no está vacío
          const client = await getClientById(auth, row[5]);
          clientName = client?.nombre || "";
        }

        // Crea el objeto de producto con o sin cliente
        const product = {
          id: row[0],
          nombre: row[1],
          stock: parseInt(row[2]),
          precio: parseInt(row[3]),
          publicado: row[4],
          client: clientName,
        };

        // Filtra los valores vacíos o indefinidos
        return Object.fromEntries(
          Object.entries(product).filter(
            ([_, value]) => value !== undefined && value !== ""
          )
        );
      })
    );

    return { products, lastId };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getProductByClientID(auth, clientId) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Productos!A2:F",
    });
    const rows = res.data.values || [];

    let lastId = 0;
    if (rows.length > 0) {
      lastId = parseInt(rows[rows.length - 1][0]);
    }

    const productMap = {};

    await Promise.all(
      rows.map(async (row) => {
        let client = null;

        if (row[5]) {
          client = await getClientById(auth, row[5]);
        }

        // Crea el objeto de producto con o sin cliente
        const product = {
          id: row[0],
          nombre: row[1],
          stock: parseInt(row[2]),
          precio: parseInt(row[3]),
          publicado: row[4],
          clientId: client?.id || null,
          clientName: client?.nombre || null,
        };

        if (productMap[product.nombre]) {
          if (product.clientId === clientId) {
            productMap[product.nombre] = product;
          }
        } else {
          productMap[product.nombre] = product;
        }
      })
    );

    const products = Object.values(productMap);

    return { products, lastId };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getSheetDataById(id, auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Productos!A2:E",
    });
    const rows = res.data.values || [];

    const products = rows.map((row) => ({
      id: row[0],
      nombre: row[1],
      stock: row[2],
      precio: row[3],
      publicado: row[4],
    }));

    const product = products.find((product) => product.id === id.toString());

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    return product;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

async function appendRow(auth, rowData) {
  const sheets = google.sheets({ version: "v4", auth });
  const { lastId } = await getSheetData(auth);
  const newId = lastId + 1;
  const { nombre, stock, precio, clientId } = rowData;
  const publicadoValue = "no"; // Nueva variable para el valor de publicado
  const newRow = [newId, nombre, stock, precio, publicadoValue, clientId || ""];
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Productos!A2:E",
    valueInputOption: "RAW",
    resource: {
      values: [newRow],
    },
  });
  return res.data.updates;
}

async function updateRow(auth, rowData) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener los datos actuales de la hoja
  const { products } = await getSheetData(auth);

  // Buscar el índice de la fila correspondiente usando el ID
  const rowIndex = products.findIndex((product) => product.id === rowData.id);

  // Lanzar un error si el ID no se encuentra
  if (rowIndex === -1) {
    throw new Error("ID no encontrado");
  }

  // Construir la fila actualizada con los datos de rowData
  const updatedRow = [
    rowData.id,
    rowData.nombre,
    rowData.stock,
    rowData.precio,
    rowData.publicado,
  ];

  // Actualizar la fila en la hoja de cálculo
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `Productos!A${rowIndex + 2}:E${rowIndex + 2}`,
    valueInputOption: "RAW",
    resource: {
      values: [updatedRow],
    },
  });

  return res.data;
}

async function deleteRowById(auth, id) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener todos los datos de la hoja
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Productos!A:E", // Ajusta el rango según sea necesario
  });

  const rows = getRows.data.values;
  let rowIndexToDelete = null;

  // Encontrar la fila con el ID proporcionado
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] == id) {
      // Asumiendo que la columna ID es la primera (A)
      rowIndexToDelete = i;
      break;
    }
  }

  if (rowIndexToDelete === null) {
    throw new Error("ID not found");
  }

  // Eliminar la fila encontrada
  const requests = [
    {
      deleteDimension: {
        range: {
          sheetId: 0, // Asegúrate de que este sea el ID correcto de la hoja
          dimension: "ROWS",
          startIndex: rowIndexToDelete,
          endIndex: rowIndexToDelete + 1,
        },
      },
    },
  ];

  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    resource: {
      requests,
    },
  });

  return res.data;
}

async function activeProductById(auth, id) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener todos los datos de la hoja
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Productos!A:E", // Ajusta el rango para incluir hasta la columna J
  });

  const rows = getRows.data.values;
  let rowIndexToUpdate = null;

  // Encontrar la fila con el ID proporcionado
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] == id) {
      // Asumiendo que la columna ID es la primera (A)
      rowIndexToUpdate = i;
      break;
    }
  }

  if (rowIndexToUpdate === null) {
    throw new Error("ID not found");
  }

  // Obtener el valor actual de la columna "Publicado" (columna J, índice 9)
  const currentPublishedValue = rows[rowIndexToUpdate][9];
  const newPublishedValue = currentPublishedValue === "si" ? "no" : "si"; // Alternar entre "si" y "no"

  // Actualizar la celda con el nuevo valor
  const updateResponse = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `Productos!J${rowIndexToUpdate + 1}`, // J es la columna 10, sumamos 1 al índice para la referencia en Sheets
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[newPublishedValue]],
    },
  });

  // Determinar el estado de "Publicado" y enviar el mensaje correspondiente
  const statusMessage =
    newPublishedValue === "si" ? "publicado" : "no publicado";

  return {
    message: `El producto cambio a ${statusMessage}.`,
    updateResponse: updateResponse.data,
  };
}

async function createProductoByClientId(auth, body, id) {
  try {
    const client = await getClientById(auth, id);
    const clientId = client.id;

    const newProduct = {
      ...body,
      clientId,
    };

    // Obtener los productos actuales
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Productos!A2:F",
    });
    const rows = res.data.values || [];

    // Buscar el índice del producto con el mismo nombre y clientId
    const existingProductIndex = rows.findIndex(
      (row) => row[1] === newProduct.nombre && row[5] === clientId
    );

    if (existingProductIndex !== -1) {
      // Si el producto ya existe, actualízalo con los nuevos datos
      const range = `Productos!A${existingProductIndex + 2}:F${
        existingProductIndex + 2
      }`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              newProduct.id || rows[existingProductIndex][0], // ID del producto
              newProduct.nombre,
              newProduct.stock || rows[existingProductIndex][2], // Stock
              newProduct.precio || rows[existingProductIndex][3], // Precio
              newProduct.publicado || rows[existingProductIndex][4], // Publicado
              newProduct.clientId,
            ],
          ],
        },
      });
      return { message: "Producto actualizado correctamente" };
    } else {
      // Si el producto no existe, agrégalo
      const result = await appendRow(auth, newProduct);
      return result;
    }
  } catch (error) {
    console.error("Error al crear o actualizar el producto:", error.message);
    throw new Error(error.message);
  }
}

module.exports = {
  getSheetData,
  getSheetDataById,
  appendRow,
  updateRow,
  deleteRowById,
  activeProductById,
  createProductoByClientId,
  getProductByClientID,
};
