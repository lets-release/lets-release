export interface NpmPackageManager {
  /**
   * The name of the package manager.
   *
   * @type {"npm" | "pnpm" | "yarn"}
   * @memberof NpmPackageManager
   */
  name: "npm" | "pnpm" | "yarn";

  /**
   * The version of the package manager.
   *
   * @type {string}
   * @memberof NpmPackageManager
   */
  version: string;

  /**
   * The workspace root.
   *
   * @type {string}
   * @memberof NpmPackageManager
   */
  root: string;
}
