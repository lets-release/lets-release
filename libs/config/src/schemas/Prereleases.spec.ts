import { ZodError } from "zod";

import { Prereleases } from "src/schemas/Prereleases";

describe("Prereleases", () => {
  it("should return prereleases", async () => {
    const obj = {
      alpha: {
        name: true,
      },
      beta: {
        name: "test-${name}",
      },
      rc: {
        name: {
          a: true,
          b: "test-${name}",
        },
      },
      pre: {
        names: {
          SemVer: true,
          CalVer: "test-${name}",
        },
      },
      test: {
        names: {
          SemVer: true,
          CalVer: {
            a: true,
            b: "test-${name}",
          },
        },
      },
      key: undefined,
    };

    await expect(Prereleases.parseAsync(obj)).resolves.toEqual(obj);
  });

  it("should throw for invalid prereleases", async () => {
    await expect(
      Prereleases.parseAsync({
        test: {
          names: {
            SemVer: "feat test",
            CalVer: "feat test",
          },
        },
      }),
    ).rejects.toThrow(ZodError);
  });
});
