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
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      colors: {
        ink: '#0f172a',
        pearl: '#f8f5f2',
        gold: {
          DEFAULT: '#c5a57b',
          50: '#faf6f0',
          100: '#f2e9db',
          200: '#e5d3b8',
          300: '#d4b88e',
          400: '#c5a57b',
          500: '#b8926a',
          600: '#a07a58',
          700: '#84634a',
          800: '#6d5241',
          900: '#5c4639'
        },
        slate: '#334155'
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.8rem, 6vw, 5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.2rem, 4.5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-sub': ['clamp(1.1rem, 2vw, 1.35rem)', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'quote-lg': ['clamp(1.3rem, 2.5vw, 1.75rem)', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'quote-md': ['clamp(1.1rem, 1.8vw, 1.35rem)', { lineHeight: '1.6', letterSpacing: '0.03em' }]
      },
      spacing: {
        'section': 'clamp(4rem, 10vh, 8rem)',
        'section-lg': 'clamp(6rem, 14vh, 12rem)'
      },
      boxShadow: {
        glow: '0 15px 60px rgba(15, 23, 42, 0.18)',
        'glow-gold': '0 8px 40px rgba(197, 165, 123, 0.15)',
        'glow-lg': '0 25px 80px rgba(15, 23, 42, 0.25)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 12px 50px rgba(0, 0, 0, 0.35)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 80px rgba(197, 165, 123, 0.05)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #120d17 0%, #050407 55%, #17120d 100%)',
        'gradient-gold-fade': 'linear-gradient(180deg, rgba(197, 165, 123, 0.15) 0%, transparent 100%)',
        'gradient-cta': 'linear-gradient(135deg, #c5a57b 0%, #d4b88e 50%, #e5d3b8 100%)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.8s ease-out forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '600': '600ms'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      }
    }
  },
  plugins: []
};

export default config;
