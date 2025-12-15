import { VersioningPrereleaseOptions } from "@lets-release/versioning";

import { calvers } from "src/__fixtures__/calvers";
import { formatCalVer } from "src/helpers/formatCalVer";
import { ParsedCalVer } from "src/types/ParsedCalVer";

describe("formatCalVer", () => {
  describe.each(Object.entries(calvers))(
    "format: $0",
    (format, { tokenValues, values }) => {
      const regular = values.filter(
        (
          x,
        ): x is {
          value: string;
          formatted?: string;
          options?: VersioningPrereleaseOptions;
          parsed: Omit<ParsedCalVer, "tokens" | "tokenValues">;
        } => !!x.parsed,
      );
      const numeric = regular.filter(
        ({ parsed }) =>
          parsed?.prereleaseName && /^\d+$/.test(parsed.prereleaseName),
      );

      it.each(regular)(
        "should format regular calver: $value",
        ({ value, formatted, options, parsed }) => {
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
        },
      );

      it.each(numeric)(
        "should format calver with number as prerelease name: $value",
        ({ value, formatted, options, parsed }) => {
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
        },
      );
    },
  );

  describe.each(
    Object.entries(calvers).filter(([, { tokens }]) => tokens.week),
  )("format: %s with week token", (format, { tokenValues, values }) => {
    it.each(
      values.filter(
        (
          x,
        ): x is {
          value: string;
          formatted?: string;
          options?: VersioningPrereleaseOptions;
          parsed: Omit<ParsedCalVer, "tokens" | "tokenValues">;
        } => !!x.parsed,
      ),
    )(
      "should throw error if token value is missing: $value",
      ({ value, options, parsed }) => {
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
      },
    );
  });
});
