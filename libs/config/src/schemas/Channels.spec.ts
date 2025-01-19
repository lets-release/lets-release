import { Channels } from "src/schemas/Channels";

describe("Channels", () => {
  it("should return valid channels", () => {
    expect(Channels.parse(["alpha"])).toEqual(["alpha"]);

    expect(Channels.parse({ alpha: ["alpha"] })).toEqual({ alpha: ["alpha"] });
  });
});
