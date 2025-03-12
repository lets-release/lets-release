import { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: "src/{index,cli}.ts",
      project: ["src/**", "test/**", "!**/*.spec.ts"],
      // FIXME: https://github.com/webpro-nl/knip/issues/859
      eslint: {
        config: ["eslint.config.ts"],
      },
      ignore: ["test/__fixtures__/**"],
      ignoreDependencies: [
        "@aliser/ts-transformer-append-js-extension",
        "prettier-eslint",
        "typescript-transform-paths",
      ],
    },
    "libs/*": {
      entry: "src/index.ts",
      project: ["src/**", "test/**", "!**/*.spec.ts"],
    },
    "plugins/*": {
      entry: "src/index.ts",
      project: ["src/**", "test/**", "!**/*.spec.ts"],
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
