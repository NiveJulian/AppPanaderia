// src/api/axiosConfig.js
import axios from "axios";

const instance = axios.create({
  // baseURL: 'https://server-espigadeoro.vercel.app',
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true, // Para enviar cookies con cada solicitud si es necesario
});

export default instance;

//server-ninashowroom.vercel.app
