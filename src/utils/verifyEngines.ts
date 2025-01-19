import { satisfies } from "semver";

import { UnsupportedNodeVersionError } from "src/errors/UnsupportedNodeVersionError";
import { engines } from "src/program";

export function verifyEngines() {
  if (engines && !satisfies(process.version, engines.node)) {
    throw new UnsupportedNodeVersionError(engines.node, process.version);
  }
}
