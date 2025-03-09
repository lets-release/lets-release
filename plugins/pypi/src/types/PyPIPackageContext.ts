import { PartialRequired } from "@lets-release/config";

import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";
import { PyPIPackageManager } from "src/types/PyPIPackageManager";
import { PyPIRegistry } from "src/types/PyPIRegistry";

export interface PyPIPackageContext {
  /**
   * The package manager.
   *
   * @type {PyPIPackageManager}
   * @memberof PyPIPackageContext
   */
  pm: PyPIPackageManager;

  /**
   * The `pyproject.toml`.
   *
   * @type {NormalizedPyProjectToml}
   * @memberof PyPIPackageContext
   */
  pkg: NormalizedPyProjectToml;

  /**
   * The publish registry of the package.
   *
   * @type {string}
   * @memberof PyPIPackageContext
   */
  registry: PartialRequired<PyPIRegistry, "name">;

  /**
   * Are all conditions verified?
   *
   * @type {boolean}
   * @memberof PyPIPackageContext
   */
  verified?: boolean;

  /**
   * Is the package prepared?
   *
   * @type {boolean}
   * @memberof PyPIPackageContext
   */
  prepared?: boolean;
}
