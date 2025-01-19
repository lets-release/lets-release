import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      testTimeout: 240_000,
      globalSetup: "./test/__global__/setup.ts",
      include: ["test/**/*.spec.ts"],
    },
  }),
);
