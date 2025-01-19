import { LetsReleaseError } from "@lets-release/config";

export class InvalidGitLabUrlError extends LetsReleaseError {
  message = "The git repository URL is not a valid GitLab URL.";
  details = `The **lets-release** \`repositoryUrl\` option must a valid GitLab URL with the format \`<GitLab_URL>/<repoId>.git\`.

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url][] of the repository cloned by your CI environment.

[git origin url]: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes`;

  constructor() {
    super();
  }
}
