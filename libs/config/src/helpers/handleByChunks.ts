/**
 * In order to speed up a function call that handles a big array of items, we split up the
 * array in chunks and call the function for each chunk in parallel. At the end we combine the
 * results again.
 */
export async function handleByChunks<T, U>(
  items: T[],
  chunkSize: number,
  handler: (item: T[]) => Promise<U[]>,
): Promise<U[]> {
  const chunkCalls = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunkCalls.push(handler(items.slice(i, i + chunkSize)));
  }

  const results = await Promise.all(chunkCalls);

  return results.flat();
}
