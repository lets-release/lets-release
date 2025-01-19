import { LetsReleaseError, Step } from "@lets-release/config";

export class NoPluginStepSpecsError extends LetsReleaseError {
  get message() {
    return `The \`${this.step}\` step configuration is required.`;
  }

  get details() {
    return `The \`${this.step}\` step configuration is required.`;
  }

  constructor(protected step: Step) {
    super();
  }
}
