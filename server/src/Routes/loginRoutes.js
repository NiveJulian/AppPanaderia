require("dotenv").config();
const { Router } = require("express");
const loginRoutes = Router();
const { verifyToken, isAdmin } = require("../Middleware/authMiddleware");
// const { authThird } = require("../Controllers/login/login");
const {
  isSeller,
  getUserByEmail,
  createUser,
} = require("../Controllers/user/userController");
const {
  getTokenFromCode,
  generateAuthUrl,
} = require("../Controllers/login/authController");
const { authorize } = require("../Controllers/sheets/sheetsController");
const { loginWithFirebase } = require("../Controllers/login/loginController");
const { authMiddleware } = require("../Middleware/authMiddleware");

loginRoutes.post("/third", authMiddleware, async (req, res) => {
  try {
    let user = await loginWithFirebase(req.headers.authorization.split(" ")[1]);
    res.status(200).json({
      message: "Authentication successful",
      user,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

loginRoutes.post("/email", async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await verifyToken(token);
    const email = decodedToken.email;
    const sellerData = await getUserByEmail(email);

    if (sellerData) {
      res.status(200).json({
        ...sellerData,
        rol: sellerData.rol, // Asegúrate de que el rol esté incluido
      });
    } else {
      res.status(403).json({ message: "User is not authorized" });
    }
  } catch (error) {
    console.log({ error: error.message });
    res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
});

loginRoutes.get("/oauthcallback", async (req, res) => {
  const code = req.query.code; // Obtener el código de autorización de la query
  console.log("Authorization code received:", code);

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Intercambiar el código de autorización por tokens
    const tokens = await getTokenFromCode(code);

    console.log("Tokens almacenados con éxito:", tokens);

    // Redirigir o responder al cliente que la autenticación fue exitosa
    res.status(200).json({
      message: "Authorization successful",
      tokens,
    });
  } catch (error) {
    console.error("Error durante el callback de OAuth:", error);
    res.status(500).json({ error: "Failed to authenticate" });
  }
});

module.exports = loginRoutes;
