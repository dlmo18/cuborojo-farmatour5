import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Farmatour 5
        primary: {
          50: '#f0f7f1',
          100: '#dceee2',
          200: '#b8ddc5',
          300: '#7ec496',
          400: '#47a865',
          500: '#2d7a3e', // Color verde principal Farmatour
          600: '#1f5a2e',
          700: '#0f3d20',
          800: '#0a2817',
          900: '#051710',
        },
        secondary: {
          50: '#faf6f1',
          100: '#f4ede3',
          200: '#e8dac7',
          300: '#d9bfa3',
          400: '#c89f7b',
          500: '#8b6f47', // Color marrón tierra Farmatour
          600: '#6b5844',
          700: '#4a3c2e',
          800: '#3a2f28',
          900: '#2a231f',
        },
        accent: {
          50: '#f5faf1',
          100: '#e8f3df',
          200: '#d4e6b9',
          300: '#b8d489',
          400: '#9ac25f',
          500: '#7cb133', // Verde foresttal/naturaleza
          600: '#5a8422',
          700: '#3f5c18',
          800: '#2f4411',
          900: '#1f2c0a',
        },
        forest: {
          50: '#f8faf7',
          100: '#eef2eb',
          200: '#dce5d5',
          300: '#c1d3ba',
          400: '#94ba8b',
          500: '#4d8f5a', // Bosque profundo
          600: '#3b6b47',
          700: '#2d5238',
          800: '#1e3828',
          900: '#0f1f15',
        },
      },
    },
  },
  plugins: [],
}
export default config
