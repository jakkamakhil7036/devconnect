/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Clean subtle indigo
          dark: '#3730A3',
          light: '#818CF8',
        },
        secondary: {
          DEFAULT: '#0EA5E9', // Soft sky blue
          dark: '#0284C7',
          light: '#38BDF8',
        },
        accent: {
          DEFAULT: '#10B981', // Subtle emerald
          dark: '#059669',
          light: '#34D399',
        },
        background: '#FAFAFA', // Soft clean neutral light
        darkbg: '#09090B', // Clean sleek dark zinc (not harsh)
        darkcard: '#18181B', // Neat subtle card background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
