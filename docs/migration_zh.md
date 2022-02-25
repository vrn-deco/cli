# v0.x 迁移指南

你或团队可能正在使用 `v0.x`，`v1.x` 产生了一些 `BREAKING CHANGE`，这些变动主要在 `boilerplate command` 上

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
