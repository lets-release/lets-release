import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import config from "../../vitest.unit.config";

export default mergeConfig(
  config,
  defineConfig({
    test: {
      name: "npm.unit",
    },
  }),
);
