import { VersioningScheme } from "@lets-release/config";

import { normalizePrereleaseName } from "src/utils/branch/normalizePrereleaseName";

describe("normalizePrereleaseName", () => {
  it("should return the name if it is a valid SemVer prerelease name", () => {
    const name = "alpha.1";
    const result = normalizePrereleaseName(name);
    expect(result).toBe(name);
  });

  it("should return undefined if the name is not a valid SemVer prerelease name", () => {
    const name = "invalid prerelease";
    const result = normalizePrereleaseName(name);
    expect(result).toBeUndefined();
  });

  it("should return the name if it is a valid CalVer prerelease name", () => {
    const name = "2021.01.01-alpha.1";
    const result = normalizePrereleaseName(
      name,
      undefined,
      VersioningScheme.CalVer,
    );
    expect(result).toBe(name);
  });

  it("should return undefined if the name is not a valid CalVer prerelease name", () => {
    const name = "invalid prerelease";
    const result = normalizePrereleaseName(
      name,
      undefined,
      VersioningScheme.CalVer,
    );
    expect(result).toBeUndefined();
  });

  it("should apply the template if spec is provided", () => {
    const name = "alpha";
    const spec = "<%= name %>.1";
    const result = normalizePrereleaseName(name, spec);
    expect(result).toBe("alpha.1");
  });

  it("should return undefined if the templated name is not valid", () => {
    const name = "invalid name";
    const spec = "<%= name %>.1";
    const result = normalizePrereleaseName(name, spec);
    expect(result).toBeUndefined();
  });
});
