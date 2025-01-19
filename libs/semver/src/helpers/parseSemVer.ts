import { escapeRegExp, isNil } from "lodash-es";

import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_SEMVER_PRERELEASE_OPTIONS";
import { REGULAR_EXPRESSIONS } from "src/constants/REGULAR_EXPRESSIONS";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";
import { ParsedSemVer } from "src/types/ParsedSemVer";

export function parseSemVer(
  version: string,
  options?: SemVerPrereleaseOptions, // not forced
): ParsedSemVer {
  const trimmedVersion = version.trim();
  const parts = trimmedVersion.match(REGULAR_EXPRESSIONS.LOOSE);

  if (!parts) {
    throw new TypeError(`Invalid SemVer ${version}`);
  }

  // these are actually numbers
  const major = +parts[1];
  const minor = +parts[2];
  const patch = +parts[3];

  if (major > Number.MAX_SAFE_INTEGER || major < 0) {
    throw new TypeError("Invalid major version");
  }

  if (minor > Number.MAX_SAFE_INTEGER || minor < 0) {
    throw new TypeError("Invalid minor version");
  }

  if (patch > Number.MAX_SAFE_INTEGER || patch < 0) {
    throw new TypeError("Invalid patch version");
  }

  const prerelease = parts[4];
  const prereleaseOptions = {
    ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
    ...options,
  };
  const build = parts[5];

  if (!prerelease) {
    return {
      major,
      minor,
      patch,
      prereleaseOptions,
      build,
    };
  }

  const [prefix] =
    trimmedVersion
      .match(`(-)${escapeRegExp(`${prerelease}${build ? `+${build}` : ""}`)}$`)
      ?.slice(1) ?? [];

  if (!prefix && prereleaseOptions.prefix !== "") {
    prereleaseOptions.prefix = "";
  }

  const identifiers = (
    prefix && options?.prefix === "" ? `${prefix}${prerelease}` : prerelease
  )
    .split(".")
    .filter((id) => id !== "");
  const lastIdentifier = identifiers?.at(-1)?.toString();

  let prereleaseName: string | undefined = undefined;
  let prereleaseIdentifiers: string[] | undefined = undefined;
  let prereleaseNumber: number | undefined = undefined;

  // 1.0.0-0
  // 1.0.0-0.0
  // 1.0.0-alpha
  // 1.0.0-alpha.0
  // 1.0.0-alpha.0.0
  // 1.0.0-alpha0
  // 1.0.0-alpha0.0
  // 1.0.0alpha
  // 1.0.0alpha.0
  // 1.0.0alpha.0.0
  // 1.0.0alpha0
  // 1.0.0alpha0.0
  if (lastIdentifier && /^\d+$/.test(lastIdentifier)) {
    prereleaseIdentifiers = identifiers.slice(0, -1);
    prereleaseNumber = Number(lastIdentifier);
    prereleaseOptions.suffix = ".";
  } else {
    const [id, num] =
      lastIdentifier?.match(/^(.*)?((?<=\D)\d+)$/)?.slice(1) ?? [];

    if (options?.suffix === "." || !id || !num) {
      prereleaseIdentifiers = identifiers;
    } else {
      prereleaseIdentifiers = [...identifiers.slice(0, -1), id];
      prereleaseNumber = Number(num);
      prereleaseOptions.suffix = "";
    }
  }

  prereleaseName = prereleaseIdentifiers?.join(".");

  if (!isNil(prereleaseNumber)) {
    const id = prereleaseIdentifiers.at(-1);

    prereleaseOptions.initialNumber = prereleaseNumber > 0 ? 1 : 0;
    prereleaseOptions.ignoreZeroNumber =
      prereleaseNumber !== 0 && !!id && !/^\d+$/.test(id);
  }

  return {
    major,
    minor,
    patch,
    prereleaseName,
    prereleaseNumber,
    prereleaseOptions,
    build,
  };
}
