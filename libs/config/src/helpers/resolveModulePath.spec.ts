import { findPackageJSON } from "node:module";
import { pathToFileURL } from "node:url";

import { readPackageSync } from "read-pkg";
import resolveFrom from "resolve-from";

import { resolveModulePath } from "src/helpers/resolveModulePath";

vi.mock("node:module");
vi.mock("read-pkg");
vi.mock("resolve-from");

describe("resolveModulePath", () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalResolve = import.meta.resolve;

  afterEach(() => {
    import.meta.resolve = originalResolve;
  });

  it("should resolve module path using resolve-from", () => {
    const dir = "dir";
    const name = "package";
    const file = "file";

    vi.mocked(resolveFrom).mockReturnValue(file);

    expect(resolveModulePath(dir, name)).toEqual(file);
    expect(resolveFrom).toHaveBeenCalledWith(dir, name);
  });

  it("should resolve module path using findPackageJSON", () => {
    const dir = "dir";
    const name = "package";
    const file = "file";

    vi.mocked(resolveFrom).mockImplementation(() => {
      throw new Error("not found");
    });
    vi.mocked(findPackageJSON).mockReturnValue(`${file}/package.json`);
    vi.mocked(readPackageSync).mockReturnValue({ name });

    expect(resolveModulePath(dir, name)).toEqual(file);
    expect(resolveFrom).toHaveBeenCalledWith(dir, name);
    expect(findPackageJSON).toHaveBeenCalledWith(
      name,
      `${pathToFileURL(dir).href}/`,
    );
  });

  it("should resolve module path using import.meta.resolve", () => {
    const dir = "dir";
    const name = "node:path";

    vi.mocked(resolveFrom).mockImplementation(() => {
      throw new Error("not found");
    });
    vi.mocked(findPackageJSON).mockReturnValue(undefined);

    expect(resolveModulePath(dir, name)).toEqual("node:path");
    expect(resolveFrom).toHaveBeenCalledWith(dir, name);
    expect(findPackageJSON).toHaveBeenCalledWith(
      name,
      `${pathToFileURL(dir).href}/`,
    );
  });

  it("should resolve module path using import.meta.resolve when package name mismatched", () => {
    const dir = "dir";
    const name = "node:path";
    const file = "file";

    vi.mocked(resolveFrom).mockImplementation(() => {
      throw new Error("not found");
    });
    vi.mocked(findPackageJSON).mockReturnValue(`${file}/package.json`);
    vi.mocked(readPackageSync).mockReturnValue({ name: "other" });

    expect(resolveModulePath(dir, name)).toEqual("node:path");
    expect(resolveFrom).toHaveBeenCalledWith(dir, name);
    expect(findPackageJSON).toHaveBeenCalledWith(
      name,
      `${pathToFileURL(dir).href}/`,
    );
  });

  it("should return undefined if silent is true and module cannot be resolved", () => {
    const dir = "dir";
    const name = "package";

    vi.mocked(resolveFrom).mockImplementation(() => {
      throw new Error("not found");
    });
    vi.mocked(findPackageJSON).mockImplementation(() => {
      throw new Error("not found");
    });
    import.meta.resolve = vi.fn(() => {
      throw new Error("not found");
    });

    expect(resolveModulePath(dir, name, true)).toBeUndefined();
    expect(resolveFrom).toHaveBeenCalledWith(dir, name);
    expect(findPackageJSON).toHaveBeenCalledWith(
      name,
      `${pathToFileURL(dir).href}/`,
    );
  });

  it("should throw error if module cannot be resolved", () => {
    const dir = "dir";
    const name = "package";

    vi.mocked(resolveFrom).mockImplementation(() => {
      throw new Error("not found");
    });
    vi.mocked(findPackageJSON).mockImplementation(() => {
      throw new Error("not found");
    });
    import.meta.resolve = vi.fn(() => {
      throw new Error("not found");
    });

    expect(() => resolveModulePath(dir, name)).toThrow(
      "Cannot find module 'package' from 'dir'",
    );
    expect(resolveFrom).toHaveBeenCalledWith(dir, name);
    expect(findPackageJSON).toHaveBeenCalledWith(
      name,
      `${pathToFileURL(dir).href}/`,
    );
  });
});
