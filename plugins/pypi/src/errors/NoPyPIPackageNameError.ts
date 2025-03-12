import { LetsReleaseError } from "@lets-release/config";

export class NoPyPIPackageNameError extends LetsReleaseError {
  message = "Missing `name` property in [project] table of `pyproject.toml`";
  details = `The [\`name\`][] property in [project] table of \`pyproject.toml\` is required in order to publish a package to the PyPI server.

Please make sure to add a valid \`name\` for your package in your \`pyproject.toml\`.

[\`name\`]: https://packaging.python.org/en/latest/specifications/pyproject-toml/#name`;
}
