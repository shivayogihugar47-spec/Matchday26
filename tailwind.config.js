/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FIFA World Cup 2026 Host Country Colors
        wc: {
          canada: {
            100: '#FFB3B3',
            500: '#FF3B30',
            900: '#C50F1F',
          },
          mexico: {
            100: '#B8F2C9',
            500: '#00C853',
            900: '#009624',
          },
          usa: {
            100: '#B3D4FC',
            500: '#007AFF',
            900: '#0056B3',
          },
          // Brand colors
          primary: '#FFD700', // Gold Trophy
          secondary: '#0F172A', // Dark Navy
          accent: '#3B82F6', // Blue
        },
        // Matchday colors
        match: {
          red: '#EF4444',
          yellow: '#F59E0B',
          green: '#10B981',
          blue: '#3B82F6',
        },
        background: {
          DEFAULT: '#050509',
          card: 'rgba(255, 255, 255, 0.04)',
          cardHover: 'rgba(255, 255, 255, 0.07)',
        },
        neutral: {
          100: '#F8FAFC',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        display: ['"Oswald"', '"Bebas Neue"', 'sans-serif'],
        body: ['"Inter"', '"Poppins"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 10px 40px rgba(0, 0, 0, 0.35)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.25)',
        'glow-gold': '0 0 30px rgba(255, 215, 0, 0.35)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
