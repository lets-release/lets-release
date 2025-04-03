import { VerifyConditionsContext } from "@lets-release/config";

import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { PyPIOptions } from "src/schemas/PyPIOptions";
import { verifyConditions } from "src/steps/verifyConditions";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("src/helpers/ensurePyPIPackageContext");

const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();
const context = {
  packages: [
    { type: "pypi", name: "package1" },
    { type: "pypi", name: "package2" },
  ],
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as VerifyConditionsContext;

describe("verifyConditions", () => {
  beforeEach(() => {
    vi.mocked(ensurePyPIPackageContext)
      .mockReset()
      .mockImplementation(
        // eslint-disable-next-line @typescript-eslint/require-await
        async ({ getPluginPackageContext, setPluginPackageContext }) => {
          getPluginPackageContext();
          setPluginPackageContext(undefined);

          return {} as PyPIPackageContext;
        },
      );
  });

  it("should call ensurePyPIPackageContext for each package if skipPublishing is false", async () => {
    const options = { skipPublishing: false };
    const parsedOptions = await PyPIOptions.parseAsync(options);

    await verifyConditions(context, options);

    expect(ensurePyPIPackageContext).toHaveBeenCalledTimes(2);
    expect(ensurePyPIPackageContext).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ package: context.packages[0] }),
      parsedOptions,
    );
    expect(ensurePyPIPackageContext).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ package: context.packages[1] }),
      parsedOptions,
    );
    expect(getPluginPackageContext).toHaveBeenCalledTimes(2);
    expect(getPluginPackageContext).toHaveBeenNthCalledWith(
      1,
      "pypi",
      "package1",
    );
    expect(getPluginPackageContext).toHaveBeenNthCalledWith(
      2,
      "pypi",
      "package2",
    );
    expect(setPluginPackageContext).toHaveBeenCalledTimes(2);
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(
      1,
      "pypi",
      "package1",
      undefined,
    );
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(
      2,
      "pypi",
      "package2",
      undefined,
    );
  });

  it("should not call ensurePyPIPackageContext if skipPublishing is true", async () => {
    const options = { skipPublishing: true };

    await verifyConditions(context, options);

    expect(ensurePyPIPackageContext).not.toHaveBeenCalled();
  });
});
