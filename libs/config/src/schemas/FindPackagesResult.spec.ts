import { FindPackagesResult } from "src/schemas/FindPackagesResult";

describe("FindPackagesResult", () => {
  it("should validate find packages result", async () => {
    const pkgs = [
      {
        path: "/path/package",
        type: "npm",
        name: "test",
      },
    ];

    await expect(FindPackagesResult.parseAsync(pkgs)).resolves.toEqual(pkgs);
  });
});
