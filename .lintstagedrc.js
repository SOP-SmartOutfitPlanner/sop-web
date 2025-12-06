module.exports = {
  // Run ESLint on TypeScript and JavaScript files
  "*.{js,jsx,ts,tsx,json,css,scss,mjs,dockerfile,Dockerfile}": ["eslint --fix"],

  // Format all supported files with Prettier (if you add it later)
  // '*.{js,jsx,ts,tsx,json,css,scss,md}': ['prettier --write'],

  // Type-check TypeScript files and run build
  "*.{ts,tsx}": () => "tsc --noEmit",
};
