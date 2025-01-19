export function getRange(min: string, max?: string) {
  return `>=${min}${max ? ` <${max}` : ""}`;
}
