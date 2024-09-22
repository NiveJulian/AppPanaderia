const { Router } = require("express");
const sheetsRouter = Router();
const {
  authorize,
  increaseStock,
  decreaseStock,
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
} = require("../Controllers/sheets/sheetsController.js");
const {
  getSheetData,
  getSheetDataById,
  appendRow,
  updateRow,
  deleteRowById,
} = require("../Controllers/sheets/productController.js");

sheetsRouter.get("/data", async (req, res) => {
  try {
    const auth = await authorize();
    const data = await getSheetData(auth);
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const auth = await authorize();
    const data = await getSheetDataById(id, auth);
    res.json(data);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.post("/data", async (req, res) => {
  try {
    const auth = await authorize();
    const data = req.body;
    const updates = await appendRow(auth, data);
    res.json(updates);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.put("/update", async (req, res) => {
  try {
    const auth = await authorize();
    const rowData = req.body;
    const result = await updateRow(auth, rowData);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

sheetsRouter.delete("/delete/:rowIndex", async (req, res) => {
  try {
    const auth = await authorize();
    const rowIndex = parseInt(req.params.rowIndex, 10);
    const result = await deleteRowById(auth, rowIndex);
    res.status(200).json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.put("/product/:id", async (req, res) => {
  try {
    const auth = await authorize();
    const rowIndex = parseInt(req.params.id, 10);
    const result = await activeProductById(auth, rowIndex);
    res.status(200).json(result);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.get("/sale", async (req, res) => {
  try {
    const auth = await authorize();
    const sale = await getSaleData(auth);
    res.json(sale.salesData);
  } catch (error) {
    console.log({ errorSale: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/weekly", async (req, res) => {
  try {
    const auth = await authorize();
    const weeklySalesTotal = await getWeeklySalesByClient(auth);
    if (!weeklySalesTotal) {
      return res
        .status(404)
        .json({ error: "No se encontraron ventas en la semana" });
    }

    res.status(200).json({ total: weeklySalesTotal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



sheetsRouter.get("/sale/:id", async (req, res) => {
  try {
    const auth = await authorize();
    const saleId = req.params.id;
    const sales = await getSaleDataUnitiInfo(auth, saleId);

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
    const auth = await authorize();
    const saleChanged = await putSaleChangeState(auth, id, state);

    res.json(saleChanged);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(error.message);
  }
});

sheetsRouter.post("/sale/dashboard", async (req, res) => {
  try {
    const data = req.body;
    // console.log(data)
    const auth = await authorize();
    const sale = await registerSaleDashboard(auth, data);
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
    const auth = await authorize();
    const sale = await getSaleByClientId(auth, id);
    res.json(sale);
  } catch (error) {
    // console.log({ error: error.message });
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/sales/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const authClient = await authorize();

    const sales = await getSaleByUserId(authClient, uid);
    // console.log(sales)
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo ventas por UID",
      error: error.message,
    });
  }
});

sheetsRouter.get("/sales/weekly/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const auth = await authorize();
    const weeklySalesTotal = await getWeeklySalesByUser(auth, uid);
    if (!weeklySalesTotal) {
      return res
        .status(404)
        .json({ error: "No se encontraron ventas en la semana" });
    }

    res.status(200).json({ total: weeklySalesTotal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.delete("/delete/sale/:id", async (req, res) => {
  try {
    const auth = await authorize();
    const id = req.params.id;
    const result = await deleteSalesById(auth, id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.put("/increase-stock", async (req, res) => {
  try {
    const auth = await authorize();
    const { productId, amount } = req.body;
    const result = await increaseStock(auth, productId, amount);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

sheetsRouter.put("/decrease-stock", async (req, res) => {
  try {
    const auth = await authorize();
    const { productId, amount } = req.body;
    const result = await decreaseStock(auth, productId, amount);
    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

sheetsRouter.get("/cashflow", async (req, res) => {
  try {
    const auth = await authorize(); // Asegúrate de que authorize está correctamente implementado
    const cashFlow = await getCashFlow(auth);

    // Verificar que cashFlowData exista antes de enviarlo
    if (cashFlow && cashFlow.cashFlowData) {
      res.json(cashFlow.cashFlowData);
    } else {
      res
        .status(404)
        .json({ message: "No se encontraron datos de flujo de caja." });
    }
  } catch (error) {
    console.error("Error al obtener el flujo de caja:", error.message);
    res.status(500).json({ error: error.message });
  }
});

sheetsRouter.post("/cashflow/add", async (req, res) => {
  try {
    const auth = await authorize();
    const { tipo, monto, descripcion, fecha } = req.body; // Asegúrate de enviar estos datos desde el frontend
    const result = await addCashFlowEntry(auth, {
      tipo,
      monto,
      descripcion,
      fecha,
    });
    res.json(result);
  } catch (error) {
    console.error(
      "Error al agregar el movimiento al flujo de caja:",
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

module.exports = sheetsRouter;
