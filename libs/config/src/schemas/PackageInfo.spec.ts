import { ZodError } from "zod";

import { PackageInfo } from "src/schemas/PackageInfo";

describe("PackageInfo", () => {
  it("should validate package info", async () => {
    const pkg = {
      path: "/path/package",
      type: "npm",
      name: "test",
      dependencies: [
        {
          type: "npm",
          name: "test",
        },
      ],
    };

    await expect(PackageInfo.parseAsync(pkg)).resolves.toEqual(pkg);
    await expect(
      PackageInfo.parseAsync({
        path: "/path/package",
        type: "npm:",
        name: "test",
      }),
    ).rejects.toThrow(ZodError);
  });
});
