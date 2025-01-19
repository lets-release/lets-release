import { z } from "zod";

import { ArtifactInfo } from "src/schemas/ArtifactInfo";

/**
 * Result of addChannels step or publish step.
 */
export const ReleaseResult = ArtifactInfo.optional();

export type ReleaseResult = z.infer<typeof ReleaseResult>;
