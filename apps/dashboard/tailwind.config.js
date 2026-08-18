/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#081C15',
          accent: '#52B788',
        },
        soil: {
          100: '#F7EDE2',
          300: '#DDA15E',
          500: '#BC6C25',
        },
        status: {
          adequate: '#2E7D32',
          moderate: '#F9A825',
          deficient: '#D32F2F',
          surplus: '#1976D2',
        }
      },
    },
  },
  plugins: [],
};
