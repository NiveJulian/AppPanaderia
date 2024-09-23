const { Router } = require("express");
const generateSaleTicket = require("../Controllers/ticket/generateSaleTicket");
const ticketRoutes = Router();

ticketRoutes.post("/generate-ticket", (req, res) => {
    try {
      const data = req.body;
      generateSaleTicket(data, res);
    } catch (error) {
      console.log({ error: error.message });
      return res.status(500).json({ error: error.message });
    }
  });
  

module.exports = ticketRoutes;
