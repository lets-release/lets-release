import { LetsReleaseError } from "@lets-release/config";

export class NoMainBranchError extends LetsReleaseError {
  get message() {
    return "No main branch found.";
  }

  get details() {
    return `A main branch is required and must exist on the remote repository.

This may occur if your repository does not have a main branch, such as \`master\` or \`main\`.`;
  }

  constructor() {
    super();
  }
}
