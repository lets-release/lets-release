import { UnsupportedNodeVersionError } from "src/errors/UnsupportedNodeVersionError";
import { verifyEngines } from "src/utils/verifyEngines";

vi.mock("src/program", () => {
  const major = Number(process.version.replace(/^v/, "").split(".")[0]);

  return {
    engines: { node: `>=${major + 1}` },
  };
});

describe("verifyEngines", () => {
  it("should verify engines", () => {
    expect(() => verifyEngines()).toThrow(UnsupportedNodeVersionError);
  });
});
