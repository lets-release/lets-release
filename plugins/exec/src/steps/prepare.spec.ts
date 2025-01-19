import { PrepareContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { prepare } from "src/steps/prepare";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("prepare", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      prepare(
        { cwd, env, stdout, stderr, logger } as unknown as PrepareContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      prepare(
        { cwd, env, stdout, stderr, logger } as unknown as PrepareContext,
        {
          prepareCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });
});
