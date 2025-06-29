const { PrismaClient } = require('../../generated/prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo usuario
async function createUser(data) {
  try {
    const { id, email, name, address = '', province = '', postalCode = '', role = 'user' } = data;
    const user = await prisma.user.create({
      data: {
        id, // Este es el uid de Firebase
        email,
        name,
        address,
        province,
        postalCode,
        role,
      },
    });
    return user;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

// Listar todos los usuarios
async function getUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

// Buscar usuario por email
async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

// Buscar usuario por id
async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserByEmail,
  getUserById,
};
