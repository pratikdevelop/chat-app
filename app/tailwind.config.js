/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      borderRadius:{
        'round': '25px !important'
      },
      colors:{
        'text-primary': '#454567'
      }
    },
  },
  plugins: [],
}
