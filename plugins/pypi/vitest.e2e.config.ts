import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import viteConfig from "../../vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: "pypi.e2e",
      include: ["test/**/*.spec.ts"],
      testTimeout: 60_000,
      hookTimeout: 30_000,
      globalSetup: "./test/__global__/setup.ts",
    },
  }),
);
