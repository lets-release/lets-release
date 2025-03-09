import { ZodError } from "zod";

import { PyPIOptions } from "src/schemas/PyPIOptions";

describe("PyPIOptions", () => {
  it("should parse options", () => {
    expect(() =>
      PyPIOptions.parse({
        skipPublishing: "xxx",
        distDir: "",
        pkgRoot: "",
      } as unknown as PyPIOptions),
    ).toThrow(ZodError);
  });
});
