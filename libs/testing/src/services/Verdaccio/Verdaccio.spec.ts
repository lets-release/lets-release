import { setTimeout } from "node:timers/promises";

import pRetry from "p-retry";
import { fetch } from "undici";

import { Service } from "src/services/Service";
import { Verdaccio } from "src/services/Verdaccio/Verdaccio";

vi.mock("timers/promises");
vi.mock("p-retry");
vi.mock("undici");

const verdaccio = new Verdaccio("verdaccio");
const superStart = vi
  .spyOn(Service.prototype, "start")
  .mockResolvedValue(undefined);

const token = "fake-token";
const res = {
  json: vi.fn().mockResolvedValue({ token }),
};

describe("verdaccio", () => {
  beforeEach(() => {
    vi.mocked(setTimeout).mockClear();
    vi.mocked(pRetry)
      .mockReset()
      .mockImplementation(async (fn) => await fn(1));
    vi.mocked(fetch)
      .mockReset()
      .mockResolvedValue(res as unknown as Response);
    superStart.mockClear();
    res.json.mockClear();
  });

  it("should start container", async () => {
    await expect(verdaccio.start()).resolves.toBeUndefined();
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(superStart).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledOnce();
    expect(verdaccio.npmToken).toBe(token);
  });

  it("should throw error if mock server not ready", async () => {
    vi.mocked(pRetry).mockReset().mockRejectedValue(new Error("timeout"));

    await expect(verdaccio.start()).rejects.toThrowError(
      "Couldn't start verdaccio after 2 min",
    );
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(superStart).toHaveBeenCalledOnce();
  });
});
