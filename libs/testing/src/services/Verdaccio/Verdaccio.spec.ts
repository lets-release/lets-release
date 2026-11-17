import { setTimeout } from "node:timers/promises";

import pRetry from "p-retry";
import { Response, fetch } from "undici";

import { Service } from "src/services/Service";
import { Verdaccio } from "src/services/Verdaccio/Verdaccio";

vi.mock("timers/promises");
vi.mock("p-retry");
vi.mock(import("undici"), async (importOriginal) => ({
  ...(await importOriginal()),
  fetch: vi.fn(),
}));

const verdaccio = new Verdaccio("verdaccio");
const superStart = vi
  .spyOn(Service.prototype, "start")
  .mockResolvedValue(undefined);

const token = "fake-token";

describe("Verdaccio", () => {
  beforeEach(() => {
    vi.mocked(setTimeout).mockClear();
    vi.mocked(pRetry)
      .mockReset()
      .mockImplementation(async (fn) => await fn(1));
    vi.mocked(fetch)
      .mockReset()
      .mockResolvedValueOnce(new Response())
      .mockResolvedValueOnce(Response.json({ token }, { status: 201 }))
      .mockResolvedValue(
        Response.json(
          { error: "bad username/password, access denied" },
          { status: 401 },
        ),
      );
    superStart.mockClear();
  });

  it("should start container and use the token returned when creating the user", async () => {
    await expect(verdaccio.start()).resolves.toBeUndefined();
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(superStart).toHaveBeenCalledOnce();
    expect(verdaccio.npmToken).toBe(token);
  });

  it("should throw error if service not ready", async () => {
    vi.mocked(pRetry).mockReset().mockRejectedValue(new Error("timeout"));

    await expect(verdaccio.start()).rejects.toThrow(
      "Couldn't start verdaccio after 2 min",
    );
    expect(setTimeout).toHaveBeenCalledWith(4000);
    expect(pRetry).toHaveBeenCalledOnce();
    expect(superStart).toHaveBeenCalledOnce();
  });
});
