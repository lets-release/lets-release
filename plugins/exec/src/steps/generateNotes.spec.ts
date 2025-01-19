import { GenerateNotesContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { generateNotes } from "src/steps/generateNotes";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("generateNotes", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      generateNotes(
        { cwd, env, stdout, stderr, logger } as unknown as GenerateNotesContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return command output", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      generateNotes(
        { cwd, env, stdout, stderr, logger } as unknown as GenerateNotesContext,
        {
          generateNotesCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBe("Hello World");
  });
});
