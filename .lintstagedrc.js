module.exports = {
  // Run ESLint on TypeScript and JavaScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'eslint', // Check again after fixes
  ],

  // Format all supported files with Prettier (if you add it later)
  // '*.{js,jsx,ts,tsx,json,css,scss,md}': ['prettier --write'],

  // Type-check TypeScript files
  '*.{ts,tsx}': () => 'tsc --noEmit',
};
