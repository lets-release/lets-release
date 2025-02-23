import { z } from "zod";

import { GlobPattern, NonEmptyString } from "@lets-release/config";

export const AssetObject = z.object({
  /**
   * **Required**. A glob to identify the files to upload.
   */
  path: GlobPattern,

  /**
   * The name of the downloadable file on the release.
   *
   * Default: File name extracted from the `path`.
   */
  name: NonEmptyString.optional(),

  /**
   * Short description of the file displayed on the release.
   */
  label: NonEmptyString.optional(),
});

export type AssetObject = z.input<typeof AssetObject>;
