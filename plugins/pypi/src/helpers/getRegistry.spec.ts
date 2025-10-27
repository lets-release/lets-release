import { DEFAULT_PYPI_REGISTRY } from "src/constants/DEFAULT_PYPI_REGISTRY";
import { getPoetryRegistries } from "src/helpers/getPoetryRegistries";
import { getRegistry } from "src/helpers/getRegistry";
import { getUvConfig } from "src/helpers/getUvConfig";
import { name } from "src/plugin";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("src/helpers/getPoetryRegistries");
vi.mock("src/helpers/getUvConfig");

const registries = [
  {
    name: "test.repo",
    publishUrl: "https://registry.example.com",
  },
];
const uvConfig = {
  index: registries,
  checkUrl: undefined,
  publishUrl: undefined,
  devDependencies: [],
};

vi.mocked(getPoetryRegistries).mockResolvedValue(registries);
vi.mocked(getUvConfig).mockResolvedValue(uvConfig);

const pkg = {
  path: "/path/to/package",
};
const poetry = {
  name: "poetry",
  version: "1.0.0",
  root: "/path/to/package",
};
const uv = {
  name: "uv",
  version: "1.0.0",
  root: "/path/to/package",
};

describe("getRegistry", () => {
  describe("poetry", () => {
    it("should return registry from env if it matches registry.publishUrl", async () => {
      const context = {
        env: {
          TEST_URL: "test",
          POETRY_REPOSITORIES_UNKNOWN_URL: "",
          POETRY_REPOSITORIES_TEST_REPO_URL: "https://registry.example.com",
        },
        package: pkg,
      };
      const pkgContext = {
        pm: poetry,
        pkg: {
          tool: {
            letsRelease: {
              registry: { publishUrl: "https://registry.example.com" },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name: "test_repo",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should return registry from config if it matches registry.publishUrl", async () => {
      const context = {
        env: {},
        package: pkg,
      };
      const pkgContext = {
        pm: poetry,
        pkg: {
          tool: {
            letsRelease: {
              registry: { publishUrl: "https://registry.example.com" },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name: "test.repo",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should continue search when config does not match registry.publishUrl", async () => {
      const context = {
        env: {},
        package: pkg,
      };
      const pkgContext = {
        pm: poetry,
        pkg: {
          tool: {
            letsRelease: {
              registry: { publishUrl: "https://nonexistent.example.com" },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual(DEFAULT_PYPI_REGISTRY);
    });

    it("should return registry from env if it matches registry.name", async () => {
      const context = {
        env: {
          TEST_URL: "test",
          POETRY_REPOSITORIES_UNKNOWN_URL: "",
          POETRY_REPOSITORIES_TEST_REPO_URL: "https://registry.example.com",
        },
        package: pkg,
      };
      const pkgContext = {
        pm: poetry,
        pkg: {
          tool: {
            letsRelease: {
              registry: { name: "test.repo" },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name: "test_repo",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should return registry from config files if it matches registry.name", async () => {
      const context = {
        env: {},
        package: pkg,
      };
      const pkgContext = {
        pm: poetry,
        pkg: {
          tool: {
            letsRelease: {
              registry: { name: "test.repo" },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name: "test.repo",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should return default registry if no match found", async () => {
      const context = {
        env: {},
        package: pkg,
      };
      const pkgContext = {
        pm: poetry,
        pkg: {
          tool: {
            letsRelease: {
              registry: { name: "unknown" },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual(DEFAULT_PYPI_REGISTRY);
    });
  });

  describe("uv", () => {
    it("should return registry from pyproject.toml if configured", async () => {
      const context = {
        env: {},
        package: pkg,
      };
      const pkgContext = {
        pm: uv,
        pkg: {
          tool: {
            letsRelease: {
              registry: {
                url: "https://registry.example.com",
                publishUrl: "https://registry.example.com",
              },
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name,
        url: "https://registry.example.com",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should return registry from env if UV_PUBLISH_URL is set", async () => {
      const context = {
        env: {
          UV_PUBLISH_CHECK_URL: "https://registry.example.com",
          UV_PUBLISH_URL: "https://registry.example.com",
        },
        package: pkg,
      };
      const pkgContext = {
        pm: uv,
        pkg: {
          tool: {
            letsRelease: {
              registry: {},
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name,
        url: "https://registry.example.com",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should return registry found from config files if UV_PUBLISH_INDEX is set", async () => {
      const context = {
        env: {
          UV_PUBLISH_CHECK_URL: "https://registry.example.com",
          UV_PUBLISH_INDEX: "test.repo",
        },
        package: pkg,
      };
      const pkgContext = {
        pm: uv,
        pkg: {
          tool: {
            letsRelease: {
              registry: {},
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual({
        name: "test.repo",
        url: "https://registry.example.com",
        publishUrl: "https://registry.example.com",
      });
    });

    it("should return default registry when UV_PUBLISH_INDEX does not match any config", async () => {
      const context = {
        env: {
          UV_PUBLISH_CHECK_URL: "https://registry.example.com",
          UV_PUBLISH_INDEX: "nonexistent.repo",
        },
        package: pkg,
      };
      const pkgContext = {
        pm: uv,
        pkg: {
          tool: {
            letsRelease: {
              registry: {},
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual(DEFAULT_PYPI_REGISTRY);
    });

    it("should return default registry if no match found", async () => {
      const context = {
        env: {},
        package: pkg,
      };
      const pkgContext = {
        pm: uv,
        pkg: {
          tool: {
            letsRelease: {
              registry: {},
            },
          },
        },
      } as PyPIPackageContext;

      const result = await getRegistry(context, pkgContext);

      expect(result).toEqual(DEFAULT_PYPI_REGISTRY);
    });
  });
});
