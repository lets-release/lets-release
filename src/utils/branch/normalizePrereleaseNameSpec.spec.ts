import { VersioningScheme } from "@lets-release/config";

import { normalizePrereleaseNameSpec } from "src/utils/branch/normalizePrereleaseNameSpec";

describe("normalizePrereleaseNameSpec", () => {
  it("should normalize when spec is a string", () => {
    const result = normalizePrereleaseNameSpec(
      "alpha",
      VersioningScheme.SemVer,
      "beta",
    );
    expect(result).toEqual({ default: "beta" });
  });

  it("should normalize when spec is an object with string values", () => {
    const spec = { foo: "bar", baz: "qux" };
    const result = normalizePrereleaseNameSpec(
      "alpha",
      VersioningScheme.SemVer,
      spec,
    );
    expect(result).toEqual({ foo: "bar", baz: "qux", default: "alpha" });
  });

  it("should normalize when spec is an object with boolean values", () => {
    const spec = { foo: true as const, baz: true as const };
    const result = normalizePrereleaseNameSpec(
      "alpha",
      VersioningScheme.SemVer,
      spec,
    );
    expect(result).toEqual({ foo: "alpha", baz: "alpha", default: "alpha" });
  });

  it("should normalize when spec is an object with mixed values", () => {
    const spec = { foo: "bar", baz: true as const };
    const result = normalizePrereleaseNameSpec(
      "alpha",
      VersioningScheme.SemVer,
      spec,
    );
    expect(result).toEqual({ foo: "bar", baz: "alpha", default: "alpha" });
  });

  it("should normalize when spec is an object with non-string and non-boolean values", () => {
    const spec = { foo: "bar", invalid: 123, baz: true as const };
    const result = normalizePrereleaseNameSpec(
      "alpha",
      VersioningScheme.SemVer,
      spec as unknown as string,
    );
    expect(result).toEqual({ foo: "bar", baz: "alpha", default: "alpha" });
  });
});
