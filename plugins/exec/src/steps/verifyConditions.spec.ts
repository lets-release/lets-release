import { VerifyConditionsContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { verifyConditions } from "src/steps/verifyConditions";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("verifyConditions", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      verifyConditions(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
        } as unknown as VerifyConditionsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      verifyConditions(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
        } as unknown as VerifyConditionsContext,
        {
          verifyConditionsCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });
});
