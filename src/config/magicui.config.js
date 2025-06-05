const magicUIConfig = {
  theme: {
    colors: {
      primary: {
        50: '#f0f7ff',
        100: '#e0eefe',
        200: '#b9ddfe',
        300: '#7cc2fd',
        400: '#36a6fa',
        500: '#0c87eb',
        600: '#006bc9',
        700: '#0055a3',
        800: '#004886',
        900: '#003c6f',
        950: '#00264a',
      },
      accent: {
        50: '#f0fbfd',
        100: '#d0f3fa',
        200: '#a3e8f5',
        300: '#67d6ed',
        400: '#22bde0',
        500: '#0c9fc1',
        600: '#0b7fa1',
        700: '#0c6583',
        800: '#0f516b',
        900: '#124459',
        950: '#082c3b',
      },
    },
    animation: {
      'gradient-x': 'gradient-x 15s ease infinite',
      'gradient-y': 'gradient-y 15s ease infinite',
      'gradient-xy': 'gradient-xy 15s ease infinite',
      shimmer: 'shimmer 2s linear infinite',
      'glow-line-horizontal': 'glow-line-horizontal 3s infinite linear',
      'glow-line-vertical': 'glow-line-vertical 3s infinite linear',
      'fade-in': 'fade-in 1s ease-out forwards',
      'fade-up': 'fade-up 1s ease-out forwards',
      'fade-down': 'fade-down 1s ease-out forwards',
    },
    keyframes: {
      'gradient-y': {
        '0%, 100%': {
          'background-size': '400% 400%',
          'background-position': 'center top'
        },
        '50%': {
          'background-size': '200% 200%',
          'background-position': 'center center'
        }
      },
      'gradient-x': {
        '0%, 100%': {
          'background-size': '200% 200%',
          'background-position': 'left center'
        },
        '50%': {
          'background-size': '200% 200%',
          'background-position': 'right center'
        }
      },
      'gradient-xy': {
        '0%, 100%': {
          'background-size': '400% 400%',
          'background-position': 'left center'
        },
        '50%': {
          'background-size': '200% 200%',
          'background-position': 'right center'
        }
      },
      shimmer: {
        '0%': {
          'background-position': '-700px 0',
        },
        '100%': {
          'background-position': '700px 0',
        },
      },
      'glow-line-horizontal': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      'glow-line-vertical': {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(100%)' },
      },
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      'fade-up': {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      'fade-down': {
        '0%': { opacity: '0', transform: 'translateY(-10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },
  utilities: {
    '.glass': {
      'background': 'rgba(255, 255, 255, 0.05)',
      'backdrop-filter': 'blur(8px)',
      'border': '1px solid rgba(255, 255, 255, 0.1)',
      'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    '.glow-sm': {
      'box-shadow': '0 0 15px rgba(56, 189, 248, 0.3)',
    },
    '.glow-md': {
      'box-shadow': '0 0 25px rgba(56, 189, 248, 0.4)',
    },
    '.glow-lg': {
      'box-shadow': '0 0 35px rgba(56, 189, 248, 0.5)',
    },
    '.space-dots': {
      'background-image': 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
      'background-size': '20px 20px',
    },
  },
};

module.exports = magicUIConfig; 