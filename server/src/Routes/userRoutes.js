const { Router } = require("express");
const {
  createUser,
  getUsers,
  getUserByEmail,
  getUserById,
} = require("../Controllers/user/userController");
const userRoutes = Router();

// Listar todos los usuarios
userRoutes.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
});

// Crear usuario
userRoutes.post("/create", async (req, res) => {
  try {
    const data = req.body;
    const user = await createUser(data);
    res.status(200).json({
      message: "User created and saved in MySQL",
      data: user,
    });
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ message: "User creation failed", error: error.message });
  }
});

// Buscar usuario por email
userRoutes.post("/auth/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
});

// Buscar usuario por id
userRoutes.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
});

module.exports = userRoutes;
