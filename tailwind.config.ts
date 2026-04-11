/* Tailwind config for the frontend react app. This is where the app theme should be defined: https://v2.tailwindcss.com/docs/configuration. */
import type { Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import typographyPlugin from '@tailwindcss/typography'
import aspectRatioPlugin from '@tailwindcss/aspect-ratio'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'Inter var', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: '#dcd9c6',
        input: '#dcd9c6',
        ring: '#3D000C',
        background: '#F6F3E4',
        foreground: '#5E5A57',
        primary: {
          DEFAULT: '#3D000C',
          foreground: '#F6F3E4',
        },
        secondary: {
          DEFAULT: '#5E5A57',
          foreground: '#F6F3E4',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: '#e6e3d4',
          foreground: '#5E5A57',
        },
        accent: {
          DEFAULT: '#050201',
          foreground: '#F6F3E4',
        },
        popover: {
          DEFAULT: '#F6F3E4',
          foreground: '#5E5A57',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#5E5A57',
        },
        sidebar: {
          DEFAULT: '#F6F3E4',
          foreground: '#5E5A57',
          primary: '#3D000C',
          'primary-foreground': '#F6F3E4',
          accent: '#050201',
          'accent-foreground': '#F6F3E4',
          border: '#dcd9c6',
          ring: '#3D000C',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionProperty: {
        width: 'width',
        height: 'height',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        elevation: '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.42, 0, 0.58, 1)',
      },
    },
  },
  plugins: [animatePlugin, typographyPlugin, aspectRatioPlugin],
} satisfies Config
