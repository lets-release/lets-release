import { Channel } from "src/schemas/Channel";

describe("Channel", () => {
  it("should return valid channel", () => {
    expect(Channel.parse(null)).toEqual(null);

    expect(Channel.parse("test-${name}")).toEqual("test-${name}");
  });
});
