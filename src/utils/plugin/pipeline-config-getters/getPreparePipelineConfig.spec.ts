import { BaseContext, Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getHeadHash } from "src/utils/git/getHeadHash";
import { getPreparePipelineConfig } from "src/utils/plugin/pipeline-config-getters/getPreparePipelineConfig";

vi.mock("src/utils/git/getHeadHash");

const hash = "123abc";

vi.mocked(getHeadHash).mockResolvedValue(hash);

describe("getPreparePipelineConfig", () => {
  it("should return prepare pipeline config", async () => {
    const config = getPreparePipelineConfig(
      { generateNotes: async () => undefined },
      {} as BaseContext["logger"],
    );

    expect(config).toEqual({
      getNextContext: expect.any(Function),
    });

    await expect(
      config.getNextContext!({
        cwd: "cwd",
        nextRelease: {
          hash: "hash",
          notes: "notes",
        },
      } as NormalizedStepContext<Step.prepare>),
    ).resolves.toEqual({
      cwd: "cwd",
      nextRelease: {
        hash,
        notes: "notes",
      },
    });

    await expect(
      config.getNextContext!({
        cwd: "cwd",
        nextRelease: {
          hash,
          notes: "notes",
        },
      } as NormalizedStepContext<Step.prepare>),
    ).resolves.toEqual({
      cwd: "cwd",
      nextRelease: {
        hash,
        notes: "notes",
      },
    });
  });
});
