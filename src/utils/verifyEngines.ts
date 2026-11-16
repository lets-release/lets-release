import { satisfies } from "semver";

import { UnsupportedNodeVersionError } from "src/errors/UnsupportedNodeVersionError";
import { engines } from "src/program";

export function verifyEngines() {
  if (
    engines?.node &&
    !satisfies(process.version, engines.node, { includePrerelease: true })
  ) {
    throw new UnsupportedNodeVersionError(engines.node, process.version);
  }
}
