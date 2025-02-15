import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import config from "../../vite.config";

export default mergeConfig(
  config,
  defineConfig({
    test: {
      name: "github.e2e",
      testTimeout: 30_000,
      include: ["test/**/*.spec.ts"],
    },
  }),
);
