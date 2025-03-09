import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getPoetryConfig } from "src/helpers/getPoetryConfig";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("getPoetryConfig", () => {
  beforeEach(() => {
    exec.mockReset();
  });

  it("should return the config value when the command succeeds", async () => {
    const mockStdout = "mocked stdout";
    exec.mockResolvedValue({ stdout: mockStdout });
    vi.mocked(stripAnsi).mockReturnValue(mockStdout);

    const result = await getPoetryConfig("some-key");

    expect(result).toBe(mockStdout.trim());
  });

  it("should return undefined when the command fails", async () => {
    exec.mockRejectedValue(new Error("command failed"));

    const result = await getPoetryConfig("some-key");

    expect(result).toBeUndefined();
  });
});
