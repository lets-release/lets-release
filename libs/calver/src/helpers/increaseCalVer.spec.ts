import { increments } from "src/__fixtures__/increments";
import { increaseCalVer } from "src/helpers/increaseCalVer";

describe("increaseCalVer", () => {
  it("should increase calver", () => {
    for (const [format, types] of Object.entries(increments)) {
      for (const [type, values] of Object.entries(types)) {
        for (const { current, next, options } of values ?? []) {
          if (next) {
            expect(
              increaseCalVer(
                type as Parameters<typeof increaseCalVer>[0],
                format,
                current,
                options,
              ),
              `${format} ${type} ${current}`,
            ).toBe(next);
          }
        }
      }
    }
  });

  it("should throw error if format not match or increased major version is the same", () => {
    for (const [format, types] of Object.entries(increments)) {
      for (const [type, values] of Object.entries(types)) {
        for (const { current, next, options } of values ?? []) {
          if (!next) {
            expect(
              () =>
                increaseCalVer(
                  type as Parameters<typeof increaseCalVer>[0],
                  format,
                  current,
                  options,
                ),
              `${format} ${type} ${current}`,
            ).toThrow(TypeError);
          }
        }
      }
    }
  });

  it("should throw error if the build metadata is the same", () => {
    expect(() =>
      increaseCalVer("build", "YY", "1+build", {
        build: "build",
      }),
    ).toThrow(TypeError);
  });
});
