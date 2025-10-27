import { AnalyzeCommitsContext } from "@lets-release/config";

import { PYPI_PRIVATE_CLASSIFIER_PREFIX } from "src/constants/PYPI_PRIVATE_CLASSIFIER_PREFIX";
import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { UnsupportedPyPIPackageManagerError } from "src/errors/UnsupportedPyPIPackageManagerError";
import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
import { getPyPIPackageContext } from "src/helpers/getPyPIPackageContext";
import { verifyAuth } from "src/helpers/verifyAuth";
import { verifyPyPIPackageManagerVersion } from "src/helpers/verifyPyPIPackageManagerVersion";

vi.mock("src/helpers/getPyPIPackageContext");
vi.mock("src/helpers/verifyAuth");
vi.mock("src/helpers/verifyPyPIPackageManagerVersion");

const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();
const context = {
  env: {},
  repositoryRoot: "/path/to/repo",
  package: { uniqueName: "test-package" },
  getPluginPackageContext,
  setPluginPackageContext,
} as unknown as AnalyzeCommitsContext;

const pkgContext = {
  pm: {
    name: PyPIPackageManagerName.uv,
    version: "1.0.0",
    root: "/path/to/root",
  },
  pkg: {
    project: {
      name: "test-package",
      classifiers: [],
    },
  },
  registry: { name: "pypi", publishUrl: "https://upload.pypi.org/legacy/" },
  verified: false,
};

describe("ensurePyPIPackageContext", () => {
  beforeEach(() => {
    getPluginPackageContext.mockReset();
    setPluginPackageContext.mockClear();
    vi.mocked(getPyPIPackageContext).mockClear();
    vi.mocked(verifyAuth).mockClear();
    vi.mocked(verifyPyPIPackageManagerVersion)
      .mockResolvedValue("1.0.0")
      .mockClear();
  });

  it("should throw UnsupportedPyPIPackageManagerError if both contexts return null", async () => {
    getPluginPackageContext.mockReturnValueOnce(null);
    vi.mocked(getPyPIPackageContext).mockResolvedValueOnce(undefined);

    await expect(
      ensurePyPIPackageContext(context, { skipPublishing: false }),
    ).rejects.toThrow(UnsupportedPyPIPackageManagerError);
  });

  it("should throw UnsupportedPyPIPackageManagerError if both contexts return undefined", async () => {
    getPluginPackageContext.mockReturnValueOnce(undefined);
    vi.mocked(getPyPIPackageContext).mockResolvedValueOnce(undefined);

    await expect(
      ensurePyPIPackageContext(context, { skipPublishing: false }),
    ).rejects.toThrow(UnsupportedPyPIPackageManagerError);
  });

  it("should not verify auth and pm version if already verified", async () => {
    getPluginPackageContext.mockReturnValueOnce({
      ...pkgContext,
      verified: true,
    });
    await ensurePyPIPackageContext(context, { skipPublishing: false });

    expect(verifyPyPIPackageManagerVersion).not.toHaveBeenCalled();
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it("should verify pm version and not auth if skipping publishing", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    await ensurePyPIPackageContext(context, { skipPublishing: true });
    expect(verifyPyPIPackageManagerVersion).toHaveBeenCalled();
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it("should verify pm version and not auth if classifiers include private prefix", async () => {
    getPluginPackageContext.mockReturnValueOnce({
      ...pkgContext,
      pkg: {
        project: {
          classifiers: [`${PYPI_PRIVATE_CLASSIFIER_PREFIX}SomeClassifier`],
        },
      },
    });

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(verifyPyPIPackageManagerVersion).toHaveBeenCalled();
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it("should verify auth and pm version if not verified and not skipping publishing", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(verifyPyPIPackageManagerVersion).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalled();
  });

  it("should verify auth when classifiers is undefined and not skipping publishing", async () => {
    getPluginPackageContext.mockReturnValueOnce({
      ...pkgContext,
      pkg: {
        project: {
          classifiers: undefined,
        },
      },
    });

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(verifyPyPIPackageManagerVersion).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalled();
  });

  it("should verify auth when classifiers exist but do not contain private prefix", async () => {
    getPluginPackageContext.mockReturnValueOnce({
      ...pkgContext,
      pkg: {
        project: {
          classifiers: [
            "Development Status :: 4 - Beta",
            "Programming Language :: Python",
          ],
        },
      },
    });

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(verifyPyPIPackageManagerVersion).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalled();
  });

  it("should use existing context when getPluginPackageContext returns valid value", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    const result = await ensurePyPIPackageContext(context, {
      skipPublishing: false,
    });
    expect(vi.mocked(getPyPIPackageContext)).not.toHaveBeenCalled();
    expect(result).toEqual({
      ...pkgContext,
      pm: { ...pkgContext.pm, version: "1.0.0" },
      verified: true,
    });
  });

  it("should use getPyPIPackageContext when getPluginPackageContext returns null", async () => {
    getPluginPackageContext.mockReturnValueOnce(null);
    vi.mocked(getPyPIPackageContext).mockResolvedValueOnce(pkgContext);

    const result = await ensurePyPIPackageContext(context, {
      skipPublishing: false,
    });
    expect(vi.mocked(getPyPIPackageContext)).toHaveBeenCalledWith(context);
    expect(result).toEqual({
      ...pkgContext,
      pm: { ...pkgContext.pm, version: "1.0.0" },
      verified: true,
    });
  });

  it("should set verifiedPkgContext", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(context.setPluginPackageContext).toHaveBeenCalledWith({
      ...pkgContext,
      pm: { ...pkgContext.pm, version: "1.0.0" },
      verified: true,
    });
  });
});
