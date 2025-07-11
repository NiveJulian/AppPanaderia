const PDFDocument = require("pdfkit");

function generateSaleTicket(saleData, res) {
  const doc = new PDFDocument({
    size: [220, 600], // Estilo recibo (ancho reducido, altura ajustable)
    margins: { top: 20, left: 10, right: 10, bottom: 20 }
  });

  // Configurar el stream de salida para enviar el PDF como respuesta
  res.setHeader("Content-disposition", "attachment; filename=ticket.pdf");
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  // Estilo de la fuente
  doc.font('Helvetica');
  
  // Título del ticket
  doc
    .fontSize(14)
    .text("Ticket de Venta", { align: "center", underline: true })
    .moveDown(1);

  // Información del cliente
  doc
    .fontSize(10)
    .text(`Cliente: ${saleData.clientName}`, { align: "left" })
    .moveDown(0.5);
  doc
    .fontSize(10)
    .text(`Número de Contacto: ${saleData.contactNumber}`, { align: "left" })
    .moveDown(1);

  // Encabezado de "Detalles de la Compra" centrado
  doc
    .fontSize(10)
    .text("Detalles de la Compra", { align: "center", underline: true })
    .moveDown(1);

  // Listado de productos centrado
  saleData.products.forEach((product) => {
    if (product && product.name) {
      doc
        .fontSize(10)
        .text(
          `${product.name} $${product.unitPrice} x${product.quantity} ----- $${product.subtotal.toFixed(2)}`,
          { align: "center" }
        )
        .moveDown(0.5); // Espaciado entre productos
    }
  });

  // Espacio después de los productos
  doc.moveDown(1);

  // Total de la compra
  doc
    .fontSize(12)
    .text(`Total: $${saleData.total.toFixed(2)}`, { align: "right", underline: true })
    .moveDown(1);

  // Finalizar el documento correctamente
  doc.end();
}

function generateWeeklySalesTicket(clientData, res) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 30, left: 30, right: 30, bottom: 30 }
  });

  // Configurar el stream de salida
  res.setHeader("Content-disposition", `attachment; filename=ventas_semanales_${clientData.clientName}.pdf`);
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  // Estilo de la fuente
  doc.font('Helvetica');

  // Título principal
  doc
    .fontSize(20)
    .text("Resumen de Ventas Semanales", { align: "center", underline: true })
    .moveDown(1);

  // Información del período
  doc
    .fontSize(12)
    .text(`Período: ${clientData.weekStart} al ${clientData.weekEnd}`, { align: "center" })
    .moveDown(2);

  // Información del cliente
  doc
    .fontSize(14)
    .text("Información del Cliente", { underline: true })
    .moveDown(0.5);
  
  doc
    .fontSize(12)
    .text(`Nombre: ${clientData.clientName}`)
    .moveDown(0.3);
  
  if (clientData.clientPhone) {
    doc
      .fontSize(12)
      .text(`Teléfono: ${clientData.clientPhone}`)
      .moveDown(0.3);
  }

  doc.moveDown(1);

  // Resumen de estadísticas
  doc
    .fontSize(14)
    .text("Resumen de Compras", { underline: true })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .text(`Total gastado: $${clientData.totalSales.toFixed(2)}`)
    .moveDown(0.3);
  
  doc
    .fontSize(12)
    .text(`Cantidad de compras: ${clientData.salesCount}`)
    .moveDown(0.3);
  
  doc
    .fontSize(12)
    .text(`Promedio por compra: $${clientData.averageSale.toFixed(2)}`)
    .moveDown(0.3);
  
  if (clientData.lastSaleDate) {
    doc
      .fontSize(12)
      .text(`Última compra: ${clientData.lastSaleDate}`)
      .moveDown(0.3);
  }

  doc.moveDown(1);

  // Detalle de productos comprados
  if (clientData.products && clientData.products.length > 0) {
    doc
      .fontSize(14)
      .text("Detalle de Productos Comprados", { underline: true })
      .moveDown(1);

    // Tabla de productos
    const tableTop = doc.y;
    const tableLeft = 30;
    const colWidth = 120;
    const rowHeight = 20;

    // Encabezados de la tabla
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text("Producto", tableLeft, tableTop)
      .text("Cantidad", tableLeft + colWidth, tableTop)
      .text("Precio Unit.", tableLeft + colWidth * 2, tableTop)
      .text("Subtotal", tableLeft + colWidth * 3, tableTop)
      .moveDown(1);

    doc.font('Helvetica');
    let currentY = tableTop + rowHeight;

    // Datos de la tabla
    clientData.products.forEach((product, index) => {
      if (currentY > 700) { // Si se acerca al final de la página
        doc.addPage();
        currentY = 30;
      }

      doc
        .fontSize(10)
        .text(product.productName || "Producto", tableLeft, currentY)
        .text(product.quantity.toString(), tableLeft + colWidth, currentY)
        .text(`$${product.price.toFixed(2)}`, tableLeft + colWidth * 2, currentY)
        .text(`$${(product.quantity * product.price).toFixed(2)}`, tableLeft + colWidth * 3, currentY);

      currentY += rowHeight;
    });

    doc.moveDown(2);
  }

  // Métodos de pago utilizados
  if (clientData.paymentMethods && clientData.paymentMethods.length > 0) {
    doc
      .fontSize(14)
      .text("Métodos de Pago Utilizados", { underline: true })
      .moveDown(0.5);

    clientData.paymentMethods.forEach((method) => {
      doc
        .fontSize(12)
        .text(`• ${method}`)
        .moveDown(0.3);
    });

    doc.moveDown(1);
  }

  // Pie de página
  doc
    .fontSize(10)
    .text("Gracias por tu confianza", { align: "center" })
    .moveDown(0.5);
  
  doc
    .fontSize(10)
    .text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, { align: "center" });

  // Finalizar el documento
  doc.end();
}

module.exports = { generateSaleTicket, generateWeeklySalesTicket };
