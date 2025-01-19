import { VerifyReleaseContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { verifyRelease } from "src/steps/verifyRelease";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("verifyRelease", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      verifyRelease(
        { cwd, env, stdout, stderr, logger } as unknown as VerifyReleaseContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      verifyRelease(
        { cwd, env, stdout, stderr, logger } as unknown as VerifyReleaseContext,
        {
          verifyReleaseCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });
});
