import { queryPackageInfo, installPackage, NPMPackage } from '../index.js'

test('Export right', () => {
  expect(queryPackageInfo).toBeDefined()
  expect(installPackage).toBeDefined()
  expect(NPMPackage).toBeDefined()
})
