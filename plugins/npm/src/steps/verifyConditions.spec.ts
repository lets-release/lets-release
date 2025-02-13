import { VerifyConditionsContext } from "@lets-release/config";

import { ensureNpmPackageContext } from "src/helpers/ensureNpmPackageContext";
import { verifyConditions } from "src/steps/verifyConditions";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("src/helpers/ensureNpmPackageContext");

const options = { skipPublishing: false };
const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();
const context = {
  packages: [
    {
      path: "/root/a",
      name: "a",
    },
    {
      path: "/root/b",
      name: "b",
    },
  ],
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as VerifyConditionsContext;

vi.mocked(ensureNpmPackageContext).mockImplementation(
  async ({ getPluginPackageContext, setPluginPackageContext }) => {
    getPluginPackageContext();
    setPluginPackageContext({});

    return {} as NpmPackageContext;
  },
);

describe("verifyConditions", async () => {
  beforeEach(() => {
    getPluginPackageContext.mockClear();
    setPluginPackageContext.mockClear();
  });

  it("should verify conditions", async () => {
    await expect(verifyConditions(context, options)).resolves.toBe(undefined);
    expect(getPluginPackageContext).toHaveBeenCalledTimes(2);
    expect(getPluginPackageContext).toHaveBeenNthCalledWith(1, "a");
    expect(getPluginPackageContext).toHaveBeenNthCalledWith(2, "b");
    expect(setPluginPackageContext).toHaveBeenCalledTimes(2);
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(1, "a", {});
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(2, "b", {});
  });
});
