export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function isNull(value: any): value is null {
  return value === null;
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isNumberFinite(value: any): value is number {
  return isNumber(value) && isFinite(value);
}

// Not strict positive
export function isPositive(value: number): boolean {
  return value >= 0;
}

export function isInteger(value: number): boolean {
  // No rest, is an integer
  return value % 1 === 0;
}

export function isNil(value: any): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object';
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function isFunction(value: any): boolean {
  return typeof value === 'function';
}