import { defineConfig, mergeConfig } from "vitest/config";

// eslint-disable-next-line import-x/no-relative-parent-imports
import viteConfig from "../../vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: "gitlab.unit",
      include: ["src/**/*.spec.ts"],
    },
  }),
);
