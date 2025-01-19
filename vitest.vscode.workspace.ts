import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./vitest.config.{e2e,unit}.ts",
  "libs/*/vitest.config.{e2e,unit}.ts",
  "plugins/*/vitest.config.{e2e,unit}.ts",
]);
