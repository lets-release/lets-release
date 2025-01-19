import { LetsReleaseError } from "@lets-release/config";

export class InvalidGitHubUrlError extends LetsReleaseError {
  message = "The git repository URL is not a valid GitHub URL.";
  details = `The **lets-release** \`repositoryUrl\` option must a valid GitHub URL with the format \`<GitHub_or_GHE_URL>/<owner>/<repo>.git\`.

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url][] of the repository cloned by your CI environment.

[git origin url]: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes`;

  constructor() {
    super();
  }
}
