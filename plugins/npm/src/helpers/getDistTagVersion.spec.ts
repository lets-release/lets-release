import { $ } from "execa";

import { VerifyReleaseContext } from "@lets-release/config";

import { getDistTagVersion } from "src/helpers/getDistTagVersion";
import { NpmPackageContext } from "src/types/NpmPackageContext";

vi.mock("execa");

const cwd = "cwd";
const registry = "https://test.org";

const context = {
  env: {},
  package: { name: "package" },
} as VerifyReleaseContext;

describe("getDistTagVersion", () => {
  beforeEach(() => {
    vi.mocked($).mockReset();
  });

  it("should get the version of the dist tag with pnpm", async () => {
    const pkgContext = {
      registry,
      pm: {
        name: "pnpm",
        root: cwd,
      },
    } as NpmPackageContext;
    const exec = vi.fn().mockResolvedValue({
      stdout: ["latest: 1.0.0", "next: 1.1.0", "next-major: 2.0.0"],
    });

    vi.mocked($).mockReturnValue(exec as never);

    await expect(
      getDistTagVersion(context, pkgContext, "latest"),
    ).resolves.toBe("1.0.0");
    await expect(getDistTagVersion(context, pkgContext, "next")).resolves.toBe(
      "1.1.0",
    );
    await expect(
      getDistTagVersion(context, pkgContext, "next-major"),
    ).resolves.toBe("2.0.0");
    await expect(getDistTagVersion(context, pkgContext, "dev")).resolves.toBe(
      undefined,
    );
  });

  it("should get the version of the dist tag with yarn", async () => {
    const pkgContext = {
      registry,
      pm: {
        name: "yarn",
        root: cwd,
      },
    } as NpmPackageContext;
    const exec = vi.fn().mockResolvedValue({
      stdout: [
        '{"descriptor":"package@latest","locator":"package@1.0.0"}',
        '{"descriptor":"package@next","locator":"package@1.1.0"}',
        '{"descriptor":"package@next-major","locator":"package@2.0.0"}',
      ],
    });

    vi.mocked($).mockReturnValue(exec as never);

    await expect(
      getDistTagVersion(context, pkgContext, "latest"),
    ).resolves.toBe("1.0.0");
    await expect(getDistTagVersion(context, pkgContext, "next")).resolves.toBe(
      "1.1.0",
    );
    await expect(
      getDistTagVersion(context, pkgContext, "next-major"),
    ).resolves.toBe("2.0.0");
    await expect(getDistTagVersion(context, pkgContext, "dev")).resolves.toBe(
      undefined,
    );
  });

  it("should get the version of the dist tag with npm", async () => {
    const pkgContext = {
      registry,
      pm: {
        name: "npm",
        root: cwd,
      },
    } as NpmPackageContext;
    const exec = vi.fn().mockResolvedValue({
      stdout: ["latest: 1.0.0", "next: 1.1.0", "next-major: 2.0.0"],
    });

    vi.mocked($).mockReturnValue(exec as never);

    await expect(
      getDistTagVersion(context, pkgContext, "latest"),
    ).resolves.toBe("1.0.0");
    await expect(getDistTagVersion(context, pkgContext, "next")).resolves.toBe(
      "1.1.0",
    );
    await expect(
      getDistTagVersion(context, pkgContext, "next-major"),
    ).resolves.toBe("2.0.0");
    await expect(getDistTagVersion(context, pkgContext, "dev")).resolves.toBe(
      undefined,
    );
  });
});
