import { increments } from "src/__fixtures__/increments";
import { increaseSemVer } from "src/helpers/increaseSemVer";

describe("increaseSemVer", () => {
  it("should increase semver", () => {
    for (const [type, values] of Object.entries(increments)) {
      for (const { current, next, options } of values) {
        expect(
          increaseSemVer(
            type as Parameters<typeof increaseSemVer>[0],
            current,
            options,
          ),
          `${current} ${type}`,
        ).toEqual(next);
      }
    }
  });

  it("should throw error if the build metadata is the same", () => {
    expect(() =>
      increaseSemVer("build", "1.0.0+build", {
        build: "build",
      }),
    ).toThrow(TypeError);
  });
});
