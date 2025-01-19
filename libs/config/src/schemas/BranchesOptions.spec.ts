import { BranchesOptions } from "src/schemas/BranchesOptions";

describe("BranchesOptions", () => {
  it("should validate branches options", () => {
    expect(BranchesOptions.parse({})).toEqual({
      main: "(main|master)",
      next: "next",
      nextMajor: "next-major",
      maintenance: [
        "+([0-9])?(.{+([0-9]),x}).x", // semver: N.x, N.x.x, N.N.x
        "+(+([0-9])[._-])?(x[._-])x", // calver
      ],
      prerelease: ["alpha", "beta", "rc"],
    });
  });
});
