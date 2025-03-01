import { LetsReleaseError } from "@lets-release/config";

export class NoNpmPackageNameError extends LetsReleaseError {
  message = "Missing `name` property in `package.json`";
  details = `The \`package.json\`'s [name][] property is required in order to publish a package to the npm registry.

Please make sure to add a valid \`name\` for your package in your \`package.json\`.

[name]: https://docs.npmjs.com/files/package.json#name`;
}
