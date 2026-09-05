import path from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
  root: path.resolve(import.meta.dirname, "../../"),
  resolve: {
    tsconfigPaths: true,
  },
});
