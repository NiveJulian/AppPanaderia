const { Router } = require("express");
const {
  appendClient,
  getClients,
  getClientById,
  updateClient,
  getClientByUserID,
} = require("../Controllers/sheets/clientController");
const { authorize } = require("../Controllers/sheets/sheetsController");
const clientRoutes = Router();

clientRoutes.post("/", async (req, res) => {
  try {
    const data = req.body;
    const auth = await authorize();
    const clientData = await appendClient(auth, data);
    return res.status(200).json(clientData);
  } catch (error) {
    console.log({ error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

clientRoutes.get("/data", async (req, res) => {
  try {
    const auth = await authorize();
    const data = await getClients(auth);
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

clientRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const auth = await authorize();
    const client = await getClientById(auth, id);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(client);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

let salesCache = {};

clientRoutes.get("/user/:uid", async (req, res) => {
  const { uid } = req.params;

  // Verifica si ya tenemos los datos en la caché
  if (salesCache[uid]) {
    return res.status(200).json(salesCache[uid]);
  }

  try {
    const auth = await authorize();
    const client = await getClientByUserID(auth, uid);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Almacenar los datos en la caché por un período de tiempo
    salesCache[uid] = client;
    setTimeout(() => delete salesCache[uid], 60000); // Limpiar la caché después de 1 minuto

    res.status(200).json(client);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

clientRoutes.get("/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const auth = await authorize();
    const client = await getClientByName(auth, name);
    res.status(200).json(client);
  } catch (error) {
    console.log({ error: error.message });
    res.status(404).json({ error: error.message });
  }
});

clientRoutes.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const auth = await authorize();
    const client = await updateClient(auth, id, data);
    res.status(200).json(client);
  } catch (error) {
    console.log({ error: error.message });
    res.status(404).json({ error: error.message });
  }
});
module.exports = clientRoutes;
