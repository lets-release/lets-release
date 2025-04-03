import { isString } from "lodash-es";
import { Options, readPackageUp } from "read-package-up";

export async function getRepoUrl(options: Options) {
  const { packageJson } = (await readPackageUp(options)) ?? {};

  if (!packageJson) {
    return;
  }

  if (isString(packageJson.repository)) {
    return packageJson.repository;
  }

  return packageJson.repository?.url;
}
