/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#13131A',
        'bg-elevated': '#1A1A24',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B4B4C6',
        'text-muted': '#6B6B7B',
        'accent': '#7b5ea7',
        'border-subtle': '#2A2A3C',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
