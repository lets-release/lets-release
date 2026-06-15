import { LetsReleaseError } from "@lets-release/config";

export class DuplicatePackagesError extends LetsReleaseError {
  constructor(private duplicates: string[]) {
    super();
  }

  get message() {
    return "Duplicate packages found.";
  }

  get details() {
    return `The following packages are duplicated: ${this.duplicates.join(", ")}.`;
  }
}
