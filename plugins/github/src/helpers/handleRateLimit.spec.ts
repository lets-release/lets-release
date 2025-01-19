import { Octokit } from "@octokit/core";
import { EndpointDefaults } from "@octokit/types";

import { OCTOKIT_MAX_RETRIES } from "src/constants/OCTOKIT_MAX_RETRIES";
import { handleRateLimit } from "src/helpers/handleRateLimit";

const warn = vi.fn();
const debug = vi.fn();
const mockOctokit = {
  log: {
    warn,
    debug,
  },
} as unknown as Octokit;

const options: Required<EndpointDefaults> = {
  method: "GET",
  url: "https://api.github.com",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent":
      "octokit.js/0.0.0-development octokit-plugin-rest-endpoint-methods.js/0.0.0-development",
  },
  request: {},
  mediaType: {
    format: "",
    previews: [],
  },
};

describe("handleRateLimit", () => {
  beforeEach(() => {
    warn.mockClear();
    debug.mockClear();
  });

  it("should log a warning message when rate limit is hit", () => {
    handleRateLimit(60, options, mockOctokit, 1);

    expect(warn).toHaveBeenCalledWith(
      "Request quota exhausted for request GET https://api.github.com",
    );
  });

  it("should log a debug message and return true if retryCount is less than or equal to OCTOKIT_MAX_RETRIES", () => {
    const result = handleRateLimit(60, options, mockOctokit, 1);

    expect(debug).toHaveBeenCalledWith("Retrying after 60 seconds!");
    expect(result).toBe(true);
  });

  it("should not log a debug message and return undefined if retryCount is greater than OCTOKIT_MAX_RETRIES", () => {
    const result = handleRateLimit(
      60,
      options,
      mockOctokit,
      OCTOKIT_MAX_RETRIES + 1,
    );

    expect(debug).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
