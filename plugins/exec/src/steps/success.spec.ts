import { SuccessContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { success } from "src/steps/success";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("success", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      success(
        { cwd, env, stdout, stderr, logger } as unknown as SuccessContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      success(
        { cwd, env, stdout, stderr, logger } as unknown as SuccessContext,
        {
          successCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });
});
