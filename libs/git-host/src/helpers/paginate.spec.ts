import { paginate } from "src/helpers/paginate";

describe("paginate", () => {
  it("should return paginated items", async () => {
    const mockFn = vi
      .fn()
      .mockResolvedValueOnce({
        items: Array.from({ length: 10 }).fill(0),
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        items: Array.from({ length: 5 }).fill(0),
        hasNextPage: false,
      });

    const result = await paginate(mockFn);

    expect(result.length).toBe(15);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenNthCalledWith(1, 1);
    expect(mockFn).toHaveBeenNthCalledWith(2, 2);
  });
});
