/*
 * @Author: Cphayim
 * @Date: 2021-06-26 01:33:57
 * @Description: 类型辅助函数
 */

function getType(o: unknown): string {
  return Object.prototype.toString.call(o).slice(8, -1)
}

export function isObject<T extends Record<string, unknown>>(o: unknown): o is T {
  return getType(o) === 'Object'
}

export function isArray<T>(o: unknown): o is T {
  return getType(o) === 'Array'
}

export function isSet<T>(o: unknown): o is Set<T> {
  return getType(o) === 'Set'
}

export function isMap<K, V>(o: unknown): o is Map<K, V> {
  return getType(o) === 'Map'
}

export function isFunction<T extends (...args: never) => unknown>(o: unknown): o is T {
  return getType(o) === 'Function'
}

export function isAsyncFunction<T extends (...args: never) => Promise<unknown>>(o: unknown): o is T {
  return getType(o) === 'AsyncFunction'
}

export function isNumber(o: unknown): o is number {
  return getType(o) === 'Number'
}
export function isInt(o: unknown): o is number {
  return isNumber(o) && Math.floor(o) === o
}

export function isString(o: unknown): o is string {
  return getType(o) === 'String'
}

export function isEmptyString(o: unknown): o is string {
  return isString(o) && o.length === 0
}

export function isBoolean(o: unknown): o is boolean {
  return getType(o) === 'Boolean'
}

export function isUndefined(o: unknown): o is undefined {
  return getType(o) === 'Undefined'
}

export function isNull(o: unknown): o is null {
  return getType(o) === 'Null'
}

export function isUndefinedOrNull(o: unknown): o is undefined | null {
  return isUndefined(o) || isNull(o)
}

export function isSymbol(o: unknown): o is symbol {
  return getType(o) === 'Symbol'
}

export function isBigInt(o: unknown): o is bigint {
  return getType(o) === 'BigInt'
}

export function isRegExp(o: unknown): o is RegExp {
  return getType(o) === 'RegExp'
}
