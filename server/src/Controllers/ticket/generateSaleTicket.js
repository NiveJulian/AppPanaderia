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

module.exports = generateSaleTicket;
