import path from "node:path";

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    tsconfigPaths: false,
  },
  plugins: [
    tsconfigPaths({
      root: path.resolve(import.meta.dirname, "../../"),
    }),
  ],
});
