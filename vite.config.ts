import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default mergeConfig(
  defineViteConfig({
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [],
  }),
  defineVitestConfig({
    test: {
      globals: true,
      coverage: {
        include: ["src/**/*.ts"],
        exclude: [
          "src/**/index.ts",
          "src/**/*.spec.ts",
          "src/**/*.d.ts",
          "src/cli.ts",
          "src/program.ts",
          "src/plugin.ts",
          "src/__fixtures__/*.ts",
          "src/constants/*.ts",
          "src/enums/*.ts",
          "src/types/*.ts",
        ],
        thresholds: {
          100: true,
        },
      },
    },
  }),
);
