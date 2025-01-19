import { LetsReleaseError, Package, Step } from "@lets-release/config";

import { name, version } from "src/program";
import { stringify } from "src/utils/stringify";

export class InvalidStepResultError extends LetsReleaseError {
  get message() {
    return `The \`${this.step}\` step returned an invalid value.`;
  }

  get details() {
    return `The \`${this.step}\` function of the \`${this.pluginName}\` returned \`${stringify(this.result)}\`.

We recommend to report the issue to the \`${this.pluginName}\` authors, providing the following information:
- The **${name}** version: \`${version}\`
- The **${name}** logs from your CI job
- The value returned by the plugin: \`${stringify(this.result)}\`

${stringify(this.error)}`;
  }

  constructor(
    protected step: Step,
    protected pluginName: string,
    protected result: unknown,
    protected error: unknown,
    readonly pkg?: Package,
  ) {
    super();
  }
}
