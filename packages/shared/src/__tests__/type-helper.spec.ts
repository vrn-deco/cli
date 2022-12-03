/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, it } from 'vitest'

import {
  isArray,
  isAsyncFunction,
  isBigInt,
  isBoolean,
  isEmptyString,
  isFunction,
  isInt,
  isMap,
  isNull,
  isNumber,
  isObject,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isUndefined,
  isUndefinedOrNull,
} from '../type-helper.js'

describe.concurrent('@vrn-deco/cli-shared -> type-helper.ts', () => {
  it('check a number', () => {
    expect(isNumber(1)).toBe(true)
    expect(isNumber(1.1)).toBe(true)
    expect(isNumber(NaN)).toBe(true)
    expect(isNumber('1')).toBe(false)
    expect(isNumber(null)).toBe(false)
    expect(isNumber(undefined)).toBe(false)
    expect(isNumber(true)).toBe(false)
  })

  it('check an integer', () => {
    expect(isInt(1)).toBe(true)
    expect(isInt(1.1)).toBe(false)
    expect(isInt(NaN)).toBe(false)
    expect(isInt('1')).toBe(false)
    expect(isInt(null)).toBe(false)
    expect(isInt(undefined)).toBe(false)
    expect(isInt(true)).toBe(false)
  })

  it('check a string', () => {
    expect(isString('hello')).toBe(true)
    expect(isString('')).toBe(true)
    expect(isString(1)).toBe(false)
    expect(isString(1.1)).toBe(false)
    expect(isString(NaN)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString(true)).toBe(false)
  })

  it('check an empty string', () => {
    expect(isEmptyString('')).toBe(true)
    expect(isEmptyString(' ')).toBe(true)
    expect(isEmptyString(' \n')).toBe(true)
    expect(isEmptyString('hello')).toBe(false)
    expect(isEmptyString(1)).toBe(false)
    expect(isEmptyString(1.1)).toBe(false)
    expect(isEmptyString(NaN)).toBe(false)
    expect(isEmptyString(null)).toBe(false)
    expect(isEmptyString(undefined)).toBe(false)
    expect(isEmptyString(true)).toBe(false)
  })

  it('check a boolean', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)
    expect(isBoolean(1)).toBe(false)
    expect(isBoolean(1.1)).toBe(false)
    expect(isBoolean(NaN)).toBe(false)
    expect(isBoolean('')).toBe(false)
    expect(isBoolean(null)).toBe(false)
    expect(isBoolean(undefined)).toBe(false)
  })

  it('check an undefined', () => {
    expect(isUndefined(undefined)).toBe(true)
    expect(isUndefined(null)).toBe(false)
    expect(isUndefined(1)).toBe(false)
    expect(isUndefined(1.1)).toBe(false)
    expect(isUndefined('')).toBe(false)
    expect(isUndefined(true)).toBe(false)
  })

  it('check a null', () => {
    expect(isNull(null)).toBe(true)
    expect(isNull(undefined)).toBe(false)
    expect(isNull(1)).toBe(false)
    expect(isNull(1.1)).toBe(false)
    expect(isNull('')).toBe(false)
    expect(isNull(true)).toBe(false)
  })

  it('check an undefined or null', () => {
    expect(isUndefinedOrNull(undefined)).toBe(true)
    expect(isUndefinedOrNull(null)).toBe(true)
    expect(isUndefinedOrNull(1)).toBe(false)
    expect(isUndefinedOrNull(1.1)).toBe(false)
    expect(isUndefinedOrNull('')).toBe(false)
    expect(isUndefinedOrNull(true)).toBe(false)
  })

  it('check a symbol', () => {
    expect(isSymbol(Symbol())).toBe(true)
    expect(isSymbol(1)).toBe(false)
    expect(isSymbol(1.1)).toBe(false)
    expect(isSymbol(NaN)).toBe(false)
    expect(isSymbol('')).toBe(false)
    expect(isSymbol(null)).toBe(false)
    expect(isSymbol(undefined)).toBe(false)
    expect(isSymbol(true)).toBe(false)
  })

  it('check a big int', () => {
    expect(isBigInt(BigInt(1))).toBe(true)
    expect(isBigInt(1n)).toBe(true)
    expect(isBigInt(1)).toBe(false)
    expect(isBigInt(1.1)).toBe(false)
    expect(isBigInt(NaN)).toBe(false)
    expect(isBigInt('')).toBe(false)
    expect(isBigInt(null)).toBe(false)
    expect(isBigInt(undefined)).toBe(false)
    expect(isBigInt(true)).toBe(false)
  })

  it('check a regexp', () => {
    expect(isRegExp(/a/)).toBe(true)
    expect(isRegExp(1)).toBe(false)
    expect(isRegExp(1.1)).toBe(false)
    expect(isRegExp(NaN)).toBe(false)
    expect(isRegExp('')).toBe(false)
    expect(isRegExp(null)).toBe(false)
    expect(isRegExp(undefined)).toBe(false)
    expect(isRegExp(true)).toBe(false)
  })

  it('check an object', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject(1)).toBe(false)
    expect(isObject(1.1)).toBe(false)
    expect(isObject(NaN)).toBe(false)
    expect(isObject('')).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject(true)).toBe(false)
  })

  it('check an array', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
  })

  it('check a set', () => {
    expect(isSet(new Set())).toBe(true)
    expect(isSet([])).toBe(false)
    expect(isSet({})).toBe(false)
  })

  it('check a map', () => {
    expect(isMap(new Map())).toBe(true)
    expect(isMap([])).toBe(false)
    expect(isMap({})).toBe(false)
  })

  it('check a function', () => {
    expect(isFunction(() => {})).toBe(true)
    expect(isFunction(() => 1)).toBe(true)
    expect(isFunction(console.log)).toBe(true)
    expect(isFunction(Promise)).toBe(true)
  })

  it('check an async function', () => {
    expect(isAsyncFunction(async () => {})).toBe(true)
    expect(isAsyncFunction(() => {})).toBe(false)
  })
})
