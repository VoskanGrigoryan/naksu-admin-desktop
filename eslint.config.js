import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "coverage", "node_modules"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Enforce triple-slash type imports to keep bundles clean
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Warn on any — acceptable sometimes but worth flagging
      "@typescript-eslint/no-explicit-any": "warn",

      // Flag non-null assertions — use proper type narrowing instead
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Catch accidental == comparisons
      eqeqeq: ["error", "always", { null: "ignore" }],

      // Leftover console statements should not ship
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Prefer object spread over Object.assign
      "prefer-object-spread": "error",

      // Unused vars are already caught by tsc, but ESLint catches more patterns
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Relax rules inside test files
  {
    files: ["**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Test helpers often use `any` for mock data
      "@typescript-eslint/no-explicit-any": "off",
      // Non-null assertions are fine in tests where we control the data
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
    },
  },
]);
