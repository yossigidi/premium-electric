/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fbf7ea',
          100: '#f5ecc7',
          200: '#ecd98a',
          300: '#c9a227',
          400: '#b8922a',
          500: '#9a7b22',
          600: '#7a611b',
          700: '#5a4713',
        },
        // Light surfaces (was dark "ink")
        surface: {
          50:  '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#eeeeee',
          400: '#e0e0e0',
          500: '#bdbdbd',
        },
        // Keep dark palette for hero/footer/chat
        ink: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a22',
          600: '#22222c',
          500: '#2c2c38',
          400: '#383848',
        },
      },
      fontFamily: {
        display: ['"Heebo"', 'system-ui', 'sans-serif'],
        heebo:   ['"Heebo"', 'system-ui', 'sans-serif'],
        sans:    ['"Heebo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px -10px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.05)',
        'gold-glow': '0 0 30px -8px rgba(185,146,42,0.35)',
        'luxe': '0 20px 60px -15px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a227 0%, #b8922a 50%, #9a7b22 100%)',
        'radial-glow':   'radial-gradient(ellipse at top, rgba(185,146,42,0.08), transparent 60%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.8s ease-out both',
        'shimmer':    'shimmer 3s linear infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      }
    }
  },
  plugins: []
}
