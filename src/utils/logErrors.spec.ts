import { FailContext, LetsReleaseError, Step } from "@lets-release/config";

import { NoGitRepoError } from "src/errors/NoGitRepoError";
import { NoPluginStepSpecsError } from "src/errors/NoPluginStepSpecsError";
import { logErrors } from "src/utils/logErrors";
import { parseMarkdown } from "src/utils/parseMarkdown";

vi.mock("src/utils/parseMarkdown");

const stderr = {
  write: vi.fn(),
};
const logger = {
  error: vi.fn(),
};
const markdown = "markdown";

vi.mocked(parseMarkdown).mockResolvedValue(markdown);

const normalError1 = new Error("normal error 1");
const normalError2 = new Error("normal error 2");
const pluginError = new NoPluginStepSpecsError(Step.analyzeCommits);
const gitError = new NoGitRepoError("cwd");

class TestError extends Error {
  pkg = { uniqueName: "npm/pkg" };
}

describe("logErrors", () => {
  beforeEach(() => {
    logger.error.mockReset();
    stderr.write.mockReset();
  });

  it("should log errors", async () => {
    await logErrors(
      { stderr, logger } as unknown as FailContext,
      new AggregateError(
        [normalError1, normalError2, pluginError, gitError],
        "test",
      ),
    );
    await logErrors(
      { stderr, logger } as unknown as FailContext,
      new AggregateError([pluginError, normalError1], "test"),
    );

    expect(logger.error).toHaveBeenCalledTimes(6);
    expect(logger.error).toHaveBeenNthCalledWith(1, {
      prefix: undefined,
      message: `${pluginError.name}: ${pluginError.message}`,
    });
    expect(logger.error).toHaveBeenNthCalledWith(2, {
      prefix: undefined,
      message: `${gitError.name}: ${gitError.message}`,
    });
    expect(logger.error).toHaveBeenNthCalledWith(3, {
      prefix: undefined,
      message: [
        expect.stringContaining("An error occurred while running"),
        normalError1,
      ],
    });
    expect(logger.error).toHaveBeenNthCalledWith(4, {
      prefix: undefined,
      message: [
        expect.stringContaining("An error occurred while running"),
        normalError2,
      ],
    });
    expect(logger.error).toHaveBeenNthCalledWith(5, {
      prefix: undefined,
      message: `${pluginError.name}: ${pluginError.message}`,
    });
    expect(logger.error).toHaveBeenNthCalledWith(6, {
      prefix: undefined,
      message: [
        expect.stringContaining("An error occurred while running"),
        normalError1,
      ],
    });

    expect(stderr.write).toHaveBeenCalledTimes(3);
    expect(stderr.write).toHaveBeenNthCalledWith(1, markdown);
    expect(stderr.write).toHaveBeenNthCalledWith(2, markdown);
    expect(stderr.write).toHaveBeenNthCalledWith(3, markdown);
  });

  it("should log errors with package", async () => {
    const error = new TestError();
    await logErrors(
      { stderr, logger } as unknown as FailContext,
      new AggregateError([error], "test"),
    );

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenNthCalledWith(1, {
      prefix: "[npm/pkg]",
      message: [
        expect.stringContaining("An error occurred while running"),
        error,
      ],
    });
  });

  it("should log LetsReleaseError without details", async () => {
    class TestLetsReleaseErrorWithoutDetails extends LetsReleaseError {
      get message() {
        return "Test error without details";
      }
      get details() {
        return undefined;
      }
    }

    const error = new TestLetsReleaseErrorWithoutDetails();
    await logErrors(
      { stderr, logger } as unknown as FailContext,
      new AggregateError([error], "test"),
    );

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenNthCalledWith(1, {
      prefix: undefined,
      message: `${error.name}: ${error.message}`,
    });
    expect(stderr.write).not.toHaveBeenCalled();
  });
});
