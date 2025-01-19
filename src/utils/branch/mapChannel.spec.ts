import { mapChannel } from "src/utils/branch/mapChannel";

describe("mapChannel", () => {
  it("should return the channel with the name template applied", () => {
    expect(mapChannel("name", "release-<%= name %>")).toBe("release-name");
  });

  it("should return the original channel if no template is present", () => {
    expect(mapChannel("name", "release")).toBe("release");
  });

  it("should return null if the channel is null", () => {
    expect(mapChannel("name", null)).toBeNull();
  });
});
