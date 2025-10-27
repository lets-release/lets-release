import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import viteConfig from "../../vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: "testing.e2e",
      include: ["test/**/*.spec.ts"],
      testTimeout: 120_000,
    },
  }),
);
