import { calvers } from "src/__fixtures__/calvers";
import { formatCalVer } from "src/helpers/formatCalVer";

describe("formatCalVer", () => {
  it("should format regular calver", () => {
    for (const [format, { tokenValues, values }] of Object.entries(calvers)) {
      for (const { value, formatted, options, parsed } of values) {
        if (parsed) {
          expect(
            formatCalVer(
              format,
              {
                ...parsed,
                tokenValues,
              },
              options,
            ),
            `${format} ${value}`,
          ).toBe(formatted ?? value);
        }
      }
    }
  });

  it("should format calver with number as prerelease name", () => {
    for (const [format, { tokenValues, values }] of Object.entries(calvers)) {
      for (const { value, formatted, options, parsed } of values) {
        if (parsed?.prereleaseName && /^\d+$/.test(parsed.prereleaseName)) {
          expect(
            formatCalVer(
              format,
              {
                ...parsed,
                tokenValues,
              },
              { ...options, prefix: "" },
            ),
            `${format} ${value}`,
          ).toBe(formatted ?? value);
        }
      }
    }
  });

  it("should throw error if token value is missing", () => {
    for (const [format, { tokens, tokenValues, values }] of Object.entries(
      calvers,
    )) {
      for (const { value, options, parsed } of values) {
        if (parsed && tokens.week) {
          // Missing token value
          expect(
            () =>
              formatCalVer(
                format,
                {
                  ...parsed,
                  tokenValues: {
                    ...tokenValues,
                    week: undefined,
                  },
                },
                options,
              ),
            `${format} ${value}`,
          ).toThrow(TypeError);
        }
      }
    }
  });
});
