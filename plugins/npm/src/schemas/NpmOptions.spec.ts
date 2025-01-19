import { ZodError } from "zod";

import { NpmOptions } from "src/schemas/NpmOptions";

describe("NpmOptions", () => {
  it("should parse options", () => {
    expect(() =>
      NpmOptions.parse({
        skipPublishing: "xxx",
        tarballDir: "",
        pkgRoot: "",
      } as unknown as NpmOptions),
    ).toThrow(ZodError);
  });
});
