import { $ } from "execa";

import { PublishContext } from "@lets-release/config";

import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { getArtifactInfo } from "src/helpers/getArtifactInfo";
import { getAuth } from "src/helpers/getAuth";
import { preparePackage } from "src/helpers/preparePackage";
import { publish } from "src/steps/publish";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("execa");
vi.mock("src/helpers/getAuth");
vi.mock("src/helpers/preparePackage");
vi.mock("src/helpers/ensurePyPIPackageContext");
vi.mock("src/helpers/getArtifactInfo");

const log = vi.fn();
const context = {
  env: {},
  logger: { log },
  package: {
    path: "/path/to/package",
    name: "test-package",
    uniqueName: "test-package",
  },
  nextRelease: { version: "1.0.0" },
} as unknown as PublishContext;
const pkgContext = {
  prepared: false,
  pm: { name: "poetry", root: "/path/to/package" },
  registry: { name: "test-registry", publishUrl: "https://test.registry" },
  pkg: { project: { classifiers: [] } },
} as unknown as PyPIPackageContext;
const artifact = {
  name: "test-package",
  url: "https://test.registry",
};

class ExtendedPromise extends Promise<unknown> {
  stdout = {
    pipe: vi.fn(),
  };
  stderr = {
    pipe: vi.fn(),
  };
}
const promise = new ExtendedPromise((resolve) => {
  resolve({ stdout: [""] });
});

vi.mocked(getArtifactInfo).mockReturnValue(artifact);

describe("publish", () => {
  beforeEach(() => {
    vi.mocked($)
      .mockReset()
      .mockReturnValue((() => promise) as never);
    vi.mocked(ensurePyPIPackageContext).mockReset();
    vi.mocked(getAuth).mockReset();
    vi.mocked(preparePackage).mockClear();
    vi.mocked(getArtifactInfo).mockClear();
  });

  describe("poetry", () => {
    it("should publish the package with token", async () => {
      vi.mocked(ensurePyPIPackageContext).mockResolvedValue(pkgContext);
      vi.mocked(getAuth).mockResolvedValue({
        token: "test-token",
        username: "",
        password: "",
      });

      await expect(publish(context, {})).resolves.toBe(artifact);

      expect(preparePackage).toHaveBeenCalled();
      expect(log).toHaveBeenNthCalledWith(1, {
        prefix: "[test-package]",
        message: "Publishing version 1.0.0 to PyPI registry",
      });
      expect(log).toHaveBeenNthCalledWith(2, {
        prefix: "[test-package]",
        message: "Published test-package@1.0.0 to https://test.registry",
      });
    });

    it("should publish the package with username and password", async () => {
      vi.mocked(ensurePyPIPackageContext).mockResolvedValue(pkgContext);
      vi.mocked(getAuth).mockResolvedValue({
        token: "",
        username: "test-username",
        password: "test-password",
      });

      await expect(publish(context, {})).resolves.toBe(artifact);

      expect(preparePackage).toHaveBeenCalled();
      expect(log).toHaveBeenNthCalledWith(1, {
        prefix: "[test-package]",
        message: "Publishing version 1.0.0 to PyPI registry",
      });
      expect(log).toHaveBeenNthCalledWith(2, {
        prefix: "[test-package]",
        message: "Published test-package@1.0.0 to https://test.registry",
      });
    });
  });

  describe("uv", () => {
    const uvPkgContext = {
      ...pkgContext,
      pm: { ...pkgContext.pm, name: "uv" },
    } as unknown as PyPIPackageContext;

    it("should publish the package with token", async () => {
      vi.mocked(ensurePyPIPackageContext).mockResolvedValue(uvPkgContext);
      vi.mocked(getAuth).mockResolvedValue({
        token: "test-token",
        username: "",
        password: "",
      });

      await expect(publish(context, {})).resolves.toBe(artifact);

      expect(preparePackage).toHaveBeenCalled();
      expect(log).toHaveBeenNthCalledWith(1, {
        prefix: "[test-package]",
        message: "Publishing version 1.0.0 to PyPI registry",
      });
      expect(log).toHaveBeenNthCalledWith(2, {
        prefix: "[test-package]",
        message: "Published test-package@1.0.0 to https://test.registry",
      });
    });

    it("should publish the package with username and password", async () => {
      vi.mocked(ensurePyPIPackageContext).mockResolvedValue({
        ...uvPkgContext,
        registry: {
          ...uvPkgContext,
          url: "https://test.registry",
        },
      } as unknown as PyPIPackageContext);
      vi.mocked(getAuth).mockResolvedValue({
        token: "",
        username: "test-username",
        password: "test-password",
      });

      await expect(publish(context, {})).resolves.toBe(artifact);

      expect(preparePackage).toHaveBeenCalled();
      expect(log).toHaveBeenNthCalledWith(1, {
        prefix: "[test-package]",
        message: "Publishing version 1.0.0 to PyPI registry",
      });
      expect(log).toHaveBeenNthCalledWith(2, {
        prefix: "[test-package]",
        message: "Published test-package@1.0.0 to https://test.registry",
      });
    });
  });

  it("should skip publishing if skipPublishing is true", async () => {
    vi.mocked(ensurePyPIPackageContext).mockResolvedValue({
      ...pkgContext,
      prepared: true,
    });

    await expect(
      publish(context, { skipPublishing: true }),
    ).resolves.toBeUndefined();

    expect(preparePackage).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith({
      prefix: "[test-package]",
      message: "Skip publishing to PyPI registry as skipPublishing is true",
    });
  });

  it("should skip publishing if project has private classifiers", async () => {
    vi.mocked(ensurePyPIPackageContext).mockResolvedValue({
      ...pkgContext,
      pkg: {
        project: { name: "test-package", classifiers: ["Private :: Example"] },
      },
    });

    await publish(context, {});

    expect(context.logger.log).toHaveBeenCalledWith({
      prefix: "[test-package]",
      message:
        "Skip publishing to PyPI registry as project has private classifiers",
    });
  });
});
