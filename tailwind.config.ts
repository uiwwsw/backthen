import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        'muted-ink': 'var(--muted-ink)',
        'tabloid-red': 'var(--tabloid-red)',
        'photo-shadow': 'var(--photo-shadow)',
        line: 'var(--line)'
      },
      fontFamily: {
        newspaper: ['var(--font-newspaper)', 'serif'],
        display: ['var(--font-display)', 'serif'],
        tabloid: ['var(--font-tabloid)', 'serif'],
        sans: ['var(--font-interface)', 'serif']
      },
      boxShadow: {
        paper: '0 20px 70px rgba(0, 0, 0, 0.18)'
      },
      backgroundImage: {
        grain: "url('/textures/paper-grain.svg')",
        halftone: "url('/textures/halftone-dots.svg')"
      }
    }
  },
  plugins: []
};

export default config;
