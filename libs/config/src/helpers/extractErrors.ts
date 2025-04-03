export function extractErrors(error: unknown) {
  return error instanceof AggregateError
    ? [...(error.errors as unknown[])]
    : [error];
}
