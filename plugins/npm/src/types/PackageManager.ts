export interface PackageManager {
  name: "npm" | "pnpm" | "yarn" | "bun";
  version: string;
}
