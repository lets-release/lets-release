import { AnalyzeCommitsContext } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { analyzeCommits } from "src/steps/analyzeCommits";

vi.mock("src/helpers/exec");

const log = vi.fn();
const logger = { log };
const cwd = process.cwd();
const env = process.env;
const stdout = process.stdout;
const stderr = process.stderr;

describe("analyzeCommits", () => {
  beforeEach(() => {
    vi.mocked(exec).mockReset();
  });

  it("should return undefined if command is not set", async () => {
    await expect(
      analyzeCommits(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
        } as unknown as AnalyzeCommitsContext,
        {},
      ),
    ).resolves.toBeUndefined();
  });

  it("should return undefined if command output is empty", async () => {
    vi.mocked(exec).mockResolvedValue("");

    await expect(
      analyzeCommits(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
        } as unknown as AnalyzeCommitsContext,
        {
          analyzeCommitsCmd: "echo ''",
        },
      ),
    ).resolves.toBeUndefined();
  });

  it("should return command output", async () => {
    vi.mocked(exec).mockResolvedValue("Hello World");

    await expect(
      analyzeCommits(
        {
          cwd,
          env,
          stdout,
          stderr,
          logger,
        } as unknown as AnalyzeCommitsContext,
        {
          analyzeCommitsCmd: "echo 'Hello World'",
        },
      ),
    ).resolves.toBe("Hello World");
  });
});
