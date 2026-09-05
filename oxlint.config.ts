import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "vitest"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  rules: {
    "vitest/no-conditional-expect": "off",
    "vitest/require-mock-type-parameters": "off",
    "vitest/require-to-throw-message": "off",
  },
});
