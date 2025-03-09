import { NpmPackageManagerName } from "src/enums/NpmPackageManagerName";

export const MIN_REQUIRED_PM_VERSIONS: Record<NpmPackageManagerName, string> = {
  [NpmPackageManagerName.npm]: "8.5.0",
  [NpmPackageManagerName.pnpm]: "8.0.0",
  [NpmPackageManagerName.yarn]: "4.0.0",
};
