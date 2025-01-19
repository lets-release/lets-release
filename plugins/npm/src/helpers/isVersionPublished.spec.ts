import { $ } from "execa";

import { VerifyReleaseContext } from "@lets-release/config";

import { DEFAULT_NPM_REGISTRY } from "src/constants/DEFAULT_NPM_REGISTRY";
import { isVersionPublished } from "src/helpers/isVersionPublished";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

const cwd = "cwd";
const registry = DEFAULT_NPM_REGISTRY;
const context = {
  env: {},
  package: { name: "package" },
  nextRelease: { version: "1.0.0" },
} as VerifyReleaseContext;

describe("isVersionPublished", () => {
  beforeEach(() => {
    exec.mockReset().mockResolvedValue({ exitCode: 0, stdout: "" });
  });

  it("should check is version published with pnpm", async () => {
    exec
      .mockResolvedValueOnce({ exitCode: 0, stdout: "" })
      .mockResolvedValueOnce({ exitCode: 1, stdout: "" });

    await expect(
      isVersionPublished(context, {
        pm: { name: "pnpm" },
        cwd,
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(true);
    await expect(
      isVersionPublished(context, {
        pm: { name: "pnpm" },
        cwd,
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(false);
  });

  it("should check is version published with yarn", async () => {
    exec
      .mockResolvedValueOnce({ exitCode: 0, stdout: "" })
      .mockResolvedValueOnce({
        exitCode: 0,
        stdout: "YN0000: Unmet range 1.2.3; falling back to the latest version",
      });

    await expect(
      isVersionPublished(context, {
        pm: { name: "yarn" },
        cwd,
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(true);
    await expect(
      isVersionPublished(context, {
        pm: { name: "yarn" },
        cwd,
        registry,
      } as NpmPackageContext),
    ).resolves.toBe(false);
  });

  it("should check is version published with npm", async () => {
    exec
      .mockResolvedValueOnce({ exitCode: 0, stdout: "" })
      .mockResolvedValueOnce({ exitCode: 1, stdout: "" });

    await expect(
      isVersionPublished(context, { cwd, registry } as NpmPackageContext),
    ).resolves.toBe(true);
    await expect(
      isVersionPublished(context, { cwd, registry } as NpmPackageContext),
    ).resolves.toBe(false);
  });
});
