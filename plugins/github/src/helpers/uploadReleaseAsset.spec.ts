import { Stats } from "node:fs";
import { readFile, stat } from "node:fs/promises";

import { PublishContext } from "@lets-release/config";

import { uploadReleaseAsset } from "src/helpers/uploadReleaseAsset";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";

vi.mock("node:fs/promises");

const request = vi.fn();
const octokit = { request } as unknown as LetsReleaseOctokit;
const log = vi.fn();
const error = vi.fn();
const context = {
  cwd: "/test",
  logger: { log, error },
  package: { name: "pkg" },
} as unknown as PublishContext;
const url = "https://api.github.com/repos/owner/repo/releases/assets";
const data = Buffer.from("file content");
const downloadUrl = "https://download.url/file.txt";

describe("uploadReleaseAsset", () => {
  beforeEach(() => {
    vi.mocked(stat)
      .mockReset()
      .mockResolvedValue({ isFile: () => true, size: 1000 } as Stats);
    vi.mocked(readFile).mockReset().mockResolvedValue(data);
    request.mockReset().mockResolvedValue({
      data: { browser_download_url: downloadUrl },
    });
    log.mockReset();
    error.mockReset();
  });

  it("should upload a file successfully for string asset", async () => {
    await uploadReleaseAsset(context, octokit, url, "file");

    expect(octokit.request).toHaveBeenCalledWith({
      method: "POST",
      url,
      data,
      name: "file",
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": 1000,
      },
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: `Published file ${downloadUrl}`,
    });
  });

  it("should upload a file successfully for object asset", async () => {
    await uploadReleaseAsset(context, octokit, url, {
      path: "file.txt",
      name: "file.txt",
    });

    expect(octokit.request).toHaveBeenCalledWith({
      method: "POST",
      url,
      data,
      name: "file.txt",
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": 1000,
      },
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: `Published file ${downloadUrl}`,
    });
  });

  it("should upload a file successfully for object asset with label", async () => {
    await uploadReleaseAsset(context, octokit, url, {
      path: "file.txt",
      name: "file.txt",
      label: "File",
    });

    expect(octokit.request).toHaveBeenCalledWith({
      method: "POST",
      url,
      data,
      name: "file.txt",
      label: "File",
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": 1000,
      },
    });
    expect(log).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: `Published file ${downloadUrl}`,
    });
  });

  it("should log an error if the file is not a file", async () => {
    vi.mocked(stat).mockResolvedValue({ isFile: () => false } as Stats);

    await uploadReleaseAsset(context, octokit, url, {
      path: "file.txt",
      name: "file.txt",
    });

    expect(error).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "The asset file.txt is not a file, and will be ignored.",
    });
  });

  it("should log an error if the file cannot be read", async () => {
    vi.mocked(stat).mockRejectedValue(new Error("File not found"));

    await uploadReleaseAsset(context, octokit, url, {
      path: "file.txt",
      name: "file.txt",
    });

    expect(error).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "The asset file.txt cannot be read, and will be ignored.",
    });
  });
});
