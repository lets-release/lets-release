import { NoPyPIPackageNameError } from "src/errors/NoPyPIPackageNameError";
import { normalizePyProjectToml } from "src/helpers/normalizePyProjectToml";

describe("normalizePyProjectToml", () => {
  it("should normalize a valid pyproject.toml", () => {
    const raw = {
      project: {
        name: "example",
        version: "1.0.0",
        classifiers: ["Development Status :: 4 - Beta"],
        dependencies: ["package1", "package2"],
        "optional-dependencies": {
          dev: ["package3", "package4"],
          unknown: [1, 2],
        },
      },
      "dependency-groups": {
        group1: ["package5", "package6"],
        unknown: [1, 2],
      },
      tool: {
        uv: {
          index: [
            {
              name: "pypi",
              url: "https://example.com",
              "publish-url": "https://example.com",
            },
          ],
          "check-url": "https://example.com",
          "publish-url": "https://example.com",
          "dev-dependencies": ["package3", "package4"],
        },
        poetry: {
          dependencies: { package7: "^1.0.0" },
          group: {
            group2: {
              dependencies: { package8: "^2.0.0" },
            },
            unknown: [1, 2],
          },
        },
        "lets-release": {
          registry: {
            name: "pypi",
            url: "https://example.com",
            "publish-url": "https://example.com",
          },
          token: "token123",
          username: "user",
          password: "pass",
        },
      },
    };

    const result = normalizePyProjectToml(raw);

    expect(result).toEqual({
      project: {
        name: "example",
        version: "1.0.0",
        classifiers: ["Development Status :: 4 - Beta"],
        dependencies: ["package1", "package2"],
        optionalDependencies: {
          dev: ["package3", "package4"],
        },
      },
      dependencyGroups: {
        group1: ["package5", "package6"],
      },
      tool: {
        uv: {
          index: [
            {
              name: "pypi",
              url: "https://example.com",
              publishUrl: "https://example.com",
            },
          ],
          checkUrl: "https://example.com",
          publishUrl: "https://example.com",
          devDependencies: ["package3", "package4"],
        },
        poetry: {
          dependencies: { package7: "^1.0.0" },
          group: {
            group2: {
              dependencies: { package8: "^2.0.0" },
            },
          },
        },
        letsRelease: {
          registry: {
            name: "pypi",
            url: "https://example.com",
            publishUrl: "https://example.com",
          },
          token: "token123",
          username: "user",
          password: "pass",
        },
      },
    });

    const anotherRaw = {
      project: {
        name: "example",
      },
      "dependency-groups": [],
      tool: {},
    };

    const anotherResult = normalizePyProjectToml(anotherRaw);

    expect(anotherResult).toEqual({
      project: {
        name: "example",
        optionalDependencies: {},
      },
      dependencyGroups: {},
      tool: {
        poetry: {
          group: {},
        },
        letsRelease: {},
      },
    });
  });

  it("should throw NoPyPIPackageNameError if name is missing", () => {
    const raw = {
      project: {
        version: "1.0.0",
      },
    };

    expect(() => normalizePyProjectToml(raw)).toThrow(NoPyPIPackageNameError);
  });
});
