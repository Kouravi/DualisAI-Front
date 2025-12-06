export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
    "./public/samples/**/*"
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          // Mantenemos los valores originales si quieres usarlos, 
          // ... otros tonos de slate
          
          // ESTA ES LA CLAVE: Sobrescribimos el valor 700
          700: '#a6a6a6', 
          
          // ... otros tonos de slate
        },
      },
    },
  },
  plugins: [],
};