import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: "unit",
      include: ["src/**/*.spec.ts"],
    },
  }),
);
