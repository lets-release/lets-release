import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";

export const MIN_REQUIRED_PM_VERSIONS: Record<PyPIPackageManagerName, string> =
  {
    [PyPIPackageManagerName.uv]: "0.5.0",
    [PyPIPackageManagerName.poetry]: "2.0.0",
  };
