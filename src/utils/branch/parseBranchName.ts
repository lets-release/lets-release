import { escapeRegExp } from "lodash-es";

export function parseBranchName(
  ref: string,
  packages?: string[],
  separator = "/",
): {
  package?: string;
  range: string;
} {
  if (!packages?.length) {
    return {
      range: ref,
    };
  }

  const [name, range] =
    new RegExp(
      `^((${packages.map((name) => escapeRegExp(name)).join("|")})${escapeRegExp(separator)})(.+)$`,
    )
      .exec(ref)
      ?.slice(2) ?? [];

  return {
    package: name,
    range: range ?? ref,
  };
}
