import { UnsupportedNodeVersionError } from "src/errors/UnsupportedNodeVersionError";
import * as program from "src/program";
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

  it("should not throw when engines is undefined", () => {
    vi.mocked(program).engines = undefined;
    expect(() => verifyEngines()).not.toThrow();
  });

  it("should not throw when node version satisfies engines requirement", () => {
    const major = Number(process.version.replace(/^v/, "").split(".")[0]);
    vi.mocked(program).engines = { node: `>=${major}` };
    expect(() => verifyEngines()).not.toThrow();
  });
});
