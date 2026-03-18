/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spotify-style dark theme
        'spotify-black': '#000000',
        'spotify-base': '#121212',
        'spotify-elevated': '#1a1a1a',
        'spotify-highlight': '#282828',
        'spotify-text': '#ffffff',
        'spotify-subtext': '#b3b3b3',
        'spotify-muted': '#6a6a6a',
        'spotify-purple': '#7b5ea7',
        'spotify-bright-purple': '#8b6dc7',
        'spotify-green': '#1ed760',
      },
      fontFamily: {
        'sans': ['Inter', 'Circular', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
