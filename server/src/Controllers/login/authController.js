const { google } = require("googleapis");
const fs = require("fs");

// Controlador para generar el enlace de autorización
const generateAuthUrl = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Para obtener un refresh token
    scope: ["https://www.googleapis.com/auth/spreadsheets"], // Cambia el alcance según tus necesidades
    prompt: "consent", // Asegura que se obtenga el refresh token
  });

  return authUrl;
};

// Controlador para intercambiar el código de autorización por tokens
const getTokenFromCode = async (code) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Intercambiar el código por un token
  const { tokens } = await oauth2Client.getToken(code);

  // Guardar tokens en un archivo JSON
  const tokenPath = "google_credentials.json";
  fs.writeFileSync(tokenPath, JSON.stringify(tokens));

  return tokens;
};

async function refreshAccessToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Leer los tokens almacenados (asegúrate de haber guardado el refresh_token previamente)
  const tokenPath = "google_credentials.json";
  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));

  // Asignar el refresh_token
  oauth2Client.setCredentials({ refresh_token: tokens.refresh_token });

  try {
    // Obtener un nuevo access_token usando refreshAccessToken
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Actualizar el access_token y la fecha de expiración
    tokens.access_token = credentials.access_token;
    tokens.expiry_date = credentials.expiry_date;

    // Guardar el nuevo token en el archivo JSON
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));

    console.log("Token de acceso actualizado");
    return credentials.access_token;
  } catch (error) {
    console.error("Error actualizando token de acceso:", error);
  }
}

module.exports = {
  generateAuthUrl,
  getTokenFromCode,
  refreshAccessToken,
};
