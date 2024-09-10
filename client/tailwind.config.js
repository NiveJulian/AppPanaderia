/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4E342E', // Marrón madera
        secondary: '#212121', // Negro
        accent: '#FFFFFF', // Blanco
        lightBrown: '#8D6E63', // Marrón claro
        darkBrown: '#3E2723', // Marrón oscuro
        beige: '#D7CCC8', // Beige
        grey: '#BDBDBD', // Gris
        greenMoss: '#2F4538' // Gris
      }
    },
  },
  plugins: [],
}
