import { parseCalVerFormat } from "@lets-release/calver";
import { ReleaseType } from "@lets-release/config";

export function getCalVerReleaseType(
  format: string,
  type: ReleaseType,
): "major" | "minor" | "micro" {
  const {
    tokens: { minor, micro },
  } = parseCalVerFormat(format);

  if (minor) {
    return {
      [ReleaseType.major]: "major" as const,
      [ReleaseType.minor]: "minor" as const,
      [ReleaseType.patch]: "micro" as const,
    }[type];
  }

  if (micro) {
    return {
      [ReleaseType.major]: "major" as const,
      [ReleaseType.minor]: "micro" as const,
      [ReleaseType.patch]: "micro" as const,
    }[type];
  }

  return "major";
}
