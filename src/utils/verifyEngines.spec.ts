import { UnsupportedNodeVersionError } from "src/errors/UnsupportedNodeVersionError";
import * as program from "src/program";
import { verifyEngines } from "src/utils/verifyEngines";

vi.mock("src/program", () => {
  const major = Number(process.version.replace(/^v/, "").split(".", 1)[0]);

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
    const major = Number(process.version.replace(/^v/, "").split(".", 1)[0]);
    vi.mocked(program).engines = { node: `>=${major - 1}` };
    expect(() => verifyEngines()).not.toThrow();
  });

  it("should allow 27.0.0-alpha when it satisfies the engines requirement", () => {
    const nodeVersion = process.version;
    const engines = program.engines;

    try {
      vi.mocked(program).engines = { node: ">=26.0.0" };
      Object.defineProperty(process, "version", { value: "v27.0.0-alpha" });

      expect(() => verifyEngines()).not.toThrow();
    } finally {
      vi.mocked(program).engines = engines;
      Object.defineProperty(process, "version", { value: nodeVersion });
    }
  });
});
