// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function separator(idx: number, array: Array<any>): string {
  return idx === array.length - 1 ? ' oder ' : ', '
}
