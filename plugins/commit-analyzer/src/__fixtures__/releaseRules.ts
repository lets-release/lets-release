import { ReleaseType } from "@lets-release/config";

export const releaseRules = [
  { breaking: true, release: ReleaseType.major },
  { type: "feat", release: ReleaseType.minor },
  { type: "fix", release: ReleaseType.patch },
  { type: "perf", release: ReleaseType.patch },
];
