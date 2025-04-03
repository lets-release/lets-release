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
      type: "npm",
      name: "a",
      uniqueName: "npm/a",
    },
    {
      path: "/root/b",
      type: "npm",
      name: "b",
      uniqueName: "npm/b",
    },
  ],
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as VerifyConditionsContext;

vi.mocked(ensureNpmPackageContext).mockImplementation(
  // eslint-disable-next-line @typescript-eslint/require-await
  async ({ getPluginPackageContext, setPluginPackageContext }) => {
    getPluginPackageContext();
    setPluginPackageContext({});

    return {} as NpmPackageContext;
  },
);

describe("verifyConditions", () => {
  beforeEach(() => {
    getPluginPackageContext.mockClear();
    setPluginPackageContext.mockClear();
  });

  it("should verify conditions", async () => {
    await expect(verifyConditions(context, options)).resolves.toBe(undefined);
    expect(getPluginPackageContext).toHaveBeenCalledTimes(2);
    expect(getPluginPackageContext).toHaveBeenNthCalledWith(1, "npm", "a");
    expect(getPluginPackageContext).toHaveBeenNthCalledWith(2, "npm", "b");
    expect(setPluginPackageContext).toHaveBeenCalledTimes(2);
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(1, "npm", "a", {});
    expect(setPluginPackageContext).toHaveBeenNthCalledWith(2, "npm", "b", {});
  });
});
