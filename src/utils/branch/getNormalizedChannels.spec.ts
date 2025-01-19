import {
  BranchType,
  PrereleaseBranch,
  ReleaseBranch,
} from "@lets-release/config";

import { getNormalizedChannels } from "src/utils/branch/getNormalizedChannels";

describe("getNormalizedChannels", () => {
  it("should return normalized channels for prerelease branch", () => {
    expect(
      getNormalizedChannels({
        prerelease: {
          name: "alpha",
          channels: { default: ["alpha", "next-alpha"] },
        },
      } as unknown as PrereleaseBranch),
    ).toEqual({
      default: ["alpha", "next-alpha"],
    });
  });

  it("should return normalized channels of prerelease for release branch", () => {
    const branch = {
      name: "main",
      channels: { default: ["latest"] },
      prereleases: {
        alpha: {
          channels: { default: ["alpha", "next-alpha"] },
        },
      },
    } as unknown as ReleaseBranch;

    expect(getNormalizedChannels(branch, "alpha")).toEqual({
      default: ["alpha", "next-alpha"],
    });
    expect(getNormalizedChannels(branch, "beta")).toEqual({
      default: ["beta"],
    });
  });

  it("should return normalized channels for release branch", () => {
    expect(
      getNormalizedChannels({
        type: BranchType.main,
        name: "main",
        channels: { default: ["latest"] },
      } as unknown as ReleaseBranch),
    ).toEqual({ default: ["latest"] });
  });
});
