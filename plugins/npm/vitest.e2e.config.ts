import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import config from "../../vite.config";

export default mergeConfig(
  config,
  defineConfig({
    test: {
      name: "npm.e2e",
      testTimeout: 90_000,
      hookTimeout: 30_000,
      globalSetup: "./test/__global__/setup.ts",
      include: ["test/**/*.spec.ts"],
    },
  }),
);
