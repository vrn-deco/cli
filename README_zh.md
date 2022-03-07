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

[English](./READM.md)

</div>

<!-- > reference sindresorhus's [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) -->

## 快速入门

首先你需要全局安装 `@vrn-deco/cli`：

```sh
npm install -g @vrn-deco/cli
# or with yarn
yarn add --global @vrn-deco/cli
# or with pnpm
pnpm install -g @vrn-deco/cli
```

接下来使用 `create` 命令，后面跟上喜欢的目录名

```sh
vrn create my-app
```

通过简单的几步命令行交互，即可使用预设的 `boilerplate-package` 创建一个项目!

> 由于除本体外其他服务的依赖是动态管理的，因此在使用过程中会进行检查和增量安装

当然，在未安装时使用`npx`来直接执行命令也是可以的

```sh
npx @vrn-deco/cli create my-app
```

## 详细说明

TODO

## 从 v0.x 迁移

你或团队可能正在使用 `v0.x` 版本，并且部署了相应的 `boilerplate` 接口

如果您想迁移到 `v1.x` 或保留 `v0.x` 版本，请参阅 [迁移指南](./docs/migration_zh.md)

## 更新日志

[CHANGELOG.md](./CHANGELOG.md)

## License

[MIT](./LICENSE)
