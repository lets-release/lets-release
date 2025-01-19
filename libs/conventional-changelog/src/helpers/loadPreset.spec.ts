import conventionalChangelogConventionalCommits from "conventional-changelog-conventionalcommits";

import { loadModule } from "@lets-release/config";

import { ConventionalChangelogPreset } from "src/enums/ConventionalChangelogPreset";
import { loadPreset } from "src/helpers/loadPreset";

vi.mock("conventional-changelog-conventionalcommits");
vi.mock("@lets-release/config");

const loadedPreset = {
  parser: {
    a: 1,
  },
  writer: {
    b: 2,
  },
};
const loader = vi.fn().mockResolvedValue(loadedPreset);

vi.mocked(conventionalChangelogConventionalCommits).mockImplementation(loader);

const cwd = "cwd";
const preset = ConventionalChangelogPreset.Angular;
const presetPackage = `conventional-changelog-${preset.toLowerCase()}`;
const presetConfig = {
  test: "test",
};
const config = "config";
const parserOptions = {
  commentChar: "#",
};
const writerOptions = { reverse: true };

describe("loadPreset", () => {
  beforeEach(() => {
    loader.mockClear();
    vi.mocked(loadModule).mockReset().mockResolvedValue(loader);
  });

  it("should load preset from config module", async () => {
    await expect(
      loadPreset({ presetConfig, config, parserOptions, writerOptions }, [cwd]),
    ).resolves.toEqual({
      parser: { ...loadedPreset.parser, ...parserOptions },
      writer: { ...loadedPreset.writer, ...writerOptions },
    });
    expect(loader).toHaveBeenCalledOnce();
    expect(loadModule).toHaveBeenCalledWith(config, [cwd], process.cwd());
  });

  it("should load preset from conventional changelog preset module", async () => {
    await expect(
      loadPreset({ preset, presetConfig, parserOptions, writerOptions }, [cwd]),
    ).resolves.toEqual({
      parser: { ...loadedPreset.parser, ...parserOptions },
      writer: { ...loadedPreset.writer, ...writerOptions },
    });
    expect(loader).toHaveBeenCalledWith(presetConfig);
    expect(loadModule).toHaveBeenCalledWith(
      presetPackage,
      [cwd],
      process.cwd(),
    );
  });

  it("should load default ConventionalCommits preset", async () => {
    await expect(loadPreset({ presetConfig })).resolves.toEqual(loadedPreset);
    expect(loader).toHaveBeenCalledWith(presetConfig);
  });

  it("should throw error if failed to load module", async () => {
    vi.mocked(loadModule).mockRejectedValue(new Error("Not found"));

    await expect(
      loadPreset({ preset, presetConfig, parserOptions, writerOptions }, [cwd]),
    ).rejects.toThrowError();
    expect(loadModule).toHaveBeenCalledWith(
      presetPackage,
      [cwd],
      process.cwd(),
    );
  });

  it("should fallback to local module if failed to load ConventionalCommits preset", async () => {
    vi.mocked(loadModule).mockRejectedValue(new Error("Not found"));

    await expect(
      loadPreset(
        {
          preset: ConventionalChangelogPreset.ConventionalCommits,
          presetConfig,
          parserOptions,
          writerOptions,
        },
        [cwd],
      ),
    ).resolves.toEqual({
      parser: { ...loadedPreset.parser, ...parserOptions },
      writer: { ...loadedPreset.writer, ...writerOptions },
    });
    await expect(
      loadPreset(
        {
          presetConfig,
          parserOptions,
          writerOptions,
        },
        [cwd],
      ),
    ).resolves.toEqual({
      parser: { ...loadedPreset.parser, ...parserOptions },
      writer: { ...loadedPreset.writer, ...writerOptions },
    });
    expect(loader).toHaveBeenNthCalledWith(1, presetConfig);
    expect(loader).toHaveBeenNthCalledWith(2, presetConfig);
    expect(loadModule).toHaveBeenNthCalledWith(
      1,
      "conventional-changelog-conventionalcommits",
      [cwd],
      process.cwd(),
    );
    expect(loadModule).toHaveBeenNthCalledWith(
      2,
      "conventional-changelog-conventionalcommits",
      [cwd],
      process.cwd(),
    );
  });
});
