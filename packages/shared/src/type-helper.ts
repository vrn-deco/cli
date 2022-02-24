/*
 * @Author: Cphayim
 * @Date: 2021-06-26 01:33:57
 * @Description: type helpers
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

const getType = (o: unknown): string => Object.prototype.toString.call(o).slice(8, -1)

export const isObject = (o: unknown): o is Record<any, any> => getType(o) === 'Object'

export const isArray = Array.isArray

export const isSet = (o: unknown): o is Set<any> => getType(o) === 'Set'

export const isMap = (o: unknown): o is Map<any, any> => getType(o) === 'Map'

export const isFunction = (o: unknown): o is (...args: never) => unknown => getType(o) === 'Function'

export const isAsyncFunction = (o: unknown): o is (...args: never) => Promise<unknown> => getType(o) === 'AsyncFunction'

export const isNumber = (o: unknown): o is number => getType(o) === 'Number'

export const isInt = (o: unknown): o is number => isNumber(o) && Math.floor(o) === o

export const isString = (o: unknown): o is string => getType(o) === 'String'

export const isEmptyString = (o: unknown): o is string => isString(o) && o.trim().length === 0

export const isBoolean = (o: unknown): o is boolean => getType(o) === 'Boolean'

export const isUndefined = (o: unknown): o is undefined => getType(o) === 'Undefined'

export const isNull = (o: unknown): o is null => getType(o) === 'Null'

export const isUndefinedOrNull = (o: unknown): o is undefined | null => isUndefined(o) || isNull(o)

export const isSymbol = (o: unknown): o is symbol => getType(o) === 'Symbol'

export const isBigInt = (o: unknown): o is bigint => getType(o) === 'BigInt'

export const isRegExp = (o: unknown): o is RegExp => getType(o) === 'RegExp'
