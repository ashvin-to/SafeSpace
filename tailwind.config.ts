import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SafeSpace AI Color Palette
        background: '#0F1117',
        'accent-danger': '#FF3B30',
        'accent-caution': '#FFAA00',
        'accent-safe': '#34C759',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A6',
        'border-color': '#30363D',
        'card-bg': '#1C1F26',
      },
      fontSize: {
        'header-xl': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.32px' }],
        'header-lg': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.24px' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-base': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '18px', fontWeight: '500', letterSpacing: '0.5px' }],
      },
      spacing: {
        'safe-area': '16px',
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'sos': '0 8px 24px rgba(255, 59, 48, 0.4)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-sos': 'pulseSOS 2s ease-in-out infinite',
      },
      keyframes: {
        pulseSOS: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config
