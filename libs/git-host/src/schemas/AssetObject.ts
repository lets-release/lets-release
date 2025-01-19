import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const AssetObject = z.object({
  /**
   * **Required**. A glob to identify the files to upload.
   */
  path: z.union([NonEmptyString, z.array(NonEmptyString).min(1)]),

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
