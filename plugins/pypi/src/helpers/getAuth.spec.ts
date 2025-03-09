import { AnalyzeCommitsContext } from "@lets-release/config";

import { DEFAULT_PYPI_USERNAME } from "src/constants/DEFAULT_PYPI_USERNAME";
import { getAuth } from "src/helpers/getAuth";
import { getPoetryConfig } from "src/helpers/getPoetryConfig";
import { PyPIPackageContext } from "src/types/PyPIPackageContext";

vi.mock("src/helpers/getPoetryConfig");

describe("getAuth", () => {
  describe("poetry", () => {
    beforeEach(() => {
      vi.mocked(getPoetryConfig).mockReset();
    });

    it("should return config from pyproject.toml", async () => {
      const context = {
        env: {},
      } as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "poetry", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {
              token: "test-token",
              username: "test-username",
              password: "test-password",
            },
          },
        },
        registry: {
          name: "test",
        },
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: "test-token",
        username: "test-username",
        password: "test-password",
      });
    });

    it("should return config from env", async () => {
      const context = {
        env: {
          POETRY_PYPI_TOKEN_TEST: "test-token",
          POETRY_HTTP_BASIC_TEST_USERNAME: "test-username",
          POETRY_HTTP_BASIC_TEST_PASSWORD: "test-password",
        },
      } as unknown as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "poetry", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {},
          },
        },
        registry: {
          name: "test",
        },
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: "test-token",
        username: "test-username",
        password: "test-password",
      });
    });

    it("should return config from config files", async () => {
      vi.mocked(getPoetryConfig).mockResolvedValueOnce("test-token");
      vi.mocked(getPoetryConfig).mockResolvedValueOnce("test-username");
      vi.mocked(getPoetryConfig).mockResolvedValueOnce("test-password");

      const context = {
        env: {},
      } as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "poetry", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {},
          },
        },
        registry: {
          name: "test",
        },
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: "test-token",
        username: "test-username",
        password: "test-password",
      });
    });

    it("should return default username", async () => {
      const context = {
        env: {},
      } as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "poetry", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {},
          },
        },
        registry: {
          name: "test",
        },
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: undefined,
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });
    });
  });

  describe("uv", () => {
    it("should return config from pyproject.toml", async () => {
      const context = {
        env: {},
      } as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "uv", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {
              token: "test-token",
              username: "test-username",
              password: "test-password",
            },
          },
        },
        registry: {},
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: "test-token",
        username: "test-username",
        password: "test-password",
      });
    });

    it("should return config from env", async () => {
      const context = {
        env: {
          UV_PUBLISH_TOKEN: "test-token",
          UV_PUBLISH_USERNAME: "test-username",
          UV_PUBLISH_PASSWORD: "test-password",
        },
      } as unknown as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "uv", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {},
          },
        },
        registry: {},
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: "test-token",
        username: "test-username",
        password: "test-password",
      });
    });

    it("should return default username", async () => {
      const context = {
        env: {},
      } as AnalyzeCommitsContext;
      const pkgContext = {
        pm: { name: "uv", root: "/path/to/root" },
        pkg: {
          tool: {
            letsRelease: {},
          },
        },
        registry: {},
      } as PyPIPackageContext;

      const auth = await getAuth(context, pkgContext);

      expect(auth).toEqual({
        token: undefined,
        username: DEFAULT_PYPI_USERNAME,
        password: undefined,
      });
    });
  });
});
