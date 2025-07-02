require("dotenv").config();
const prisma = require("../../lib/prisma");
const moment = require("moment");

async function registerSaleDashboard(data) {
  try {
    const { productos, formaPago, total, idCliente, uid } = data;

    const currentTime = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const statePayment = "Completada";

    // Crear múltiples ventas para cada producto
    const sales = await Promise.all(
      productos.map(async (prod) => {
        return prisma.sale.create({
          data: {
            productId: prod.id,
            clientId: idCliente,
            quantity: parseInt(prod.cantidad),
            subtotal: parseFloat(prod.precio),
            payment: formaPago,
            orderStatus: statePayment,
            total: parseFloat(prod.cantidad * prod.precio),
            userId: uid,
          },
          include: {
            product: true,
            client: true,
            user: true,
          },
        });
      })
    );

    // Disminuir stock de productos (ahora permite stock negativo)
    for (const prod of productos) {
      const amount = parseInt(prod.cantidad);
      if (amount > 0) {
        try {
          await decreaseStock(prod.id, amount);
        } catch (error) {
          console.warn(
            `Warning: Could not decrease stock for product ${prod.id}: ${error.message}`
          );
          // Continuar con la venta incluso si hay problemas con el stock
        }
      }
    }

    return {
      message: "Venta registrada exitosamente",
      sales: sales.map((sale) => ({
        id: sale.id,
        productName: sale.product.name,
        clientName: sale.client.name,
        quantity: sale.quantity,
        total: sale.total,
        payment: sale.payment,
        status: sale.orderStatus,
        date: sale.date,
        time: sale.time,
      })),
    };
  } catch (error) {
    console.error("Error registrando la venta:", error);
    throw new Error(`Error registrando la venta: ${error.message}`);
  }
}

async function getSaleDataUnitiInfo(id) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        userId: id,
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (sales.length === 0) {
      return { sales: [], message: "No hay ventas asociadas a este usuario." };
    }

    return sales.map((sale) => ({
      id: sale.id,
      idProducto: sale.productId,
      productoNombre: sale.product.name,
      productoPrecio: sale.product.price,
      idCliente: sale.clientId,
      cliente: sale.client.name,
      celular: sale.client.phone || "",
      cantidad: sale.quantity,
      subtotal: sale.subtotal,
      pago: sale.payment,
      estadoPago: sale.orderStatus,
      total: sale.total,
      fecha: sale.date.toLocaleDateString("es-AR"),
      hora: sale.time,
    }));
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

async function getSaleById(id) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        id: id,
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (sales.length === 0) {
      throw new Error("Ventas no encontradas");
    }

    return sales.map((sale) => ({
      id: sale.id,
      idProducto: sale.productId,
      productoNombre: sale.product.name,
      productoPrecio: sale.product.price,
      idCliente: sale.clientId,
      cliente: sale.client.name,
      celular: sale.client.phone || "",
      cantidad: sale.quantity,
      subtotal: sale.subtotal,
      pago: sale.payment,
      estadoPago: sale.orderStatus,
      total: sale.total,
      fecha: sale.date.toLocaleDateString("es-AR"),
      hora: sale.time,
    }));
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

async function getSaleData() {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const salesData = sales.map((sale) => ({
      id: sale.id,
      idProducto: sale.productId,
      idCliente: sale.clientId,
      cliente: sale.client.name,
      celular: sale.client.phone || "",
      cantidad: sale.quantity,
      subtotal: sale.subtotal,
      pago: sale.payment,
      estadoPago: sale.orderStatus,
      total: sale.total,
      fecha: sale.date.toLocaleDateString("es-AR"),
      hora: sale.time,
      userId: sale.userId,
    }));
    return { salesData };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error retrieving sales data");
  }
}

