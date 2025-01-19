import { PrereleaseBranch, ReleaseBranch } from "@lets-release/config";

import { getNormalizedChannels } from "src/utils/branch/getNormalizedChannels";
import { getPluginChannels } from "src/utils/branch/getPluginChannels";

vi.mock("src/utils/branch/getNormalizedChannels");

const branch = {} as PrereleaseBranch & ReleaseBranch;
const channels = {
  default: ["default-channel"],
  pluginA: ["pluginA-channel"],
};

describe("getPluginChannels", () => {
  beforeEach(() => {
    vi.mocked(getNormalizedChannels).mockReturnValue(channels);
  });

  it("should return default channels when no pluginName is provided", () => {
    expect(getPluginChannels(branch)).toEqual(channels.default);
  });

  it("should return specific plugin channels when pluginName is provided and exists", () => {
    expect(getPluginChannels(branch, "pluginA")).toEqual(channels.pluginA);
  });

  it("should return default channels when pluginName is provided but does not exist", () => {
    expect(getPluginChannels(branch, "nonExistentPlugin", "alpha")).toEqual(
      channels.default,
    );
  });
});
