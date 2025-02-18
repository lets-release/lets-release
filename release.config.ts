export default {
  packages: [
    {
      paths: ["./", "libs/*", "plugins/*"],
    },
  ],
  mainPackage: "lets-release",
  sharedWorkspaceFiles: ["pnpm-lock.yaml"],
  releaseCommit: {
    assets: ["package.json", "libs/*/package.json", "plugins/*/package.json"],
  },
};
