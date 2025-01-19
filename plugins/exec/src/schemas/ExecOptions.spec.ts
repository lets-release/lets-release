import { ExecOptions } from "src/schemas/ExecOptions";

describe("ExecOptions", () => {
  it("should validate exec options", () => {
    expect(
      ExecOptions.parse({
        shell: true,
      }),
    ).toEqual({ shell: true });
  });
});
