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
      key: undefined,
    };

    await expect(Prereleases.parseAsync(obj)).resolves.toEqual(obj);
  });

  it("should throw for invalid prereleases", async () => {
    await expect(
      Prereleases.parseAsync({
        test: {
          name: "feat test",
        },
      }),
    ).rejects.toThrow(ZodError);
  });
});
