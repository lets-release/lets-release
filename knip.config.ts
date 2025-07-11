import { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: "src/{index,cli}.ts",
      project: ["src/**", "test/**", "!**/*.spec.ts"],
      ignore: ["test/__fixtures__/**"],
      ignoreDependencies: [
        "@aliser/ts-transformer-append-js-extension",
        "prettier-eslint",
        "typescript-transform-paths",
      ],
    },
    "libs/*": {
      project: ["**/*.ts", "!**/*.spec.ts"],
    },
    "plugins/*": {
      project: ["**/*.ts", "!**/*.spec.ts"],
    },
    "plugins/(commit-analyzer|release-notes-generator)": {
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
