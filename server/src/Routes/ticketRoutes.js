const { Router } = require("express");
const ticketRouter = Router();
const generateSaleTicket = require("../Controllers/ticket/generateSaleTicket");
const generateWeeklySalesTicket = require("../Controllers/ticket/generateWeeklySalesTicket");

ticketRouter.get("/generate/:saleId", async (req, res) => {
  try {
    const { saleId } = req.params;
    
    // Aquí deberías obtener los datos de la venta desde la base de datos
    // Por ahora, usaremos datos de ejemplo
    const saleData = {
      clientName: "Cliente Ejemplo",
      contactNumber: "123456789",
      products: [
        { name: "Producto 1", unitPrice: 100, quantity: 2, subtotal: 200 },
        { name: "Producto 2", unitPrice: 150, quantity: 1, subtotal: 150 }
      ],
      total: 350
    };

    generateSaleTicket(saleData, res);
  } catch (error) {
    console.error("Error generating ticket:", error);
    res.status(500).json({ error: "Error generating ticket" });
  }
});

ticketRouter.post("/generate-weekly", async (req, res) => {
  try {
    const clientData = req.body;
    
    if (!clientData || !clientData.clientName) {
      return res.status(400).json({ error: "Datos del cliente requeridos" });
    }

    generateWeeklySalesTicket(clientData, res);
  } catch (error) {
    console.error("Error generating weekly sales ticket:", error);
    res.status(500).json({ error: "Error generating weekly sales ticket" });
  }
});

module.exports = ticketRouter;
