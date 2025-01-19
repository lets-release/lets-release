import { FindPackagesContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { findPackages } from "src/steps/findPackages";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("findPackages", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      findPackages(
        { cwd, env, stdout, stderr, logger } as unknown as FindPackagesContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is empty", async () => {
    vi.mocked(exec).mockResolvedValue("");

    await expect(
      findPackages(
        { cwd, env, stdout, stderr, logger } as unknown as FindPackagesContext,
        {
          findPackagesCmd: "echo ''",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is not stringified json", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      findPackages(
        { cwd, env, stdout, stderr, logger } as unknown as FindPackagesContext,
        {
          findPackagesCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return parsed json of command output", async () => {
    vi.mocked(exec).mockResolvedValue('[{"name": "pkg", "path": "/path"}]');

    await expect(
      findPackages(
        { cwd, env, stdout, stderr, logger } as unknown as FindPackagesContext,
        {
          findPackagesCmd: 'echo \'[{"name": "pkg", "path": "/path"}]\'',
        },
      ),
    ).resolves.toEqual([
      {
        name: "pkg",
        path: "/path",
      },
    ]);
  });
});
