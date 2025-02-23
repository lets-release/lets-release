import { PublishContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { publish } from "src/steps/publish";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;
const pkg = { uniqueName: "npm/pkg" };

describe("publish", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      publish(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as PublishContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is empty", async () => {
    vi.mocked(exec).mockResolvedValue("");

    await expect(
      publish(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as PublishContext,
        {
          publishCmd: "echo ''",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is not stringified json", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      publish(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as PublishContext,
        {
          publishCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return parsed json of command output", async () => {
    vi.mocked(exec).mockResolvedValue('{"channels": ["stable"]}');

    await expect(
      publish(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
          package: pkg,
        } as unknown as PublishContext,
        {
          publishCmd: 'echo \'{"channels": ["stable"]}\'',
        },
      ),
    ).resolves.toEqual({
      channels: ["stable"],
    });
  });
});
