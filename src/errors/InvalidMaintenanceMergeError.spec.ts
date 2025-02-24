import {
  MaintenanceVersionRange,
  NormalizedNextRelease,
  Package,
} from "@lets-release/config";

import { InvalidMaintenanceMergeError } from "src/errors/InvalidMaintenanceMergeError";

describe("InvalidMaintenanceMergeError", () => {
  it("should be defined", () => {
    const error = new InvalidMaintenanceMergeError(
      {
        uniqueName: "npm/pkg",
      } as Package,
      {
        mergeMin: "1.0.0",
        mergeMax: "2.0.0",
      } as MaintenanceVersionRange,
      "branch",
      {
        version: "3.0.0",
        channels: ["channel"],
        tag: "v3.0.0",
      } as unknown as NormalizedNextRelease,
    );

    expect(error.message).toEqual(
      expect.stringContaining("The release `3.0.0` of package `npm/pkg`"),
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "Only releases within the range `>=1.0.0 <2.0.0`",
      ),
    );
  });
});
