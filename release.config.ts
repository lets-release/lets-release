export default {
  packages: [
    {
      paths: ["./", "libs/*", "plugins/*"],
    },
  ],
  mainPackage: "lets-release",
  releaseCommit: {
    assets: ["package.json", "libs/*/package.json", "plugins/*/package.json"],
  },
};
