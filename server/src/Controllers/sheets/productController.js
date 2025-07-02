const prisma = require("../../lib/prisma");

async function getSheetData() {
  try {
    const products = await prisma.product.findMany({
      where: { deleted: false },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const productsFormatted = await Promise.all(
      products.map(async (product) => {
        let clientName = "";

        if (product.client) {
          clientName = product.client.name;
        }

        return {
          id: product.id,
          nombre: product.name,
          cantidad: product.stock,
          precio: product.price,
          publicado: product.published,
          cliente: clientName,
          clienteId: product.clientId,
        };
      })
    );

    return { products: productsFormatted };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error retrieving products data");
  }
}

async function getSheetDataById(id) {
  try {
    const product = await prisma.product.findUnique({
      where: { id, deleted: false },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      id: product.id,
      nombre: product.name,
      cantidad: product.stock,
      precio: product.price,
      publicado: product.published,
      cliente: product.client ? product.client.name : "",
      clienteId: product.clientId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error retrieving product data");
  }
}

async function appendRow(data) {
  try {
    const { nombre, cantidad, precio, clientId } = data;
    // Asegurarse de que cantidad se registre correctamente
    const parsedCantidad =
      cantidad !== undefined && cantidad !== null && cantidad !== ""
        ? parseInt(cantidad)
        : 0;
    const parsedPrecio =
      precio !== undefined && precio !== null && precio !== ""
        ? parseFloat(precio)
        : 0;
    const product = await prisma.product.create({
      data: {
        name: nombre,
        stock: parsedCantidad,
        price: parsedPrecio,
        clientId: clientId || null,
        published: true,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return {
      message: "Product created successfully",
      product: {
        id: product.id,
        nombre: product.name,
        cantidad: product.stock,
        precio: product.price,
        publicado: product.published,
        cliente: product.client ? product.client.name : "",
        clienteId: product.clientId,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error creating product");
  }
}

async function updateRow(data) {
  try {
    const { id, nombre, cantidad, precio, publicado, clientId } = data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: nombre,
        stock:
          cantidad !== undefined && cantidad !== null && cantidad !== ""
            ? parseInt(cantidad)
            : 0,
        price:
          precio !== undefined && precio !== null && precio !== ""
            ? parseFloat(precio)
            : 0,
        published: publicado,
        clientId: clientId || null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: "Product updated successfully",
      product: {
        id: product.id,
        nombre: product.name,
        cantidad: product.stock,
        precio: product.price,
        publicado: product.published,
        cliente: product.client ? product.client.name : "",
        clienteId: product.clientId,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error updating product");
  }
}

async function deleteRowById(id) {
  try {
    // Eliminar todas las ventas asociadas a este producto
    await prisma.sale.deleteMany({
      where: { productId: id },
    });
    // Ahora sí, eliminar el producto
    const product = await prisma.product.delete({
      where: { id },
    });
    return {
      message: "Product deleted successfully",
      product: {
        id: product.id,
        nombre: product.name,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

async function createProductoByClientId(data, clientId) {
  try {
    const { nombre, cantidad, precio } = data;

    const product = await prisma.product.create({
      data: {
        name: nombre,
        stock: parseInt(cantidad) || 0,
        price: parseFloat(precio) || 0,
        clientId: clientId && clientId !== "" ? clientId : null,
        published: true,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      message: "Product created successfully for client",
      product: {
        id: product.id,
        nombre: product.name,
        cantidad: product.stock,
        precio: product.price,
        publicado: product.published,
        cliente: product.client ? product.client.name : "",
        clienteId: product.clientId,
      },
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error creating product for client");
  }
}

async function getProductByClientID(userId) {
  try {
    const products = await prisma.product.findMany({
      where: {
        deleted: false,
        OR: [
          { clientId: null }, // productos globales
          { client: { userId } }, // productos de clientes de este usuario
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const productsFormatted = products.map((product) => ({
      id: product.id,
      nombre: product.name,
      cantidad: product.stock,
      precio: product.price,
      publicado: product.published,
      cliente: product.client ? product.client.name : "",
      clienteId: product.clientId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return { products: productsFormatted };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error retrieving products for client");
  }
}

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

async function checkProductSales(id) {
  try {
    const salesCount = await prisma.sale.count({
      where: { productId: id },
    });

    return {
      hasSales: salesCount > 0,
      salesCount: salesCount,
    };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error checking product sales");
  }
}

async function getProductsByUserClients(userId) {
  try {
    // 1. Buscar todos los clientes creados por el usuario
    const clients = await prisma.client.findMany({
      where: { userId, deleted: false },
      select: { id: true },
    });
    const clientIds = clients.map((c) => c.id);

    // 2. Buscar todos los productos de esos clientes y productos globales
    const products = await prisma.product.findMany({
      where: {
        deleted: false,
        OR: [
          { clientId: { in: clientIds } },
          { clientId: null }, // productos globales
        ],
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    // 3. Formatear la respuesta
    return products.map((product) => ({
      id: product.id,
      nombre: product.name,
      stock: product.stock,
      precio: product.price,
      cliente: product.client ? product.client.name : "",
      clienteId: product.clientId,
      publicado: product.published,
    }));
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error obteniendo productos de los clientes del usuario");
  }
}

module.exports = {
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
};
