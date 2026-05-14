import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif']
      },
      colors: {
        ink: '#0f172a',
        pearl: '#f8f5f2',
        gold: '#c5a57b',
        slate: '#334155'
      },
      boxShadow: {
        glow: '0 15px 60px rgba(15, 23, 42, 0.18)'
      }
    }
  },
  plugins: []
};

export default config;
