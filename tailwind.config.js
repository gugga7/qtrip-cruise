/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    {
      // Add your niche's primary + accent color names here when forking
      pattern: /^(bg|text|border|border-t|ring|from|to|via|shadow)-(pink|rose|fuchsia|blue|indigo|emerald|amber|purple|teal|orange|violet|slate)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
