import { Verdaccio } from "src/services/Verdaccio/Verdaccio";

describe("Verdaccio", () => {
  it("should start verdaccio container", async () => {
    const verdaccio = new Verdaccio("verdaccio-e2e", 6888);

    onTestFailed(async () => {
      await verdaccio.stop();
    });

    await expect(verdaccio.pull()).resolves.toBeUndefined();
    await expect(verdaccio.start()).resolves.toBeUndefined();
    await expect(verdaccio.stop()).resolves.toBeUndefined();
  });
});
