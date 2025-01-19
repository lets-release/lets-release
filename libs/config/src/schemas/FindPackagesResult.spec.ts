import { FindPackagesResult } from "src/schemas/FindPackagesResult";

describe("FindPackagesResult", () => {
  it("should validate find packages result", () => {
    const pkgs = [
      {
        path: "/path/package",
        name: "test",
      },
    ];

    expect(FindPackagesResult.parse(pkgs)).toEqual(pkgs);
  });
});
