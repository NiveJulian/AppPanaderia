const { Router } = require("express");
const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  getClientByUserId,
  deleteClientAndProducts,
} = require("../Controllers/sheets/clientController");
const {
  authorize,
  getWeeklyAllSalesByClient,
} = require("../Controllers/sheets/sheetsController");
const clientRoutes = Router();

clientRoutes.post("/", async (req, res) => {
  try {
    const data = req.body;
    const clientData = await createClient(data);
    return res.status(200).json(clientData);
  } catch (error) {
    console.log({ error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

clientRoutes.get("/data", async (req, res) => {
  try {
    const data = await getClients();
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

clientRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getClientById(id);
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

  if (salesCache[uid]) {
    return res.status(200).json(salesCache[uid]);
  }

  try {
    const client = await getClientByUserId(uid);
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
    const client = await getClientByName(name);
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
    const client = await updateClient(id, data);
    res.status(200).json(client);
  } catch (error) {
    console.log({ error: error.message });
    res.status(404).json({ error: error.message });
  }
});

clientRoutes.get("/:id/ventas-por-semana", async (req, res) => {
  try {
    const { id } = req.params;
    const weeklySales = await getWeeklyAllSalesByClient(id);

    if (weeklySales.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron ventas para este cliente" });
    }

    res.status(200).json(weeklySales);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send("Error al obtener las ventas semanales");
  }
});

clientRoutes.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteClientAndProducts(id);
    res.status(200).json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = clientRoutes;
