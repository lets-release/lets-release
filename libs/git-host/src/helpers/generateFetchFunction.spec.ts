import { ProxyAgent, fetch as undiciFetch } from "undici";

import { generateFetchFunction } from "src/helpers/generateFetchFunction";

vi.mock("undici");

describe("generateFetchFunction", () => {
  it("should call undiciFetch with correct URL and options when no proxy is provided", async () => {
    const fetch = generateFetchFunction();
    const url = "https://example.com";
    const options = { method: "GET" };

    await fetch(url, options);

    expect(undiciFetch).toHaveBeenCalledWith(url, {
      ...options,
      dispatcher: undefined,
    });
  });

  it("should call undiciFetch with correct URL and options when proxy is provided as string", async () => {
    const proxy = "http://proxy.com";
    const fetch = generateFetchFunction(proxy);
    const url = "https://example.com";
    const options = { method: "GET" };

    await fetch(url, options);

    expect(ProxyAgent).toHaveBeenCalledWith({ uri: proxy });
    expect(undiciFetch).toHaveBeenCalledWith(url, {
      ...options,
      dispatcher: expect.any(ProxyAgent),
    });
  });

  it("should call undiciFetch with correct URL and options when proxy is provided as object", async () => {
    const proxy = { uri: "http://proxy.com" };
    const fetch = generateFetchFunction(proxy);
    const url = "https://example.com";
    const options = { method: "GET" };

    await fetch(url, options);

    expect(ProxyAgent).toHaveBeenCalledWith(proxy);
    expect(undiciFetch).toHaveBeenCalledWith(url, {
      ...options,
      dispatcher: expect.any(ProxyAgent),
    });
  });

  it('should omit "url" from options when input is an object', async () => {
    const fetch = generateFetchFunction();
    const input = {
      url: "https://example.com",
      method: "POST",
    } as unknown as Request;
    const init = { headers: { "Content-Type": "application/json" } };

    await fetch(input, init);

    expect(undiciFetch).toHaveBeenCalledWith(input.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      dispatcher: undefined,
    });
  });
});
