import { LetsReleaseError } from "@lets-release/config";

export class DuplicatePackagesError extends LetsReleaseError {
  get message() {
    return "Duplicate packages found.";
  }

  get details() {
    return `The following packages are duplicated: ${this.duplicates.join(", ")}.`;
  }

  constructor(private duplicates: string[]) {
    super();
  }
}
