const { google } = require("googleapis");

async function getSheetData(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Productos!A2:J",
    });
    const rows = res.data.values || []; // Asegúrate de que 'rows' sea un array vacío si no hay datos

    let lastId = 0;
    if (rows.length > 0) {
      lastId = parseInt(rows[rows.length - 1][0]);
    }

    const products = rows.map((row) => {
      const product = {
        id: row[0],
        categoria: row[1],
        nombre: row[2],
        color: row[3],
        talle: row[4],
        stock: parseInt(row[5]),
        precio: parseInt(row[6]),
        url: row[7],
        sku: row[8],
        publicado: row[9],
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
      range: "Productos!A2:J",
    });
    const rows = res.data.values || [];

    const products = rows.map((row) => ({
      id: row[0],
      categoria: row[1],
      nombre: row[2],
      color: row[3],
      talle: row[4],
      cantidad: row[5],
      precio: row[6],
      url: row[7],
      sku: row[8],
      publicado: row[9],
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

function generateSKU(category, name, color, count) {
  const categoryInitial = category.charAt(0).toLowerCase();
  const nameInitial = name.charAt(0).toLowerCase();
  const colorInitial = color.charAt(0).toLowerCase();
  const skuNumber = String(count).padStart(4, "0");
  return `${categoryInitial}-${nameInitial}-${colorInitial}-${skuNumber}`;
}

async function appendRow(auth, rowData) {
  const sheets = google.sheets({ version: "v4", auth });
  const { rows, lastId } = await getSheetData(auth);
  const newId = lastId + 1;
  const { categoria, nombre, color, tamaño, cantidad, precio, url } = rowData;
  const sku = generateSKU(categoria, nombre, color, newId);
  const urlString = Array.isArray(url) ? url.join(", ") : url;
  const publicadoValue = "no"; // Nueva variable para el valor de publicado
  const newRow = [
    newId,
    categoria,
    nombre,
    color,
    tamaño,
    stock,
    precio,
    urlString,
    sku,
    publicadoValue, // Usar la nueva variable aquí
  ];
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Productos!A2:J",
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

  // Convertir el array de URLs en una cadena, si es necesario
  const urlString = Array.isArray(rowData.url)
    ? rowData.url.join(", ")
    : rowData.url;

  // Construir la fila actualizada con los datos de rowData
  const updatedRow = [
    rowData.id,
    rowData.categoria,
    rowData.nombre,
    rowData.color,
    rowData.tamaño,
    rowData.cantidad,
    rowData.precio,
    urlString,
    rowData.sku,
    rowData.publicado,
  ];

  // Actualizar la fila en la hoja de cálculo
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `Productos!A${rowIndex + 2}:J${rowIndex + 2}`,
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
    range: "Productos!A:I", // Ajusta el rango según sea necesario
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

async function getProductsByCategory(auth, category) {
  try {
    const { products } = await getSheetData(auth);

    // Normaliza y elimina espacios en blanco de la categoría recibida
    const trimmedCategory = category
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Filtra los productos basándose en la categoría normalizada y en el estado de publicación
    const filteredProducts = products.filter((product) => {
      return (
        product.publicado === "si" &&
        product.categoria
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") === trimmedCategory
      );
    });

    // Si no se encuentran productos, lanzar un error personalizado
    if (filteredProducts.length === 0) {
      throw new Error("Producto no encontrado");
    }

    return { products: filteredProducts };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getAllCategories(auth) {
  try {
    const { products } = await getSheetData(auth);

    // Filtra las categorías de los productos que están en publicado = "si"
    const normalizedCategories = products
      .filter((product) => product.publicado === "si")
      .map((product) =>
        product.categoria
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      );

    const categories = [...new Set(normalizedCategories)];

    return categories;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getAllColors(auth) {
  try {
    const { products } = await getSheetData(auth);

    console.log(products);

    const colors = [
      ...new Set(
        products
          .filter((product) => product.publicado === "si")
          .flatMap((product) => {
            const colorList = product.color
              .trim()
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");

            return colorList.includes(",") ? colorList.split(",") : [colorList];
          })
      ),
    ];

    return colors;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getProductsByColor(auth, color) {
  try {
    const { products } = await getSheetData(auth);

    const trimmedColor = color
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const filteredProducts = products
      .filter((product) => product.publicado === "si")
      .filter((product) => {
        const colorList = product.color
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        return colorList.includes(",")
          ? colorList.split(",").includes(trimmedColor)
          : colorList === trimmedColor;
      });

    if (filteredProducts.length === 0) {
      throw new Error("Producto no encontrado");
    }

    return { products: filteredProducts };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function activeProductById(auth, id) {
  const sheets = google.sheets({ version: "v4", auth });

  // Obtener todos los datos de la hoja
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: "Productos!A:J", // Ajusta el rango para incluir hasta la columna J
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
  getProductsByCategory,
  getAllCategories,
  getAllColors,
  getProductsByColor,
  activeProductById,
};
