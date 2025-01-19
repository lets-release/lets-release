export type PartialOptional<T, K extends keyof T> = Partial<Pick<T, K>> &
  Omit<T, K>;
