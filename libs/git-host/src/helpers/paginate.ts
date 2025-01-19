export async function paginate<T>(
  fn: (page: number) => Promise<{ items: T[]; hasNextPage: boolean }>,
): Promise<T[]> {
  const all: T[] = [];

  let page = 1;

  while (true) {
    const { items, hasNextPage } = await fn(page);

    all.push(...items);

    if (!hasNextPage) {
      break;
    }

    page += 1;
  }

  return all;
}
