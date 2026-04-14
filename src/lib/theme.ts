export const THEME = {
  colors: {
    brand: {
      primary: '#800020',
      secondary: '#5E5A57',
    },
    status: {
      healthy: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
    },
  },
  typography: {
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    p: '1rem',
    sm: '0.875rem',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    elevation: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
} as const
