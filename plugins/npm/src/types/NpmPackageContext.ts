import { NormalizedPackageJson } from "read-pkg";

import { NpmPackageManager } from "src/types/NpmPackageManager";

export interface NpmPackageContext {
  /**
   * The package manager.
   *
   * @type {NpmPackageManager}
   * @memberof NpmPackageContext
   */
  pm: NpmPackageManager;

  /**
   * The package.json.
   *
   * @type {NormalizedPackageJson}
   * @memberof NpmPackageContext
   */
  pkg: NormalizedPackageJson;

  /**
   * The scope of the package.
   *
   * @type {string}
   * @memberof NpmPackageContext
   */
  scope?: string;

  /**
   * The publish registry of the package.
   *
   * @type {string}
   * @memberof NpmPackageContext
   */
  registry: string;

  /**
   * Are all conditions verified?
   *
   * @type {boolean}
   * @memberof NpmPackageContext
   */
  verified?: boolean;

  /**
   * Is the package prepared?
   *
   * @type {boolean}
   * @memberof NpmPackageContext
   */
  prepared?: boolean;
}
