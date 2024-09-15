const { Router } = require("express");
const {
  appendClient,
  getClients,
  getClientById,
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
module.exports = clientRoutes;
