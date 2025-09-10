/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mini4wd: {
          blue: '#1e40af',
          red: '#dc2626',
          yellow: '#eab308',
          green: '#16a34a'
        }
      }
    },
  },
  plugins: [],
}