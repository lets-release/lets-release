import { handleByChunks } from "src/helpers/handleByChunks";

// eslint-disable-next-line @typescript-eslint/require-await
const handler = async (chunk: number[]) => chunk.map((x) => x * 2);

describe("handleByChunks", () => {
  it("should handle an empty array", async () => {
    const items: number[] = [];
    const chunkSize = 2;

    const result = await handleByChunks(items, chunkSize, handler);

    expect(result).toEqual([]);
  });

  it("should handle an array with one chunk", async () => {
    const items = [1, 2];
    const chunkSize = 2;

    const result = await handleByChunks(items, chunkSize, handler);

    expect(result).toEqual([2, 4]);
  });

  it("should handle an array with multiple chunks", async () => {
    const items = [1, 2, 3, 4, 5];
    const chunkSize = 2;

    const result = await handleByChunks(items, chunkSize, handler);

    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  it("should handle an array where the chunk size is larger than the array length", async () => {
    const items = [1, 2, 3];
    const chunkSize = 5;

    const result = await handleByChunks(items, chunkSize, handler);

    expect(result).toEqual([2, 4, 6]);
  });

  it("should handle an array where the chunk size is equal to the array length", async () => {
    const items = [1, 2, 3];
    const chunkSize = 3;

    const result = await handleByChunks(items, chunkSize, handler);

    expect(result).toEqual([2, 4, 6]);
  });
});
