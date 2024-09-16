const { google } = require("googleapis");

async function getSheetData(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Productos!A2:E",
    });
    const rows = res.data.values || []; // Asegúrate de que 'rows' sea un array vacío si no hay datos

    let lastId = 0;
    if (rows.length > 0) {
      lastId = parseInt(rows[rows.length - 1][0]);
    }

    const products = rows.map((row) => {
      const product = {
        id: row[0],
        nombre: row[1],
        stock: parseInt(row[2]),
        precio: parseInt(row[3]),
        publicado: row[4],
      };

      // Filtra las propiedades que no están vacías o undefined
      return Object.fromEntries(
        Object.entries(product).filter(
          ([_, value]) => value !== undefined && value !== ""
        )
      );
    });

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
  const { rows, lastId } = await getSheetData(auth);
  const newId = lastId + 1;
  const { nombre, stock, precio } = rowData;
  const publicadoValue = "no"; // Nueva variable para el valor de publicado
  const newRow = [
    newId,
    nombre,
    stock,
    precio,
    publicadoValue, // Usar la nueva variable aquí
  ];
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

module.exports = {
  getSheetData,
  getSheetDataById,
  appendRow,
  updateRow,
  deleteRowById,
  activeProductById,
};
