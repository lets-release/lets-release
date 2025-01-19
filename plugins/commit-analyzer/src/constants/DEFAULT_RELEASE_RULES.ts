import { ReleaseType } from "@lets-release/config";

import { ReleaseRule } from "src/schemas/ReleaseRule";

export const DEFAULT_RELEASE_RULES: ReleaseRule[] = [
  { breaking: true, release: ReleaseType.major },
  { revert: true, release: ReleaseType.patch },
  // Angular
  { type: "feat", release: ReleaseType.minor },
  { type: "fix", release: ReleaseType.patch },
  { type: "perf", release: ReleaseType.patch },
  // Atom
  { emoji: ":racehorse:", release: ReleaseType.patch },
  { emoji: ":bug:", release: ReleaseType.patch },
  { emoji: ":penguin:", release: ReleaseType.patch },
  { emoji: ":apple:", release: ReleaseType.patch },
  { emoji: ":checkered_flag:", release: ReleaseType.patch },
  // Ember
  { tag: "BUGFIX", release: ReleaseType.patch },
  { tag: "FEATURE", release: ReleaseType.minor },
  { tag: "SECURITY", release: ReleaseType.patch },
  // ESLint
  { tag: "Breaking", release: ReleaseType.major },
  { tag: "Fix", release: ReleaseType.patch },
  { tag: "Update", release: ReleaseType.minor },
  { tag: "New", release: ReleaseType.minor },
  // Express
  { component: "perf", release: ReleaseType.patch },
  { component: "deps", release: ReleaseType.patch },
  // JSHint
  { type: "FEAT", release: ReleaseType.minor },
  { type: "FIX", release: ReleaseType.patch },
];
