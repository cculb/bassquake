import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00ffcc',
        'neon-pink': '#ff0080', 
        'neon-purple': '#7c3aed',
        'dark-bg': '#0a0a0f',
        'dark-surface': 'rgba(20, 20, 30, 0.8)',
        'dark-surface-hover': 'rgba(30, 30, 40, 0.9)',
        'text-dim': 'rgba(255, 255, 255, 0.6)',
        'border-subtle': 'rgba(255, 255, 255, 0.2)'
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a0f1f 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00ffcc 0%, #7c3aed 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #ff0080 0%, #7c3aed 100%)',
        'accent-gradient': 'linear-gradient(135deg, #7c3aed 0%, #ff0080 100%)'
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'mono': ['Monaco', 'Menlo', '"Courier New"', 'monospace']
      },
      backdropBlur: {
        'glass': '10px'
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(0, 255, 204, 0.4), 0 0 20px rgba(0, 255, 204, 0.2), inset 0 0 10px rgba(0, 255, 204, 0.1)',
        'neon-md': '0 0 20px rgba(0, 255, 204, 0.4), 0 0 40px rgba(0, 255, 204, 0.2), inset 0 0 20px rgba(0, 255, 204, 0.1)',
        'neon-lg': '0 0 30px rgba(0, 255, 204, 0.4), 0 0 60px rgba(0, 255, 204, 0.2), inset 0 0 30px rgba(0, 255, 204, 0.1)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.4), 0 0 40px rgba(255, 0, 128, 0.2), inset 0 0 20px rgba(255, 0, 128, 0.1)',
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.4), 0 0 40px rgba(124, 58, 237, 0.2), inset 0 0 20px rgba(124, 58, 237, 0.1)'
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out'
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgba(0, 255, 204, 0.2), 0 0 10px rgba(0, 255, 204, 0.2), 0 0 15px rgba(0, 255, 204, 0.2)' 
          },
          '100%': { 
            boxShadow: '0 0 10px rgba(0, 255, 204, 0.4), 0 0 20px rgba(0, 255, 204, 0.4), 0 0 30px rgba(0, 255, 204, 0.4)' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      gridTemplateColumns: {
        '17': 'repeat(17, minmax(0, 1fr))',
        '18': 'repeat(18, minmax(0, 1fr))'
      },
      screens: {
        'xs': '475px',
        'mobile-lg': '430px',
        'touch': { 'raw': '(hover: none)' },
        'desktop': { 'raw': '(hover: hover)' }
      }
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  }
}

export default config