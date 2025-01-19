import { ReleaseType } from "@lets-release/config";

import { getCalVerReleaseType } from "src/utils/getCalVerReleaseType";

describe("getCalVerReleaseType", () => {
  it("should get calver release type", () => {
    expect(getCalVerReleaseType("YYYY", ReleaseType.major)).toBe("major");
    expect(getCalVerReleaseType("YYYY", ReleaseType.minor)).toBe("major");
    expect(getCalVerReleaseType("YYYY", ReleaseType.patch)).toBe("major");
    expect(getCalVerReleaseType("YYYY.micro", ReleaseType.major)).toBe("major");
    expect(getCalVerReleaseType("YYYY.micro", ReleaseType.minor)).toBe("micro");
    expect(getCalVerReleaseType("YYYY.micro", ReleaseType.patch)).toBe("micro");
    expect(getCalVerReleaseType("YYYY.minor.micro", ReleaseType.major)).toBe(
      "major",
    );
    expect(getCalVerReleaseType("YYYY.minor.micro", ReleaseType.minor)).toBe(
      "minor",
    );
    expect(getCalVerReleaseType("YYYY.minor.micro", ReleaseType.patch)).toBe(
      "micro",
    );
  });
});
