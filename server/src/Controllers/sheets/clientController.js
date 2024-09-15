const { google } = require("googleapis");

async function appendClient(auth, clientData) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener los datos existentes y el último ID
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Clientes!A2:D", // Asegúrate de que la hoja se llame "Cliente"
    });

    const rows = res.data.values || [];
    let lastId = 0;

    // Obtener el último ID
    if (rows.length > 0) {
      lastId = parseInt(rows[rows.length - 1][0]); // Suponiendo que la columna A tiene el ID
    }

    // Incrementar el nuevo ID
    const newId = lastId + 1;

    // Desestructurar los datos enviados desde el cliente
    const { nombre, direccion, celular } = clientData;

    // Crear una nueva fila con el nuevo ID, nombre y dirección
    const newRow = [newId, nombre, direccion, celular];

    // Agregar la nueva fila a la hoja de cálculo
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Clientes!A2:D", // Ajustar el rango a las columnas correspondientes
      valueInputOption: "RAW",
      resource: {
        values: [newRow],
      },
    });

    return appendRes.data.updates;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getClients(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Clientes!A2:D",
    });
    const rows = res.data.values || []; // Asegúrate de que 'rows' sea un array vacío si no hay datos

    let lastId = 0;
    if (rows.length > 0) {
      lastId = parseInt(rows[rows.length - 1][0]);
    }

    const clientes = rows.map((row) => {
      const product = {
        id: row[0],
        nombre: row[1],
        direccion: row[2],
        celular: row[3],
      };
      return product;
    });

    return clientes;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getClientById(auth, id) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Clientes!A2:D", // Asegúrate de que coincida con tu rango
    });
    const rows = res.data.values || [];

    // Buscar el cliente con el ID proporcionado
    const clientRow = rows.find((row) => row[0] === id);
    if (!clientRow) {
      return null; // Si no se encuentra el cliente
    }

    // Formatear los datos del cliente
    const client = {
      id: clientRow[0],
      nombre: clientRow[1],
      direccion: clientRow[2],
      celular: clientRow[3],
    };

    return client;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getClientByName(auth, clientName) {
  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Obtener los datos de los clientes
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Clientes!A2:D", // Ajusta el rango según tu hoja de clientes
    });

    const rows = res.data.values || [];

    // Buscar el cliente por nombre
    const client = rows.find(
      (row) => row[1].toLowerCase() === clientName.toLowerCase()
    );

    if (!client) {
      throw new Error(`Cliente con nombre '${clientName}' no encontrado`);
    }

    // Retornar la información del cliente
    return {
      id: client[0],
      nombre: client[1],
      direccion: client[2],
      celular: client[3],
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error retrieving client data by name");
  }
}

module.exports = {
  appendClient,
  getClients,
  getClientById,
  getClientByName,
};
