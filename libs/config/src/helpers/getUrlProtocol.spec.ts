import { getUrlProtocol } from "src/helpers/getUrlProtocol";

describe("getUrlProtocol", () => {
  it("should return the protocol of the URL", () => {
    expect(getUrlProtocol("https://example.com")).toBe("https:");
    expect(getUrlProtocol("http://example.com")).toBe("http:");
    expect(getUrlProtocol("ftp://example.com")).toBe("ftp:");
  });

  it("should return undefined if the URL has no protocol", () => {
    expect(getUrlProtocol("example.com")).toBeUndefined();
  });
});
