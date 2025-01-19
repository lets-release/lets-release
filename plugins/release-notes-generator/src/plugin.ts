import path from "node:path";

import { NormalizedPackageJson, readPackageSync } from "read-pkg";

const {
  name,
  description = "Let's Release release-notes-generator plugin",
  version,
  homepage = "https://github.com/lets-release/lets-release/tree/main/plugins/release-notes-generator",
}: NormalizedPackageJson = readPackageSync({
  cwd: path.resolve(import.meta.dirname, "../"),
});
const [homepagePath] = homepage.split("#");

export { name, description, version, homepagePath as homepage };
