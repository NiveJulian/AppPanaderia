const prisma = require("../../lib/prisma");

// Crear un nuevo cliente
async function createClient(clientData) {
  try {
    console.log(clientData);
    const { name, address, phone, userId } = clientData;
    const newClient = await prisma.client.create({
      data: {
        name,
        address,
        phone,
        userId,
      },
    });
    return newClient;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

// Listar todos los clientes
async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      where: { deleted: false },
    });
    return clients;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

// Buscar cliente por ID
async function getClientById(id) {
  try {
    const client = await prisma.client.findUnique({
      where: { id, deleted: false },
    });
    if (!client) throw new Error("Cliente no encontrado");
    return client;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

// Buscar clientes por userId
async function getClientByUserId(userId) {
  try {
    const clients = await prisma.client.findMany({
      where: { userId, deleted: false },
    });
    return clients;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

// Buscar cliente por nombre
async function getClientByName(name) {
  try {
    const client = await prisma.client.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, deleted: false },
    });
    if (!client) throw new Error(`Cliente con nombre '${name}' no encontrado`);
    return client;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error(error.message);
  }
}

// Actualizar cliente
async function updateClient(id, updatedData) {
  try {
    const updatedClient = await prisma.client.update({
      where: { id },
      data: updatedData,
    });
    return updatedClient;
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error actualizando los datos del cliente");
  }
}

// Borrado lógico de cliente y productos asociados
async function deleteClientAndProducts(clientId) {
  try {
    // Marcar el cliente como eliminado
    await prisma.client.update({
      where: { id: clientId },
      data: { deleted: true },
    });

    // Marcar todos los productos de ese cliente como eliminados
    await prisma.product.updateMany({
      where: { clientId: clientId },
      data: { deleted: true },
    });

    return { message: "Cliente y productos asociados eliminados lógicamente" };
  } catch (error) {
    console.log({ error: error.message });
    throw new Error("Error al eliminar cliente y productos");
  }
}

module.exports = {
  createClient,
  getClients,
  getClientById,
  getClientByUserId,
  getClientByName,
  updateClient,
  deleteClientAndProducts,
};
