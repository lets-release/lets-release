import { setTimeout } from "node:timers/promises";

import { CancelableRequest, got } from "got";
import pRetry from "p-retry";

import { Service } from "src/services/Service";
import { Verdaccio } from "src/services/Verdaccio/Verdaccio";

vi.mock("timers/promises");
vi.mock("p-retry");
vi.mock("got");

const verdaccio = new Verdaccio("verdaccio");
const superStart = vi
  .spyOn(Service.prototype, "start")
  .mockResolvedValue(undefined);

const token = "fake-token";
const req = {
  json: vi.fn().mockResolvedValue({ token }),
};

describe("verdaccio", () => {
  beforeEach(() => {
    vi.mocked(setTimeout).mockClear();
    vi.mocked(pRetry)
      .mockReset()
      .mockImplementation(async (fn) => await fn(1));
    vi.mocked(got)
      .mockReset()
      .mockReturnValue(req as unknown as CancelableRequest);
    superStart.mockClear();
    req.json.mockClear();
  });

  it("should start container", async () => {
    await expect(verdaccio.start()).resolves.toBeUndefined();
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(got).toHaveBeenCalledTimes(3);
    expect(superStart).toHaveBeenCalledOnce();
    expect(req.json).toHaveBeenCalledOnce();
    expect(verdaccio.npmToken).toBe(token);
  });

  it("should throw error if mock server not ready", async () => {
    vi.mocked(pRetry).mockReset().mockRejectedValue(new Error("timeout"));

    await expect(verdaccio.start()).rejects.toThrowError(
      "Couldn't start npm-docker-couchdb after 2 min",
    );
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(superStart).toHaveBeenCalledOnce();
  });
});
