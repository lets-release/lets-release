import { PackageDependency } from "src/schemas/PackageDependency";

describe("PackageDependency", () => {
  it("should validate package dependency", () => {
    const dependency = {
      type: "npm",
      name: "test",
    };

    expect(PackageDependency.parse(dependency)).toEqual(dependency);
  });
});
