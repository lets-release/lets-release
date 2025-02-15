import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./vitest.{e2e,unit}.config.ts",
  "libs/*/vitest.{e2e,unit}.config.ts",
  "plugins/*/vitest.{e2e,unit}.config.ts",
]);
