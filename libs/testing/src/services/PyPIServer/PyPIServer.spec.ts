import { setTimeout } from "node:timers/promises";

import pRetry from "p-retry";
import { fetch } from "undici";

import { PyPIServer } from "src/services/PyPIServer/PyPIServer";
import { Service } from "src/services/Service";

vi.mock("timers/promises");
vi.mock("p-retry");
vi.mock("undici");

const pypiServer = new PyPIServer("pypiserver");
const superStart = vi
  .spyOn(Service.prototype, "start")
  .mockResolvedValue(undefined);

describe("PyPIServer", () => {
  beforeEach(() => {
    vi.mocked(setTimeout).mockClear();
    vi.mocked(pRetry)
      .mockReset()
      .mockImplementation(async (fn) => await fn(1));
    vi.mocked(fetch).mockReset();
    superStart.mockClear();
  });

  it("should start container", async () => {
    await expect(pypiServer.start()).resolves.toBeUndefined();
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(superStart).toHaveBeenCalledOnce();
  });

  it("should throw error if service not ready", async () => {
    vi.mocked(pRetry).mockReset().mockRejectedValue(new Error("timeout"));

    await expect(pypiServer.start()).rejects.toThrowError(
      "Couldn't start pypiserver after 2 min",
    );
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(superStart).toHaveBeenCalledOnce();
  });
});
