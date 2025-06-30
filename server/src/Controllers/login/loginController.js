const admin = require("./firebaseAdmin");
const { getUserById, createUser } = require("../user/userController");

async function loginWithFirebase(token) {
  try {
    // Verifica el token de Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Busca el usuario en MySQL
    let user = await getUserById(uid);

    // Si no existe, lo crea
    if (!user) {
      user = await createUser({
        id: uid,
        email,
        name: name || email.split('@')[0], // Usar email como nombre si no hay nombre
        role: "user",
      });
    }

    // Devuelve los datos del usuario
    return user;
  } catch (error) {
    throw new Error("Authentication failed: " + error.message);
  }
}

module.exports = { loginWithFirebase }; 