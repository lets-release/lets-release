import { PackageInfo } from "src/schemas/PackageInfo";

describe("PackageInfo", () => {
  it("should validate package info", () => {
    const pkg = {
      name: "test",
      path: "/path/package",
    };

    expect(PackageInfo.parse(pkg)).toEqual(pkg);
  });
});
