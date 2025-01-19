import { FailContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { fail } from "src/steps/fail";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("fail", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      fail({ cwd, env, stdout, stderr, logger } as unknown as FailContext, {}),
    ).resolves.toBeUndefined();
  });

  it("should return undefined", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      fail({ cwd, env, stdout, stderr, logger } as unknown as FailContext, {
        failCmd: "echo 'Hello World'",
      }),
    ).resolves.toBeUndefined();
  });
});
