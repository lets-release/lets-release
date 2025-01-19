import { compareCalVers } from "src/helpers/compareCalVers";
import { formatCalVer } from "src/helpers/formatCalVer";
import { parseCalVer } from "src/helpers/parseCalVer";

export function isCalVerSatisfiedRange(
  format: string,
  version: string,
  min: string,
  max?: string,
) {
  const {
    prereleaseName: _prereleaseName,
    prereleaseNumber: _prereleaseNumber,
    build: _build,
    ...rest
  } = parseCalVer(format, version);

  return (
    compareCalVers(format, formatCalVer(format, rest), min) >= 0 &&
    (!max || compareCalVers(format, version, max) < 0)
  );
}
