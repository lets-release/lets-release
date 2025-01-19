import { channelsToDistTags } from "src/helpers/channelsToDistTags";

describe("channelsToDistTags", () => {
  it("should transform channels to dist tags", () => {
    expect(channelsToDistTags(["latest", "next", "1.0.0", "1.x"])).toEqual([
      "latest",
      "next",
      "release-1.0.0",
      "release-1.x",
    ]);
  });
});
