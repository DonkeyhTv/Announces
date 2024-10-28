/** @type {import('tailwindcss').Config} */
module.exports = {
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
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        anthracite: '#222121',
        anthraciteLight: '#2B2A2A',
        grisfonce: '#333333',
        redpink: '#ff005a',
        grisclair: '#f5f5f5',
        grisclair2: '#e4e4e4',
        grismiddle: '#999',
        redlight: '#ffe1ec',
        greenlight: '#D9FFDD',
        bordergray: '#c4c4c4',
        border: '',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      height: {
        70: '70px',
        '3px': '3px',
        '270px': '270px',
        '46px': '46px',
        '40px': '40px',
      },
      width: {
        '85pourcent': '85%',
        '46px': '46px',
      },
      maxWidth: {
        '502px': '502px',
      },
      fontSize: {
        '15px': '15px',
      },
      inset: {
        '-52': '-52px',
        test: '310px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        scroll: 'scroll 20s linear infinite',
      },
      textShadow: {
        centered: '0 0 2px #000000',
      },
      borderRadius: {
        '5px': '5px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
