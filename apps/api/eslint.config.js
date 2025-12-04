const { resolve } = require("path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with
 * NestJS apps.
 *
 * This config extends the Manufacturing `eslint-config/base`
 */
module.exports = {
  extends: ["@repo/eslint-config/base.js"],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ["node_modules/", "dist/"],
  rules: {
    "no-useless-constructor": "off",
  }
};
