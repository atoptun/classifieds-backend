import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src/generated/**",
      "eslint.config.mjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
         },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  eslintConfigPrettier, // always keep last
);
