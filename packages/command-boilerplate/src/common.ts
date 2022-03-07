export enum Mode {
  Package = 'package',
  Http = 'http',
  Git = 'git',
}

export type ModeOptions = {
  mode: Mode
}

// handle original records after Git Clone
export enum PostGit {
  // do nothing
  Retain = 'retain',
  // rm -rf .git
  Remove = 'remove',
  // rm -rf .git && git init && git add . && git commit -m "chore: init repository"
  Rebuild = 'rebuild',
}

export const CACHE_DIR_NAME = 'boilerplate'
export const DEFAULT_MANIFEST_PACKAGE = '@vrn-deco/boilerplate-manifest'
export const DEFAULT_API_BASE_URL = 'https://vrndeco.cn/boilerplate'
