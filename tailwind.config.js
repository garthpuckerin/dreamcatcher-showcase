/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['selector', '[data-theme="ink"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        muted: 'var(--muted)',
        hairline: 'var(--hairline)',
        'hairline-2': 'var(--hairline-2)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        warn: 'var(--warn)',
        good: 'var(--good)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        serif: ['Newsreader', 'Source Serif 4', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '10px',
      },
      fontSize: {
        micro: ['9px', { lineHeight: '1.3', letterSpacing: '0.08em' }],
        mini: ['10px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
