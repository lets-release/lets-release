import { NormalizedPackageJson } from "read-pkg";

import { NpmPackageManager } from "src/types/NpmPackageManager";

export interface NpmPackageContext {
  pm: NpmPackageManager;
  pkg: NormalizedPackageJson;
  scope?: string;
  registry: string;
  verified?: boolean;
  prepared?: boolean;
}