async function getWeeklyAllSalesByClient(clientId) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        clientId: clientId,
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (sales.length === 0) {
      return {
        weekInfo: {
          weekStart: moment().startOf("isoWeek").format("YYYY-MM-DD"),
          weekEnd: moment().endOf("isoWeek").format("YYYY-MM-DD"),
          weekNumber: moment().isoWeek(),
        },
        totalSales: 0,
        totalAmount: 0,
        salesCount: 0,
        averageSale: 0,
        products: [],
        lastSaleDate: null,
        paymentMethods: [],
        message: "No se encontraron ventas para este cliente en esta semana",
      };
    }

    // Calcular fechas de la semana actual
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const diffToMonday = (currentDayOfWeek + 6) % 7;
    const currentStartDate = new Date(today);
    currentStartDate.setDate(today.getDate() - diffToMonday);
    currentStartDate.setHours(0, 0, 0, 0);

    const currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentStartDate.getDate() + 6);
    currentEndDate.setHours(23, 59, 59, 999);

    // Filtrar ventas de la semana actual
    const weeklySales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= currentStartDate && saleDate <= currentEndDate;
    });

    if (weeklySales.length === 0) {
      return {
        weekInfo: {
          weekStart: currentStartDate.toISOString().split("T")[0],
          weekEnd: currentEndDate.toISOString().split("T")[0],
          weekNumber: Math.ceil(
            (currentStartDate.getTime() -
              new Date(currentStartDate.getFullYear(), 0, 1).getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          ),
        },
        totalSales: 0,
        totalAmount: 0,
        salesCount: 0,
        averageSale: 0,
        products: [],
        lastSaleDate: null,
        paymentMethods: [],
        message: "No se encontraron ventas para este cliente en esta semana",
      };
    }

    // Procesar datos del cliente
    const clientData = {
      clientId: weeklySales[0].client.id,
      clientName: weeklySales[0].client.name,
      clientPhone: weeklySales[0].client.phone || "",
      weekStart: currentStartDate.toISOString().split("T")[0],
      weekEnd: currentEndDate.toISOString().split("T")[0],
      totalSales: 0,
      totalAmount: 0,
      salesCount: 0,
      averageSale: 0,
      products: [],
      lastSaleDate: null,
      paymentMethods: new Set(),
    };

    weeklySales.forEach((sale) => {
      clientData.totalSales += sale.total;
      clientData.salesCount += 1;
      clientData.paymentMethods.add(sale.payment);

      // Agregar información del producto
      clientData.products.push({
        productId: sale.product.id,
        productName: sale.product.name,
        quantity: sale.quantity,
        price: sale.product.price,
        subtotal: sale.subtotal,
        saleDate: sale.date.toISOString().split("T")[0],
        saleTime: sale.time,
      });

      // Actualizar fecha de última venta
      if (
        !clientData.lastSaleDate ||
        sale.date > new Date(clientData.lastSaleDate)
      ) {
        clientData.lastSaleDate = sale.date.toISOString().split("T")[0];
      }
    });

    // Calcular promedio y convertir Set a Array
    clientData.averageSale = clientData.totalSales / clientData.salesCount;
    clientData.paymentMethods = Array.from(clientData.paymentMethods);
    clientData.totalAmount = clientData.totalSales;

    return {
      ...clientData,
      weekInfo: {
        weekStart: currentStartDate.toISOString().split("T")[0],
        weekEnd: currentEndDate.toISOString().split("T")[0],
        weekNumber: Math.ceil(
          (currentStartDate.getTime() -
            new Date(currentStartDate.getFullYear(), 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        ),
      },
    };
  } catch (error) {
    console.error({ error: error.message });
    throw new Error("Error retrieving weekly sales data");
  }
}

async function getWeeklySalesByClient() {
  try {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const diffToMonday = (currentDayOfWeek + 6) % 7;
    const currentStartDate = new Date(today);
    currentStartDate.setDate(today.getDate() - diffToMonday);
    currentStartDate.setHours(0, 0, 0, 0);

    const currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentStartDate.getDate() + 6);
    currentEndDate.setHours(23, 59, 59, 999);

    // Obtener todas las ventas de la semana actual
    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: currentStartDate,
          lte: currentEndDate,
        },
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (sales.length === 0) {
      return {
        weekInfo: {
          weekStart: currentStartDate.toISOString().split("T")[0],
          weekEnd: currentEndDate.toISOString().split("T")[0],
          weekNumber: Math.ceil(
            (currentStartDate.getTime() -
              new Date(currentStartDate.getFullYear(), 0, 1).getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          ),
        },
        totalSales: 0,
        totalAmount: 0,
        clients: [],
        message: "No se encontraron ventas en esta semana",
      };
    }
    const weeklySalesByClient = {};

    sales.forEach((sale) => {
      const clientId = sale.clientId;
      if (!weeklySalesByClient[clientId]) {
        weeklySalesByClient[clientId] = {
          clientId: sale.client.id,
          clientName: sale.client.name,
          clientPhone: sale.client.phone || "",
          weekStart: currentStartDate.toISOString().split("T")[0],
          weekEnd: currentEndDate.toISOString().split("T")[0],
          totalSales: 0,
          totalAmount: 0,
          salesCount: 0,
          averageSale: 0,
          products: [],
          lastSaleDate: null,
          paymentMethods: new Set(),
        };
      }

      weeklySalesByClient[clientId].totalSales += sale.total;
      weeklySalesByClient[clientId].salesCount += 1;
      weeklySalesByClient[clientId].paymentMethods.add(sale.payment);

      // Agregar información del producto
      weeklySalesByClient[clientId].products.push({
        productId: sale.product.id,
        productName: sale.product.name,
        quantity: sale.quantity,
        price: sale.product.price,
        subtotal: sale.subtotal,
        saleDate: sale.date.toISOString().split("T")[0],
        saleTime: sale.time,
      });

      // Actualizar fecha de última venta
      if (
        !weeklySalesByClient[clientId].lastSaleDate ||
        sale.date > new Date(weeklySalesByClient[clientId].lastSaleDate)
      ) {
        weeklySalesByClient[clientId].lastSaleDate = sale.date
          .toISOString()
          .split("T")[0];
      }
    });

    // Calcular promedios y convertir Sets a Arrays
    const clientsData = Object.values(weeklySalesByClient).map((client) => ({
      ...client,
      averageSale: client.totalSales / client.salesCount,
      paymentMethods: Array.from(client.paymentMethods),
      totalAmount: client.totalSales, // Para mantener compatibilidad
    }));

    const totalAmount = clientsData.reduce(
      (sum, client) => sum + client.totalSales,
      0
    );

    const totalSales = clientsData.reduce(
      (sum, client) => sum + client.salesCount,
      0
    );

    return {
      weekInfo: {
        weekStart: currentStartDate.toISOString().split("T")[0],
        weekEnd: currentEndDate.toISOString().split("T")[0],
        weekNumber: Math.ceil(
          (currentStartDate.getTime() -
            new Date(currentStartDate.getFullYear(), 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        ),
        totalDays: 7,
      },
      totalSales: totalSales,
      totalAmount: totalAmount,
      averageSale: totalSales > 0 ? totalAmount / totalSales : 0,
      clientsCount: clientsData.length,
      clients: clientsData.sort((a, b) => b.totalSales - a.totalSales), // Ordenar por total de ventas descendente
    };
  } catch (error) {
    console.error({ error: error.message });
    throw new Error("Error retrieving weekly sales data");
  }
}

async function getWeeklySalesByUser(uid) {
  try {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const diffToMonday = (currentDayOfWeek + 6) % 7;
    const currentStartDate = new Date(today);
    currentStartDate.setDate(today.getDate() - diffToMonday);
    currentStartDate.setHours(0, 0, 0, 0);

    const currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentStartDate.getDate() + 6);
    currentEndDate.setHours(23, 59, 59, 999);

    // Obtener todas las ventas de la semana actual
    const sales = await prisma.sale.findMany({
      where: {
        userId: uid,
        date: {
          gte: currentStartDate,
          lte: currentEndDate,
        },
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (sales.length === 0) {
      return {
        weekInfo: {
          weekStart: currentStartDate.toISOString().split("T")[0],
          weekEnd: currentEndDate.toISOString().split("T")[0],
          weekNumber: Math.ceil(
            (currentStartDate.getTime() -
              new Date(currentStartDate.getFullYear(), 0, 1).getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          ),
        },
        totalSales: 0,
        totalAmount: 0,
        clients: [],
        message: "No se encontraron ventas en esta semana",
      };
    }
    
    const weeklySalesByClient = {};

    sales.forEach((sale) => {
      const clientId = sale.clientId;
      if (!weeklySalesByClient[clientId]) {
        weeklySalesByClient[clientId] = {
          clientId: sale.client.id,
          clientName: sale.client.name,
          clientPhone: sale.client.phone || "",
          weekStart: currentStartDate.toISOString().split("T")[0],
          weekEnd: currentEndDate.toISOString().split("T")[0],
          totalSales: 0,
          totalAmount: 0,
          salesCount: 0,
          averageSale: 0,
          products: [],
          lastSaleDate: null,
          paymentMethods: new Set(),
        };
      }

      weeklySalesByClient[clientId].totalSales += sale.total;
      weeklySalesByClient[clientId].salesCount += 1;
      weeklySalesByClient[clientId].paymentMethods.add(sale.payment);

      // Agregar información del producto
      weeklySalesByClient[clientId].products.push({
        productId: sale.product.id,
        productName: sale.product.name,
        quantity: sale.quantity,
        price: sale.product.price,
        subtotal: sale.subtotal,
        saleDate: sale.date.toISOString().split("T")[0],
        saleTime: sale.time,
      });

      // Actualizar fecha de última venta
      if (
        !weeklySalesByClient[clientId].lastSaleDate ||
        sale.date > new Date(weeklySalesByClient[clientId].lastSaleDate)
      ) {
        weeklySalesByClient[clientId].lastSaleDate = sale.date
          .toISOString()
          .split("T")[0];
      }
    });

    // Calcular promedios y convertir Sets a Arrays
    const clientsData = Object.values(weeklySalesByClient).map((client) => ({
      ...client,
      averageSale: client.totalSales / client.salesCount,
      paymentMethods: Array.from(client.paymentMethods),
      totalAmount: client.totalSales, // Para mantener compatibilidad
    }));

    const totalAmount = clientsData.reduce(
      (sum, client) => sum + client.totalSales,
      0
    );

    const totalSales = clientsData.reduce(
      (sum, client) => sum + client.salesCount,
      0
    );

    return {
      weekInfo: {
        weekStart: currentStartDate.toISOString().split("T")[0],
        weekEnd: currentEndDate.toISOString().split("T")[0],
        weekNumber: Math.ceil(
          (currentStartDate.getTime() -
            new Date(currentStartDate.getFullYear(), 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        ),
        totalDays: 7,
      },
      totalSales: totalSales,
      totalAmount: totalAmount,
      averageSale: totalSales > 0 ? totalAmount / totalSales : 0,
      clientsCount: clientsData.length,
      clients: clientsData.sort((a, b) => b.totalSales - a.totalSales), // Ordenar por total de ventas descendente
    };
  } catch (error) {
    console.error({ error: error.message });
    throw new Error("Error retrieving weekly sales data");
  }
}

async function increaseStock(productId, amount) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("ID no encontrado");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: product.stock + parseInt(amount),
      },
    });

    return {
      message: "Stock increased successfully",
      product: {
        id: updatedProduct.id,
        nombre: updatedProduct.name,
        stock: updatedProduct.stock,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function deleteSalesById(id) {
  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        orderStatus: "Anulado",
      },
    });

    return {
      message: "Sale cancelled successfully",
      sale: {
        id: sale.id,
        status: sale.orderStatus,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function getCashFlow(date = null) {
  try {
    const cashFlowEntries = await prisma.cashFlow.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Obtener ventas para incluir como ingresos
    const sales = await prisma.sale.findMany({
      where: {
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Procesar entradas de flujo de caja
    const cashFlowData = [];
    const cajaInicialData = [];
    let cajaInicialMañana = 0;
    let cajaInicialTarde = 0;
    let saldoAcumulado = 0;

    cashFlowEntries.forEach((entry) => {
      if (entry.type.toLowerCase() === "caja inicial") {
        cajaInicialData.push({
          id: entry.id,
          tipo: entry.type,
          monto: entry.amount,
          descripcion: entry.description,
          fecha: entry.date.toLocaleDateString("es-AR"),
          hora: entry.time,
          periodo: entry.period,
          cajaInicial: entry.initialCash,
          cajaFinal: entry.finalCash,
        });

        if (entry.period?.toLowerCase() === "mañana") {
          cajaInicialMañana = entry.amount;
        } else if (entry.period?.toLowerCase() === "tarde") {
          cajaInicialTarde = entry.amount;
        }
      } else {
        if (entry.type.toLowerCase() === "ingreso") {
          saldoAcumulado += entry.amount;
        } else if (entry.type.toLowerCase() === "gasto") {
          saldoAcumulado -= entry.amount;
        }

        cashFlowData.push({
          id: entry.id,
          tipo: entry.type,
          monto: entry.amount,
          descripcion: entry.description,
          fecha: entry.date.toLocaleDateString("es-AR"),
          hora: entry.time,
          periodo: entry.period,
          cajaInicial: entry.initialCash,
          cajaFinal: entry.finalCash,
        });
      }
    });

    // Procesar ventas como ingresos
    const ventasData = sales.map((sale) => {
      saldoAcumulado += sale.total;

      return {
        id: `venta-${sale.id}`,
        tipo: "Ingreso",
        monto: sale.total,
        descripcion: `Venta Producto: ${sale.product.name}, Cliente: ${sale.client.name}`,
        fecha: sale.date.toLocaleDateString("es-AR"),
        hora: sale.time,
        periodo: "",
        cajaInicial: saldoAcumulado - sale.total,
        cajaFinal: saldoAcumulado,
      };
    });

    const allCashFlowData = [
      ...cashFlowData,
      ...ventasData,
      ...cajaInicialData,
    ];
    const cajaInicialDiaSiguiente =
      cajaInicialTarde > 0 ? cajaInicialTarde : cajaInicialMañana;

    return {
      cashFlowData: allCashFlowData,
      lastId: cashFlowEntries.length + sales.length,
      cajaInicialMañana,
      cajaInicialTarde,
      cajaInicialDiaSiguiente,
    };
  } catch (error) {
    console.error("Error al obtener el flujo de caja:", error.message);
    throw new Error("Error al obtener el flujo de caja");
  }
}

async function addCashFlowEntry(data) {
  try {
    const { tipo, monto, descripcion, fecha, periodo } = data;
    const hora = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Obtener el último saldo acumulado
    const lastEntry = await prisma.cashFlow.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    let saldoAcumulado = lastEntry ? lastEntry.finalCash : 0;
    let cajaInicial = 0;

    if (tipo === "Caja Inicial") {
      cajaInicial = parseFloat(monto);
      saldoAcumulado = cajaInicial;
    } else {
      saldoAcumulado =
        tipo === "Ingreso"
          ? saldoAcumulado + parseFloat(monto)
          : saldoAcumulado - parseFloat(monto);
    }

    const newEntry = await prisma.cashFlow.create({
      data: {
        type: tipo,
        amount: parseFloat(monto),
        description: descripcion,
        date: fecha ? new Date(fecha) : new Date(),
        time: hora,
        period: periodo,
        initialCash: cajaInicial,
        finalCash: saldoAcumulado,
      },
    });

    return {
      id: newEntry.id,
      tipo: newEntry.type,
      monto: newEntry.amount,
      descripcion: newEntry.description,
      fecha: newEntry.date.toLocaleDateString("es-AR"),
      hora: newEntry.time,
      periodo: newEntry.period,
      cajaInicial: newEntry.initialCash,
      cajaFinal: newEntry.finalCash,
    };
  } catch (error) {
    console.error("Error adding cash flow entry:", error);
    throw new Error("Error adding cash flow entry");
  }
}

async function appendRowPayment(rowData) {
  try {
    const payment = await prisma.payment.create({
      data: {
        ...rowData,
      },
    });

    return {
      message: "Payment created successfully",
      payment,
    };
  } catch (error) {
    console.error("Error creating payment:", error);
    throw new Error("Error creating payment");
  }
}

// Función auxiliar para disminuir stock (importada del controlador de productos)
async function decreaseStock(productId, amount) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("ID no encontrado");
    }

    const newStock = product.stock - parseInt(amount);

    // Permitir stock negativo (ventas sin stock)
    // if (newStock < 0) {
    //   throw new Error("Stock insuficiente");
    // }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
      },
    });

    return {
      message: "Stock decreased successfully",
      product: {
        id: updatedProduct.id,
        nombre: updatedProduct.name,
        stock: updatedProduct.stock,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function putSaleChangeState(id, state) {
  try {
    const correctedState = state === "Enproceso" ? "En proceso" : state;

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        orderStatus: correctedState,
      },
    });

    return {
      message: `Sale status updated to ${correctedState}`,
      sale: {
        id: sale.id,
        status: sale.orderStatus,
      },
    };
  } catch (error) {
    console.error("Error updating sale status:", error);
    throw new Error("Error updating sale status");
  }
}

async function getSalesByDate(date) {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
      },
    });

    return sales.map((sale) => sale.id);
  } catch (error) {
    console.error("Error obteniendo ventas por fecha:", error);
    throw new Error("Error obteniendo ventas por fecha");
  }
}

