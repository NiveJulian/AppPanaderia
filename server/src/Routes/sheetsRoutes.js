const { Router } = require("express");
const sheetsRouter = Router();
const {
  increaseStock,
  deleteSalesById,
  getSaleData,
  getCashFlow,
  addCashFlowEntry,
  getSaleByUserId,
  registerSaleDashboard,
  putSaleChangeState,
  getSaleDataUnitiInfo,
  getWeeklySalesByClient,
  getSaleByClientId,
  getWeeklySalesByUser,
  getSaleById,
  getWeeklyAllSalesByClient,
} = require("../Controllers/sheets/sheetsController.js");
const {
  getSheetData,
  getSheetDataById,
  appendRow,
  updateRow,
  deleteRowById,
  createProductoByClientId,
  getProductByClientID,
  decreaseStock,
  checkProductSales,
  getProductsByUserClients,
} = require("../Controllers/sheets/productController.js");

sheetsRouter.get("/data/client/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getProductByClientID(id);
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/data", async (req, res) => {
  try {
    const data = await getSheetData();
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getSheetDataById(id);
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.post("/data", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const updates = await appendRow(data);
    res.json(updates);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.put("/update", async (req, res) => {
  try {
    const rowData = req.body;
    const result = await updateRow(rowData);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

sheetsRouter.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteRowById(id);
    res.status(200).json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.put("/product/:id", async (req, res) => {
  try {
    const rowIndex = parseInt(req.params.id, 10);
    const result = await activeProductById(rowIndex);
    res.status(200).json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.post("/product-client/:clientId", async (req, res) => {
  try {
    const body = req.body;
    const clientId = req.params.clientId;
    const result = await createProductoByClientId(body, clientId);
    res.status(200).json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.get("/sale", async (req, res) => {
  try {
    const sale = await getSaleData();
    console.log(sale);
    res.json(sale.salesData);
  } catch (error) {
    console.log({ errorSale: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const sales = await getSaleDataUnitiInfo(userId);

    if (sales.length === 0) {
      return res.status(404).json({ message: "Ventas no encontradas" });
    }

    res.json(sales);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sale/id/:id", async (req, res) => {
  try {
    const saleId = req.params.id;
    const sales = await getSaleById(saleId);

    if (sales.length === 0) {
      return res.status(404).json({ message: "Ventas no encontradas" });
    }

    res.json(sales);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(error.message);
  }
});

sheetsRouter.put("/sale/:id/changestate/:state", async (req, res) => {
  try {
    const { id, state } = req.params;
    const saleChanged = await putSaleChangeState(id, state);

    res.json(saleChanged);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(error.message);
  }
});

sheetsRouter.post("/sale/dashboard", async (req, res) => {
  try {
    const data = req.body;
    const sale = await registerSaleDashboard(data);
    res.json(sale);
  } catch (error) {
    // console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/client/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id)
    const sale = await getSaleByClientId(id);
    res.json(sale);
  } catch (error) {
    // console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/user/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const sales = await getSaleByUserId(uid);
    res.json(sales);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/weekly/user/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const weeklySales = await getWeeklySalesByUser(uid);
    res.status(200).json(weeklySales);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sale/weekly", async (req, res) => {
  try {
    const weeklySalesTotal = await getWeeklySalesByClient();

    if (!weeklySalesTotal) {
      return res
        .status(404)
        .json({ error: "No se encontraron ventas en la semana" });
    }

    res.status(200).json(weeklySalesTotal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.get("/sales/weekly/client/:clientId", async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const weeklySales = await getWeeklyAllSalesByClient(clientId);
    res.status(200).json(weeklySales);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/date/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const sales = await getSalesByDate(date);
    res.json(sales);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.put("/increase-stock", async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const result = await increaseStock(productId, amount);
    res.json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.put("/decrease-stock", async (req, res) => {
  try {
    const { productId, amount } = req.body;
    const result = await decreaseStock(productId, amount);
    res.json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.delete("/sale/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteSalesById(id);
    res.json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/cash-flow", async (req, res) => {
  try {
    const { date } = req.query;
    const cashFlow = await getCashFlow(date);
    res.json(cashFlow);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.post("/cash-flow", async (req, res) => {
  try {
    const data = req.body;
    const result = await addCashFlowEntry(data);
    res.json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.post("/payment", async (req, res) => {
  try {
    const rowData = req.body;
    const result = await appendRowPayment(rowData);
    res.json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/all", async (req, res) => {
  try {
    const sales = await getSaleData();
    res.json(sales.salesData);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/product/:id/sales-check", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await checkProductSales(id);
    res.json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.get("/products/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const products = await getProductsByUserClients(userId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = sheetsRouter;
