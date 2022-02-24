[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f49033.svg)](https://pnpm.io/)

> reference sindresorhus's [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)

## 快速入门

首先需要全局安装 `@vrn-deco/cli`:

```sh
npm install -g @vrn-deco/cli
# or with yarn
yarn add --global @vrn-deco/cli
# or with pnpm
pnpm install -g @vrn-deco/cli
```

同样也支持使用 `npx` 直接执行命令

```sh
npx @vrn-deco/cli <command> [options]
```

然后运行下面的命令：

```sh
vrn create my-app
```

通过简单的几步命令行交互，即可使用预设的 `boilerplate-package` 创建一个项目!

> 由于除本体外其它服务的依赖包是动态管理的，在此过程中会进行依赖包的按需安装

## 详细说明

## V0 版本迁移指南

你的团队可能在使用 `v0.x` ，`v1.x` 产生了一些 `BREAKING CHANGE`，这些变动主要在 `boilerplate command` 上

从 `v1.0.0` 开始 `boilerplate manifest` 采用 `@vrn-deco/boilerplate-protocol` 规范，查看 [vrn-boilerplate 仓库](https://github.com/vrn-deco/boilerplate)

新的 `boilerplate command` 支持三种模式：

- `package`: （默认）通过 `manifest package` 获取 `boilerplate package` 来创建
- `http`: 类似于 `v0.x` 中的第二步，通过 HTTP 下载 `boilerplate.tgz` 进行解压创建
- `git`: 通过 `git clone` 一个仓库来创建，暂不支持 monorepo

建议使用 `package` 模式，同样你可以创建自己的 `manifest package` 来替换默认的 `@vrn-deco/boilerplate-manifest` 实现，参照 `@vrn-deco/boilerplate-protocol` 规范

如果你想继续使用 `http` 模式，可以参阅非交互式创建部分

如果你想保持在 `v0.x`，请确保更新到 `v0.3.4`，它被标记为 `legacy`，该版本禁用了自动更新检查以防止更新到 `v1.x`

```sh
npm install -g @vrn-deco/cli@legacy
```

## 更新日志

[CHANGELOG.md](./packages/cli/CHANGELOG.md)

## License

[MIT](./LICENSE)
