import { ReleaseType } from "@lets-release/config";

import { compareReleaseTypes } from "src/helpers/compareReleaseTypes";

describe("compareReleaseTypes", () => {
  it("should return true if release type is of higher level than the current one", () => {
    expect(compareReleaseTypes(ReleaseType.major)).toBe(true);
    expect(compareReleaseTypes(ReleaseType.major, null)).toBe(true);
    expect(compareReleaseTypes(ReleaseType.major, ReleaseType.minor)).toBe(
      true,
    );
    expect(compareReleaseTypes(ReleaseType.major, ReleaseType.patch)).toBe(
      true,
    );

    expect(compareReleaseTypes(ReleaseType.minor)).toBe(true);
    expect(compareReleaseTypes(ReleaseType.minor, null)).toBe(true);
    expect(compareReleaseTypes(ReleaseType.minor, ReleaseType.patch)).toBe(
      true,
    );

    expect(compareReleaseTypes(ReleaseType.patch)).toBe(true);
    expect(compareReleaseTypes(ReleaseType.patch, null)).toBe(true);

    expect(compareReleaseTypes(null)).toBe(true);
    expect(compareReleaseTypes(null, null)).toBe(true);
  });

  it("should compare release types", () => {
    expect(compareReleaseTypes(ReleaseType.major, ReleaseType.major)).toBe(
      false,
    );

    expect(compareReleaseTypes(ReleaseType.minor, ReleaseType.major)).toBe(
      false,
    );
    expect(compareReleaseTypes(ReleaseType.minor, ReleaseType.minor)).toBe(
      false,
    );

    expect(compareReleaseTypes(ReleaseType.patch, ReleaseType.major)).toBe(
      false,
    );
    expect(compareReleaseTypes(ReleaseType.patch, ReleaseType.minor)).toBe(
      false,
    );
    expect(compareReleaseTypes(ReleaseType.patch, ReleaseType.patch)).toBe(
      false,
    );

    expect(compareReleaseTypes(null, ReleaseType.major)).toBe(false);
    expect(compareReleaseTypes(null, ReleaseType.minor)).toBe(false);
    expect(compareReleaseTypes(null, ReleaseType.patch)).toBe(false);
  });
});
