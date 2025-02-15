import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import config from "../../vite.config";

export default mergeConfig(
  config,
  defineConfig({
    test: {
      name: "testing.e2e",
      testTimeout: 120_000,
      include: ["test/**/*.spec.ts"],
    },
  }),
);
