module.exports = {
  prefix: '',
  purge: {
    content: [
      './src/**/*.{html,ts}',
    ]
  },
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'soft-black': '#1a1a1a',
        'hard-black': '#131313',
        'medium-black': '#202020',
        'purple-accent': '#705df2',
        'soft-grey': '#272727',
        'hard-purple': '#5c43f5'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
