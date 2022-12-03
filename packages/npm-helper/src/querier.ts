/*
 * @Author: Cphayim
 * @Date: 2021-06-18 09:48:23
 * @Description: package query
 */
import fetch from 'node-fetch'

import { NPMRegistry } from '@vrn-deco/cli-shared'

import { DistTag } from './common.js'

type PackageQueryInfo = {
  error: string
  name: string
  'dist-tags': { [P in DistTag]: string }
}

export async function queryPackageInfo(name: string, registry: string = NPMRegistry.NPM): Promise<PackageQueryInfo> {
  const response = await fetch(`${registry}/${name}`)
  const data = (await response.json()) as PackageQueryInfo
  if (data.error) {
    throw new Error(`NPMQuery failed: package ${name} ${data.error}`)
  }
  return data
}

export async function queryPackageVersion(name: string, tag = DistTag.Latest, registry?: string): Promise<string> {
  const info = await queryPackageInfo(name, registry)
  return info['dist-tags'][tag]
}

export async function queryPackageLatestVersion(name: string, registry?: string): Promise<string> {
  return queryPackageVersion(name, DistTag.Latest, registry)
}

export async function queryPackageNextVersion(name: string, registry?: string): Promise<string> {
  return queryPackageVersion(name, DistTag.Next, registry)
}

export async function queryPackageLegacyVersion(name: string, registry?: string): Promise<string> {
  return queryPackageVersion(name, DistTag.Legacy, registry)
}
