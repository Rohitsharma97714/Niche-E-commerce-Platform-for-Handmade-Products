module.exports = {
  content: ["./src/**/*.{js,jsx}"], // Adjust if needed
  darkMode: 'class',
  theme: {
    extend: {
      scrollbar: {
        hide: {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      },
    },
  },
  plugins: [],
};
