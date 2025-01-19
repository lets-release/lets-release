export function extractErrors(error: unknown) {
  return error instanceof AggregateError ? [...error.errors] : [error];
}
