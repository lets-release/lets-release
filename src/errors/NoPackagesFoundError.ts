import { LetsReleaseError } from "@lets-release/config";

export class NoPackagesFoundError extends LetsReleaseError {
  get message() {
    return "No packages found.";
  }

  get details() {
    return "No packages were found in the repository.";
  }
}
