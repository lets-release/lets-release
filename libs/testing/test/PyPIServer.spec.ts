import { PyPIServer } from "src/services/PyPIServer/PyPIServer";

describe("PyPIServer", () => {
  it("should start pypiserver container", async () => {
    const pypiServer = new PyPIServer("pypiserver-e2e", 6888);

    onTestFailed(async () => {
      await pypiServer.stop();
    });

    await expect(pypiServer.pull()).resolves.toBeUndefined();
    await expect(pypiServer.start()).resolves.toBeUndefined();
    await expect(pypiServer.stop()).resolves.toBeUndefined();
  });
});
