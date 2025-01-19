import { LetsReleaseError } from "@lets-release/config";

export class NeedAuthError extends LetsReleaseError {
  message = "Need auth";

  constructor(private registry: string) {
    super();
  }

  get details() {
    return `You need to authorize this machine to publish to the registry \`${this.registry}\`.`;
  }
}
