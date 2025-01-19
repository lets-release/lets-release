import path from "node:path";

import { NormalizedPackageJson, readPackageSync } from "read-pkg";

const {
  name,
  description = "Run automated workspace packages releasing",
  version,
  engines,
  homepage = "https://github.com/lets-release/lets-release",
}: NormalizedPackageJson = readPackageSync({
  cwd: path.resolve(import.meta.dirname, "../"),
});
const defaultGitUserName = `${name}-bot`;
const defaultGitUserEmail = `${name}-bot@github.com`;
const [homepagePath] = homepage.split("#");

export {
  name,
  description,
  version,
  engines,
  homepagePath as homepage,
  defaultGitUserName,
  defaultGitUserEmail,
};
