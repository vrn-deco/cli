<div align="center">

<a href="https://github.com/vrn-deco/cli">
<img src="./docs/images/cli-logo.png" width="600" alt="vrn-cli" />
</a>

![GitHub Actions Status](https://github.com/vrn-deco/cli/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/vrn-deco/cli/branch/master/graph/badge.svg?token=9PA5BCTSFB)](https://codecov.io/gh/vrn-deco/cli)
[![npm package](https://badgen.net/npm/v/@vrn-deco/cli)](https://www.npmjs.com/package/@vrn-deco/cli)
![GitHub language](https://img.shields.io/github/languages/top/vrn-deco/cli.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f49033.svg)](https://pnpm.io/)

[简体中文](./READM_zh.md)

</div>

<!-- > reference sindresorhus's [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) -->

## Quick Start

First you need to install `@vrn-deco/cli` globally

```sh
npm install -g @vrn-deco/cli
# or with yarn
yarn add --global @vrn-deco/cli
# or with pnpm
pnpm install -g @vrn-deco/cli
```

Next, use the `create` command, followed by the name of the directory you prefer

```sh
vrn create my-app
```

Create a project with the pre-defined `boilerplate-package` in a few simple command line interactions!

> Since the dependencies of services other than the ontology are dynamically managed, checks and incremental installations are performed during use

Of course, it is possible to use `npx` to execute commands directly without installation

```sh
npx @vrn-deco/cli create my-app
```

## Essentials

TODO

## Migration from v0.x

You or your team may be using the `v0.x` version and have deployed the corresponding `boilerplate` interface

If you want to migrate to `v1.x` or keep the `v0.x` version, see [Migration Guide](./docs/migration.md)

## Changelogs

[CHANGELOG.md](./packages/cli/CHANGELOG.md)

## License

[MIT](./LICENSE)
