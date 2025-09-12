export function uniq(array: any[], key: string): any[] {
  return [...new Map(array.map(item => [item[key], item])).values()];
}

export function sortAlphabetically(array: any[], key: string): any[] {
  return array.sort((a, b) => a[key].localeCompare(b[key]));
}
