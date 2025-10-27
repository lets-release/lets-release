import resolveFrom from "resolve-from";

import { loadModule } from "src/helpers/loadModule";

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

vi.mock("resolve-from");
vi.mock(urlA, () => ({ default: loader }));
vi.mock(urlB, () => ({ default: undefined, named: loader }));

const silent = vi.fn();

// eslint-disable-next-line @typescript-eslint/unbound-method
vi.mocked(resolveFrom.silent).mockImplementation(silent);

const dir = "dir";
const name = "package";

describe("loadModule", () => {
  beforeEach(() => {
    silent.mockClear();
    loader.mockClear();
    vi.mocked(resolveFrom).mockReset();
  });

  it("should return default export", async () => {
    vi.mocked(resolveFrom).mockReturnValue(fileA);

    await expect(loadModule(name, [dir])).resolves.toEqual(loader);
    expect(silent).toHaveBeenCalledWith(dir, name);
    expect(resolveFrom).toHaveBeenCalledWith(process.cwd(), name);
  });

  it("should return named export", async () => {
    vi.mocked(resolveFrom).mockReturnValue(fileB);

    await expect(loadModule(name, [dir])).resolves.toEqual({
      named: loader,
    });
    expect(silent).toHaveBeenCalledWith(dir, name);
    expect(resolveFrom).toHaveBeenCalledWith(process.cwd(), name);
  });
});
