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
          300: '#e0c254',
          400: '#d4af37',
          500: '#b8922a',
          600: '#8f6f1f',
          700: '#6b5217',
        },
        ink: {
          900: '#050505',
          800: '#0a0a0b',
          700: '#111113',
          600: '#17171a',
          500: '#1d1d21',
          400: '#25252b',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        heebo:   ['"Heebo"', 'system-ui', 'sans-serif'],
        sans:    ['"Heebo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 40px -10px rgba(212, 175, 55, 0.5)',
        'luxe': '0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #e0c254 0%, #d4af37 40%, #8f6f1f 100%)',
        'radial-glow':   'radial-gradient(ellipse at top, rgba(212,175,55,0.15), transparent 60%)',
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
