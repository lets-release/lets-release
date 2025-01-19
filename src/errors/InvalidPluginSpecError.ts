import { LetsReleaseError } from "@lets-release/config";

import { stringify } from "src/utils/stringify";

export class InvalidPluginSpecError extends LetsReleaseError {
  get message() {
    return "A plugin is invalid in the `plugins` configuration.";
  }

  get details() {
    return `Each plugin in the plugins configuration must be an npm module name, an inline plugin, or optionally wrapped in an array with an options object.

The invalid configuration is \`${stringify(this.spec)}\`.

${stringify(this.error)}`;
  }

  constructor(
    private spec: unknown,
    private error: unknown,
  ) {
    super();
  }
}
