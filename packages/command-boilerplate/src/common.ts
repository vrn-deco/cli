export enum Mode {
  Package = 'package',
  Http = 'http',
  Git = 'git',
}

export type ModeOptions = {
  mode: Mode
}

export const CACHE_DIR_NAME = 'boilerplate'
export const DEFAULT_MANIFEST_PACKAGE = '@vrn-deco/boilerplate-manifest'
export const DEFAULT_API_BASE_URL = 'https://boilerplate.vrndeco.cn'
