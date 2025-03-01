import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { AddChannelsContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";

vi.mock("execa");
vi.mock("strip-ansi");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;
const addChannelsCmd = "echo 'Hello World'";

const fn = vi.fn();

vi.mocked($).mockReturnValue(fn as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

class ExtendedPromise extends Promise<unknown> {
  stdout = {
    pipe: vi.fn(),
  };
  stderr = {
    pipe: vi.fn(),
  };
}

const promise = new ExtendedPromise((resolve) => {
  resolve({ stdout: "Hello World" });
});

describe("exec", () => {
  beforeEach(() => {
    fn.mockReset().mockReturnValue(promise);
  });

  it("should execute command", async () => {
    await expect(
      exec(
        "addChannelsCmd",
        { cwd, env, stdout, stderr, logger } as unknown as AddChannelsContext,
        {
          addChannelsCmd,
        },
      ),
    ).resolves.toBe("Hello World");
  });

  it("should execute command with extra options", async () => {
    await expect(
      exec(
        "addChannelsCmd",
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: {
            uniqueName: "npm/pkg",
          },
        } as unknown as AddChannelsContext,
        {
          cwd: "src",
          shell: "bash",
          addChannelsCmd,
        },
      ),
    ).resolves.toBe("Hello World");
  });
});
