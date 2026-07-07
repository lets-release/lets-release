import { loadModule } from "src/helpers/loadModule";
import { resolveModulePath } from "src/helpers/resolveModulePath";

// should mock existing files, maybe related to https://github.com/vitest-dev/vitest/issues/4158
const fileA = vi.hoisted(() => `${import.meta.dirname}/parseGitUrl.ts`);
const urlA = await vi.hoisted(async () => {
  const { pathToFileURL } =
    await vi.importActual<typeof import("node:url")>("node:url");

  return pathToFileURL(fileA).toString();
});
// should mock existing files, maybe related to https://github.com/vitest-dev/vitest/issues/4158
const fileB = vi.hoisted(() => `${import.meta.dirname}/parseGitUrlPath.ts`);
const urlB = await vi.hoisted(async () => {
  const { pathToFileURL } =
    await vi.importActual<typeof import("node:url")>("node:url");

  return pathToFileURL(fileB).toString();
});
const loader = vi.hoisted(() => vi.fn());

vi.mock("src/helpers/resolveModulePath");
vi.mock(urlA, () => ({ default: loader }));
vi.mock(urlB, () => ({ default: undefined, named: loader }));

const dir = "dir";
const name = "package";

describe("loadModule", () => {
  beforeEach(() => {
    vi.mocked(resolveModulePath).mockClear();
    loader.mockClear();
  });

  it("should return default export", async () => {
    vi.mocked(resolveModulePath)
      .mockReturnValueOnce(undefined)
      .mockReturnValue(fileA);

    await expect(loadModule(name, [dir])).resolves.toEqual(loader);
    expect(resolveModulePath).toHaveBeenNthCalledWith(1, dir, name, true);
    expect(resolveModulePath).toHaveBeenNthCalledWith(2, process.cwd(), name);
  });

  it("should return named export", async () => {
    vi.mocked(resolveModulePath)
      .mockReturnValueOnce(undefined)
      .mockReturnValue(fileB);

    await expect(loadModule(name, [dir])).resolves.toEqual({
      named: loader,
    });
    expect(resolveModulePath).toHaveBeenNthCalledWith(1, dir, name, true);
    expect(resolveModulePath).toHaveBeenNthCalledWith(2, process.cwd(), name);
  });
});
