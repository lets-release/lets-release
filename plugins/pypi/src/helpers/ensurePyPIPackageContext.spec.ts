import { AnalyzeCommitsContext } from "@lets-release/config";

import { PYPI_PRIVATE_CLASSIFIER_PREFIX } from "src/constants/PYPI_PRIVATE_CLASSIFIER_PREFIX";
import { UnsupportedPyPIPackageManagerError } from "src/errors/UnsupportedPyPIPackageManagerError";
import { ensurePyPIPackageContext } from "src/helpers/ensurePyPIPackageContext";
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
  pkg: {
    project: {
      classifiers: [],
    },
  },
  verified: false,
};

describe("ensurePyPIPackageContext", () => {
  beforeEach(() => {
    getPluginPackageContext.mockReset();
    setPluginPackageContext.mockClear();
    vi.mocked(verifyAuth).mockClear();
    vi.mocked(verifyPyPIPackageManagerVersion).mockClear();
  });

  it("should throw UnsupportedPyPIPackageManagerError if pkgContext is not found", async () => {
    getPluginPackageContext.mockReturnValueOnce(null);

    await expect(
      ensurePyPIPackageContext(context, { skipPublishing: false }),
    ).rejects.toThrow(UnsupportedPyPIPackageManagerError);
  });

  it("should verify auth and version if not verified and not skipping publishing", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(verifyPyPIPackageManagerVersion).toHaveBeenCalled();
    expect(verifyAuth).toHaveBeenCalled();
  });

  it("should not verify auth and version if skipping publishing", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    await ensurePyPIPackageContext(context, { skipPublishing: true });
    expect(verifyPyPIPackageManagerVersion).not.toHaveBeenCalled();
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it("should not verify auth and version if already verified", async () => {
    getPluginPackageContext.mockReturnValueOnce({
      ...pkgContext,
      verified: true,
    });
    await ensurePyPIPackageContext(context, { skipPublishing: false });

    expect(verifyPyPIPackageManagerVersion).not.toHaveBeenCalled();
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it("should not verify auth and version if classifiers include private prefix", async () => {
    getPluginPackageContext.mockReturnValueOnce({
      ...pkgContext,
      pkg: {
        project: {
          classifiers: [`${PYPI_PRIVATE_CLASSIFIER_PREFIX}SomeClassifier`],
        },
      },
    });

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(verifyPyPIPackageManagerVersion).not.toHaveBeenCalled();
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it("should set verifiedPkgContext", async () => {
    getPluginPackageContext.mockReturnValueOnce(pkgContext);

    await ensurePyPIPackageContext(context, { skipPublishing: false });
    expect(context.setPluginPackageContext).toHaveBeenCalledWith({
      ...pkgContext,
      verified: true,
    });
  });
});
