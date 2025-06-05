const theme = {
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0effe',
      200: '#bae2fd',
      300: '#7ccffc',
      400: '#36b3f9',
      500: '#0c96eb',
      600: '#0072c9',
      700: '#0058a3',
      800: '#004886',
      900: '#003c6f',
      950: '#00264a',
    },
    accent: {
      50: '#f2f7fd',
      100: '#e4eefa',
      200: '#c3ddf5',
      300: '#90c3ec',
      400: '#55a1e0',
      500: '#3182d1',
      600: '#2465b7',
      700: '#1f5195',
      800: '#1d447a',
      900: '#1b3a65',
      950: '#112544',
    },
    success: {
      light: '#ecfdf5',
      main: '#10b981',
      dark: '#059669'
    },
    warning: {
      light: '#fffbeb',
      main: '#f59e0b',
      dark: '#d97706'
    },
    error: {
      light: '#fef2f2',
      main: '#ef4444',
      dark: '#dc2626'
    },
    info: {
      light: '#f0f9ff',
      main: '#0ea5e9',
      dark: '#0284c7'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
  gradients: {
    primary: 'from-primary-400 to-primary-600',
    accent: 'from-accent-400 to-accent-600',
    success: 'from-success-main to-success-dark',
    warning: 'from-warning-main to-warning-dark',
    error: 'from-error-main to-error-dark',
    info: 'from-info-main to-info-dark',
    cool: 'from-primary-400 to-accent-400',
    warm: 'from-warning-main to-error-main',
    night: 'from-secondary-800 to-secondary-900',
  },
  glass: {
    light: 'bg-white/80 backdrop-blur-md border border-white/20',
    dark: 'bg-secondary-900/80 backdrop-blur-md border border-secondary-800/20',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    glow: {
      primary: 'shadow-primary-500/20',
      accent: 'shadow-accent-500/20',
      success: 'shadow-success-main/20',
      warning: 'shadow-warning-main/20',
      error: 'shadow-error-main/20',
    },
  },
};

export default theme; 