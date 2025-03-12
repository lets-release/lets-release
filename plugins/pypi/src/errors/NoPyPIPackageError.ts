import { LetsReleaseError } from "@lets-release/config";

export class NoPyPIPackageError extends LetsReleaseError {
  message = "Missing `pyproject.toml` file";
  details = `A [pyproject.toml file][] at the root of your project is required to release on PyPI.

Please follow the [guideline][] to create a valid \`pyproject.toml\` file.

[pyproject.toml file]: https://packaging.python.org/en/latest/specifications/pyproject-toml/
[guideline]: https://packaging.python.org/en/latest/guides/writing-pyproject-toml/`;
}
