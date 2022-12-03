import { expect, test } from 'vitest'

import { NPMPackage, installPackage, queryPackageInfo } from '../index.js'

test('Export right', () => {
  expect(queryPackageInfo).toBeDefined()
  expect(installPackage).toBeDefined()
  expect(NPMPackage).toBeDefined()
})
