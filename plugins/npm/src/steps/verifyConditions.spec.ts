import { NormalizedPackageJson } from "read-pkg";

import { VerifyConditionsContext } from "@lets-release/config";

import { getPackage } from "src/helpers/getPackage";
import { verifyConditions } from "src/steps/verifyConditions";

vi.mock("src/helpers/ensureNpmPackageContext");
vi.mock("src/helpers/getPackage");

const options = { skipPublishing: false };
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
} as VerifyConditionsContext;

vi.mocked(getPackage).mockImplementation(async (path) => {
  if (path === "/root/a") {
    return { private: false } as NormalizedPackageJson;
  }

  return { private: true } as NormalizedPackageJson;
});

describe("verifyConditions", async () => {
  beforeEach(() => {
    vi.mocked(getPackage).mockClear();
  });

  it("should verify conditions", async () => {
    await expect(verifyConditions(context, options)).resolves.toBe(undefined);
    expect(getPackage).toHaveBeenCalledTimes(2);
  });
});
