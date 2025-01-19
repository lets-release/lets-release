import { LetsReleaseError } from "@lets-release/config";

export class NoPackageError extends LetsReleaseError {
  message = "Missing `package.json` file";
  details = `A [package.json file][] at the root of your project is required to release on npm.

Please follow the [npm guideline][] to create a valid \`package.json\` file.

[package.json file]: https://docs.npmjs.com/files/package.json
[npm guideline]: https://docs.npmjs.com/getting-started/creating-node-modules`;
}
