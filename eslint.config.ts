import eslintJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { TSESLint } from "@typescript-eslint/utils";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { flatConfigs } from "eslint-plugin-import-x";
import prettierPluginRecommended from "eslint-plugin-prettier/recommended";
import unicornPlugin from "eslint-plugin-unicorn";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import globals from "globals";
import { config, configs } from "typescript-eslint";

const eslintConfig: TSESLint.FlatConfig.ConfigArray = config(
  eslintJs.configs.recommended,
  ...configs.recommendedTypeChecked,
  ...configs.stylisticTypeChecked,
  flatConfigs.recommended,
  flatConfigs.typescript,
  unicornPlugin.configs.recommended,
  prettierPluginRecommended,
  // global ignores
  { ignores: ["**/coverage", "**/dist"] },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: "module",
        globals: {
          ...globals.node,
          ...globals.vitest,
        },
      },
    },
    plugins: {
      "unused-imports": unusedImportsPlugin,
    },
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: [
            "tsconfig.json",
            "tsconfig.eslint.json",
            "libs/*/tsconfig.json",
            "plugins/*/tsconfig.json",
          ],
        }),
      ],
      "import-x/internal-regex": "^(src/|test/|lets-release/?|@lets-release/*)",
    },
    rules: {
      "sort-imports": [
        "warn",
        {
          ignoreDeclarationSort: true,
        },
      ],
      "import-x/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "unknown",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "lets-release",
              group: "internal",
            },
            {
              pattern: "lets-release/**",
              group: "internal",
            },
            {
              pattern: "@lets-release/**",
              group: "internal",
            },
            {
              pattern: "src/**",
              group: "parent",
            },
            {
              pattern: "test/**",
              group: "parent",
            },
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          warnOnUnassignedImports: true,
        },
      ],
      "import-x/newline-after-import": "error",
      "import-x/no-relative-parent-imports": [
        "error",
        {
          ignore: ["^src/", "^test/", "^lets-release/?", "^@lets-release/"],
        },
      ],
      "@typescript-eslint/class-literal-property-style": ["error", "getters"],
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "unicorn/filename-case": "off",
      "unicorn/no-object-as-default-parameter": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/no-array-reduce": "off",
    },
  },
);

export default eslintConfig;
