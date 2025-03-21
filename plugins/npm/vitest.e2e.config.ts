import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import config from "../../vite.config";

export default mergeConfig(
  config,
  defineConfig({
    test: {
      name: "npm.e2e",
      testTimeout: 60_000,
      hookTimeout: 30_000,
      globalSetup: "./test/__global__/setup.ts",
      include: ["test/**/*.spec.ts"],
      env: {
        COREPACK_ENABLE_STRICT: "0",
      },
    },
  }),
);
