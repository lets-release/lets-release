import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";

export interface NpmPackageManager {
  /**
   * The name of the package manager.
   *
   * @type {NpmPackageManagerName}
   * @memberof NpmPackageManager
   */
  name: NpmPackageManagerName;

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
