/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: '#141720', 2: '#1C2030', 3: '#252B3D' },
        border: { DEFAULT: '#2A3048', strong: '#3B4468' },
        text: { primary: '#E8ECF4', secondary: '#8B93AB', muted: '#4A5270' },
        state: {
          normal: '#2A9D4E',
          attention: '#C8902A',
          warning: '#C85A2A',
          critical: '#B83030',
          predicted: '#2A6EC8',
          simulated: '#7B2AC8',
          unknown: '#4A5270'
        },
        accent: '#3B82F6'
      },
      backgroundColor: {
        root: '#0D0F12'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
