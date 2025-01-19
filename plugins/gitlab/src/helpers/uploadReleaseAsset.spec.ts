import { Stats } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { PublishContext } from "@lets-release/config";
import { ReleaseAsset } from "@lets-release/git-host";

import { AssetTarget } from "src/enums/AssetTarget";
import { AssetType } from "src/enums/AssetType";
import { GenericPackageStatus } from "src/enums/GenericPackageStatus";
import { uploadReleaseAsset } from "src/helpers/uploadReleaseAsset";
import {
  ResolvedGitLabAssetObjectWithPath,
  ResolvedGitLabAssetObjectWithUrl,
} from "src/schemas/GitLabAssetObject";
import { GitLabContext } from "src/types/GitLabContext";

vi.mock("fs/promises");

const log = vi.fn();
const error = vi.fn();
const context = {
  cwd: "/mock/path",
  logger: {
    log,
    error,
  },
  package: {
    name: "pkg",
  },
  nextRelease: {
    version: "1.0.0",
  },
} as unknown as PublishContext;

const publish = vi.fn();
const uploadForReference = vi.fn();
const gitLabContext = {
  gitlab: {
    PackageRegistry: {
      publish,
    },
    Projects: {
      uploadForReference,
    },
  },
  projectId: 123,
  options: {
    url: "https://gitlab.com",
  },
} as unknown as GitLabContext;

describe("uploadReleaseAsset", () => {
  beforeEach(() => {
    vi.mocked(stat)
      .mockReset()
      .mockResolvedValue({ isFile: () => true } as Stats);
    vi.mocked(readFile)
      .mockReset()
      .mockResolvedValue(Buffer.from("file content"));
    publish.mockReset().mockResolvedValue({
      file: {
        url: "https://gitlab.com/api/v4/projects/123/packages/generic/release/1.0.0/test-file.txt",
      },
    });
    uploadForReference.mockReset().mockResolvedValue({
      alt: "test-file.txt",
      full_path: "/uploads/test-file.txt",
    });
    error.mockClear();
  });

  it("should upload a generic package asset", async () => {
    const asset: ReleaseAsset<ResolvedGitLabAssetObjectWithPath> = {
      path: "test-file.txt",
      type: AssetType.Other,
      target: AssetTarget.GenericPackage,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([
      {
        name: "release",
        url: "https://gitlab.com/api/v4/projects/123/packages/generic/release/1.0.0/test-file.txt",
        link_type: AssetType.Package,
        filepath: "test-file.txt",
      },
    ]);
  });

  it("should upload a normal asset", async () => {
    const asset = "test-file.txt";

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([
      {
        name: "test-file.txt",
        url: "https://gitlab.com/uploads/test-file.txt",
        link_type: AssetType.Other,
        filepath: undefined,
      },
    ]);
  });

  it("should upload a normal asset with label", async () => {
    const asset: ReleaseAsset<ResolvedGitLabAssetObjectWithPath> = {
      path: "test-file.txt",
      label: "Test File",
      type: AssetType.Other,
      target: AssetTarget.ProjectUpload,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([
      {
        name: "Test File",
        url: "https://gitlab.com/uploads/test-file.txt",
        link_type: AssetType.Other,
        filepath: "test-file.txt",
      },
    ]);
  });

  it("should handle asset with URL", async () => {
    const asset: ResolvedGitLabAssetObjectWithUrl = {
      url: "https://example.com/test-file.txt",
      type: AssetType.Other,
      target: AssetTarget.ProjectUpload,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([
      {
        name: "https://example.com/test-file.txt",
        url: "https://example.com/test-file.txt",
        link_type: AssetType.Other,
        filepath: "test-file.txt",
      },
    ]);
  });

  it("should handle asset with URL and label", async () => {
    const asset: ResolvedGitLabAssetObjectWithUrl = {
      url: "https://example.com/test-file.txt",
      label: "Test File",
      type: AssetType.Other,
      target: AssetTarget.ProjectUpload,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([
      {
        name: "Test File",
        url: "https://example.com/test-file.txt",
        link_type: AssetType.Other,
        filepath: "test-file.txt",
      },
    ]);
  });

  it("should log an error if the asset is not a file", async () => {
    const asset: ReleaseAsset<ResolvedGitLabAssetObjectWithPath> = {
      path: "test-file.txt",
      type: AssetType.Other,
      target: AssetTarget.ProjectUpload,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    vi.mocked(stat).mockResolvedValue({ isFile: () => false } as Stats);

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([]);
    expect(error).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "The asset test-file.txt is not a file, and will be ignored.",
    });
  });

  it("should log an error if the asset cannot be read", async () => {
    const asset: ReleaseAsset<ResolvedGitLabAssetObjectWithPath> = {
      path: "test-file.txt",
      type: AssetType.Other,
      target: AssetTarget.ProjectUpload,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    vi.mocked(stat).mockRejectedValue(new Error("File not found"));

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([]);
    expect(error).toHaveBeenCalledWith({
      prefix: "[pkg]",
      message: "The asset test-file.txt cannot be read, and will be ignored.",
    });
  });

  it("should throw error if publish failed", async () => {
    const asset: ReleaseAsset<ResolvedGitLabAssetObjectWithPath> = {
      path: "test-file.txt",
      type: AssetType.Other,
      target: AssetTarget.GenericPackage,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    publish.mockRejectedValue(new Error("API error"));

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([]);
    expect(error).toHaveBeenNthCalledWith(1, {
      prefix: "[pkg]",
      message: [
        expect.stringContaining(
          `An error occurred while uploading ${path.resolve("/mock/path/test-file.txt")} to the GitLab generics package API:`,
        ),
        expect.any(Error),
      ],
    });
  });

  it("should throw error if uploadForReference failed", async () => {
    const asset: ReleaseAsset<ResolvedGitLabAssetObjectWithPath> = {
      path: "test-file.txt",
      type: AssetType.Other,
      target: AssetTarget.ProjectUpload,
      status: GenericPackageStatus.Default,
      filepath: "test-file.txt",
    };

    uploadForReference.mockRejectedValue(new Error("API error"));

    const result = await uploadReleaseAsset(context, gitLabContext, asset);

    expect(result).toEqual([]);
    expect(error).toHaveBeenNthCalledWith(1, {
      prefix: "[pkg]",
      message: [
        expect.stringContaining(
          `An error occurred while uploading ${path.resolve("/mock/path/test-file.txt")} to the GitLab project uploads API:`,
        ),
        expect.any(Error),
      ],
    });
  });
});