async function getSaleByClientId(id) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        clientId: id,
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (sales.length === 0) {
      return { message: "No sales found for this client" };
    }

    const client = sales[0].client;
    const products = [];
    const quantities = [];
    const paymentMethods = new Set();
    const dates = [];
    const times = [];
    let totalPrice = 0;
    let status = "";

    sales.forEach((sale) => {
      products.push({
        id: sale.product.id,
        nombre: sale.product.name,
        precio: sale.product.price,
      });
      quantities.push(sale.quantity);
      paymentMethods.add(sale.payment);
      status = sale.orderStatus;
      totalPrice += sale.total;
      dates.push(sale.date.toLocaleDateString("es-AR"));
      times.push(sale.time);
    });

    return {
      client: {
        nombre: client.name,
        celular: client.phone || "",
      },
      products,
      quantities,
      paymentMethods: [...paymentMethods],
      status,
      totalPrice,
      dates,
      times,
    };
  } catch (error) {
    console.error("Error obteniendo ventas por cliente:", error);
    throw new Error("Error obteniendo ventas por cliente");
  }
}

async function getSaleByUserId(uid) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        userId: uid,
        orderStatus: {
          not: "Anulado",
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (sales.length === 0) {
      console.log(`No se encontraron ventas para el UID: ${uid}`);
      return [];
    }

    // Crear un objeto para acumular las ventas por ID de venta
    const salesSummary = {};

    sales.forEach((sale) => {
      try {
        const saleId = sale.id;
        const productId = sale.productId;
        const client = {
          id: sale.client.id,
          nombre: sale.client.name,
          celular: sale.client.phone || "",
        };
        const quantity = sale.quantity;
        const total = sale.total;
        const paymentMethod = sale.payment;
        const estadoPago = sale.orderStatus;
        const fecha = sale.date.toLocaleDateString("es-AR");
        const hora = sale.time;
        const product = {
          id: sale.product.id,
          nombre: sale.product.name,
          precio: sale.product.price,
        };

        if (salesSummary[saleId]) {
          salesSummary[saleId].products.push({
            productId,
            product,
            quantity,
            total,
          });
          salesSummary[saleId].total += total;
          salesSummary[saleId].quantity += quantity;
        } else {
          salesSummary[saleId] = {
            id: saleId,
            client,
            paymentMethod,
            estadoPago,
            fecha,
            hora,
            products: [
              {
                productId,
                product,
                quantity,
                total,
              },
            ],
            total,
            quantity,
          };
        }
      } catch (error) {
        console.error(`Error procesando venta: ${sale.id}`, error);
      }
    });

    return Object.values(salesSummary);
  } catch (error) {
    console.error("Error obteniendo ventas por UID:", error);
    throw new Error("Error obteniendo ventas por UID");
  }
}

