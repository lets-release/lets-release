import { compareSemVers } from "src/helpers/compareSemVers";
import { parseSemVer } from "src/helpers/parseSemVer";

export function isSemVerSatisfiedRange(
  version: string,
  min: string,
  max?: string,
) {
  const { major, minor, patch } = parseSemVer(version);

  return (
    compareSemVers(`${major}.${minor}.${patch}`, min) >= 0 &&
    (!max || compareSemVers(version, max) < 0)
  );
}
