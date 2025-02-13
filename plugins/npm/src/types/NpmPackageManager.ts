export interface NpmPackageManager {
  name: "npm" | "pnpm" | "yarn";
  version: string;
  root: string;
}
