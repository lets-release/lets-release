import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";

export interface PyPIPackageManager {
  /**
   * The name of the package manager.
   *
   * @type {PyPIPackageManagerName}
   * @memberof PyPIPackageManager
   */
  name: PyPIPackageManagerName;

  /**
   * The version of the package manager.
   *
   * @type {string}
   * @memberof PyPIPackageManager
   */
  version: string;

  /**
   * The workspace root.
   *
   * @type {string}
   * @memberof PyPIPackageManager
   */
  root: string;
}
