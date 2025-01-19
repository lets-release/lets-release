import { PackageManager } from "src/types/PackageManager";

export interface NpmPackageContext {
  pm?: PackageManager;
  cwd: string;
  scope?: string;
  registry: string;
  prepared?: boolean;
}