async function getMonthlySalesByClient(clientId, year) {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        clientId,
        orderStatus: { not: "Anulado" },
        date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      orderBy: { date: "asc" },
    });

    // Agrupar por mes
    const monthly = {};
    sales.forEach(sale => {
      const month = sale.date.getMonth() + 1; // 1-12
      if (!monthly[month]) monthly[month] = [];
      monthly[month].push(sale);
    });

    // Formatear respuesta
    return Object.entries(monthly).map(([month, sales]) => ({
      month: Number(month),
      total: sales.reduce((sum, s) => sum + s.total, 0),
      salesCount: sales.length,
      sales,
    }));
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error obteniendo ventas mensuales del cliente");
  }
}

async function deleteSalePermanently(id) {
  try {
    const sale = await prisma.sale.delete({
      where: { id },
    });
    return {
      message: "Venta eliminada definitivamente",
      sale,
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

module.exports = {
  registerSaleDashboard,
  getSaleData,
  getWeeklySalesByClient,
  getWeeklySalesByUser,
  getSaleDataUnitiInfo,
  getSalesByDate,
  increaseStock,
  deleteSalesById,
  getCashFlow,
  addCashFlowEntry,
  appendRowPayment,
  getSaleByUserId,
  getSaleByClientId,
  putSaleChangeState,
  getWeeklyAllSalesByClient,
  getSaleById,
  getMonthlySalesByClient,
  deleteSalePermanently,
};
