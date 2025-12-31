const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/build/**",
      "**/eslint.config.*",
      "**/.eslintrc.*",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
];
