import { increments } from "src/__fixtures__/increments";
import { increaseCalVer } from "src/helpers/increaseCalVer";

describe("increaseCalVer", () => {
  describe.each(Object.entries(increments))("format: %s", (format, types) => {
    describe.each(Object.entries(types))("type: %s", (type, values) => {
      const valid = values?.filter((v) => v.next) ?? [];
      const invalid = values?.filter((v) => !v.next) ?? [];

      it.each(valid)(
        "should increase from $current to $next",
        ({ current, next, options }) => {
          expect(
            increaseCalVer(
              type as Parameters<typeof increaseCalVer>[0],
              format,
              current,
              options,
            ),
            `${format} ${type} ${current}`,
          ).toBe(next);
        },
      );

      it.each(invalid)(
        "should throw error when increasing from $current",
        ({ current, options }) => {
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
        },
      );
    });
  });

  it("should throw error if the build metadata is the same", () => {
    expect(() =>
      increaseCalVer("build", "YY", "1+build", {
        build: "build",
      }),
    ).toThrow(TypeError);
  });
});
