import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import viteConfig from "../../vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: "github.unit",
      include: ["src/**/*.spec.ts"],
      exclude: ["src/queries/*.ts"],
    },
  }),
);
