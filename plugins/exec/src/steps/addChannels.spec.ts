import { AddChannelsContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { addChannels } from "src/steps/addChannels";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;
const pkg = { uniqueName: "npm/pkg" };

describe("addChannels", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      addChannels(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as AddChannelsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is empty", async () => {
    vi.mocked(exec).mockResolvedValue("");

    await expect(
      addChannels(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as AddChannelsContext,
        {
          addChannelsCmd: "echo ''",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is not stringified json", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      addChannels(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as AddChannelsContext,
        {
          addChannelsCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return parsed json of command output", async () => {
    vi.mocked(exec).mockResolvedValue('{"channels": ["stable"]}');

    await expect(
      addChannels(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as AddChannelsContext,
        {
          addChannelsCmd: 'echo \'{"channels": ["stable"]}\'',
        },
      ),
    ).resolves.toEqual({
      channels: ["stable"],
    });
  });
});
