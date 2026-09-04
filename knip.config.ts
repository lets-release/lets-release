import { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: "src/{index,cli}.ts",
      project: ["src/**", "test/**", "!**/*.spec.ts"],
      ignore: ["test/__fixtures__/**", "dist/**"],
      ignoreDependencies: [
        "@aliser/ts-transformer-append-js-extension",
        "prettier-eslint",
        "typescript-transform-paths",
        "vite-tsconfig-paths",
      ],
    },
    "libs/*": {
      project: ["**/*.ts", "!**/*.spec.ts"],
      ignore: ["dist/**"],
    },
    "plugins/*": {
      project: ["**/*.ts", "!**/*.spec.ts"],
      ignore: ["dist/**"],
    },
    "plugins/(commit-analyzer|release-notes-generator)": {
      ignore: ["dist/**"],
      ignoreDependencies: [/conventional-changelog-.*/],
    },
  },
  rules: {
    binaries: "off",
    unresolved: "off",
    enumMembers: "off",
  },
};

export default config;
