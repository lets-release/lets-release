import { PyPIPackageManagerName } from "src/enums/PyPIPackageManagerName";
import { getPackage } from "src/helpers/getPackage";
import { getPyPIPackageContext } from "src/helpers/getPyPIPackageContext";
import { getPyPIPackageManager } from "src/helpers/getPyPIPackageManager";
import { getRegistry } from "src/helpers/getRegistry";

vi.mock("src/helpers/getPackage");
vi.mock("src/helpers/getPyPIPackageManager");
vi.mock("src/helpers/getRegistry");

const context = {
  env: {},
  repositoryRoot: "/path/to/repo",
  package: {
    path: "/path/to/package",
  },
};
const pm = {
  name: PyPIPackageManagerName.uv as const,
  version: "1.0.0",
  root: "/root",
};
const pkg = { project: { name: "mock-pkg", version: "1.0.0" } };
const registry = {
  name: "test",
  url: "https://registry.example.com",
  publishUrl: "https://pypi.org",
};

describe("getPyPIPackageContext", () => {
  beforeEach(() => {
    vi.mocked(getPyPIPackageManager).mockReset();
    vi.mocked(getPackage).mockClear();
    vi.mocked(getRegistry).mockClear();
  });

  it("should return undefined if package manager is not found", async () => {
    vi.mocked(getPyPIPackageManager).mockResolvedValue(undefined);

    const result = await getPyPIPackageContext(context);

    expect(result).toBeUndefined();
  });

  it("should return package context with registry", async () => {
    vi.mocked(getPyPIPackageManager).mockResolvedValue(pm);
    vi.mocked(getPackage).mockResolvedValue(pkg);
    vi.mocked(getRegistry).mockResolvedValue(registry);

    const result = await getPyPIPackageContext(context);

    expect(result).toEqual({
      pm,
      pkg,
      registry,
    });
  });
});
