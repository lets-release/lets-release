import { SEMVER } from "src/constants/SEMVER";
import { ParsedSemVer } from "src/types/ParsedSemVer";

export function parseSemVer(
  version: string,
  prereleaseName?: string,
): ParsedSemVer {
  const trimmedVersion = version.trim();
  const match = trimmedVersion.match(SEMVER);

  if (!match?.groups) {
    throw new TypeError(`Invalid SemVer: ${version}`);
  }

  const major = +match.groups.major;
  const minor = +match.groups.minor;
  const patch = +match.groups.patch;

  if (major > Number.MAX_SAFE_INTEGER || major < 0) {
    throw new TypeError("Invalid major version");
  }

  if (minor > Number.MAX_SAFE_INTEGER || minor < 0) {
    throw new TypeError("Invalid minor version");
  }

  if (patch > Number.MAX_SAFE_INTEGER || patch < 0) {
    throw new TypeError("Invalid patch version");
  }

  const build = match.groups.build;

  if (!match.groups.prerelease) {
    return {
      major,
      minor,
      patch,
      build,
    };
  }

  const identifiers = match.groups.prerelease.split(".");
  const nameIdentifiers = identifiers.slice(0, -1);
  const numberIdentifier = identifiers?.at(-1);

  if (prereleaseName) {
    if (prereleaseName === identifiers.join(".")) {
      return {
        major,
        minor,
        patch,
        prereleaseName,
        build,
      };
    }

    if (
      prereleaseName === nameIdentifiers.join(".") &&
      numberIdentifier &&
      /^\d+$/.test(numberIdentifier)
    ) {
      return {
        major,
        minor,
        patch,
        prereleaseName,
        prereleaseNumber: Number(numberIdentifier),
        build,
      };
    }

    throw new TypeError(
      `Prerelease name not match: "${prereleaseName}" expected`,
    );
  }

  if (numberIdentifier && /^\d+$/.test(numberIdentifier)) {
    return {
      major,
      minor,
      patch,
      prereleaseName:
        nameIdentifiers.length > 0 ? nameIdentifiers.join(".") : undefined,
      prereleaseNumber: Number(numberIdentifier),
      build,
    };
  }

  return {
    major,
    minor,
    patch,
    prereleaseName: identifiers.join("."),
    build,
  };
}
