<div align="center">

<a href="https://github.com/vrn-deco/cli">
<img src="./docs/images/cli-logo.png" width="600" alt="vrn-cli" />
</a>

![GitHub Actions Status](https://github.com/vrn-deco/cli/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/vrn-deco/cli/branch/main/graph/badge.svg?token=9PA5BCTSFB)](https://codecov.io/gh/vrn-deco/cli)
[![npm package](https://badgen.net/npm/v/@vrn-deco/cli)](https://www.npmjs.com/package/@vrn-deco/cli)
![GitHub language](https://img.shields.io/github/languages/top/vrn-deco/cli.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f49033.svg)](https://pnpm.io/)

[English](./READM.md)

</div>

`@vrn-deco/cli`是一个自动化命令行工具，核心功能是通过 `boilerplate` 来帮助您快速搭建一个工程化项目。它支持多种创建模式，您可以从我们提供的来源获取 `boilerplate`，也可以指定第三方或您自己的来源。

> ⚠️ 请确保您的 **Node.js 版本 >=18.0.0**

## 快速入门

如果您第一次使用，推荐通过 `npm create` 来快速创建，无需将 CLI 安装到全局

![create-demo-gif](https://cdn.jsdelivr.net/gh/cphayim/oss@main/images/2022/04/23/233707mdKhKf.gif)

```sh
# npm
npm create vrn@latest
# yarn
yarn create vrn
# pnpm
pnpm create vrn
```

然后按照提示操作，即可使用预设的 `boilerplate-package` 创建一个项目!

### 安装 CLI

如果您需要经常使用，或打算学习后续的进阶指南，那么请将 `@vrn-deco/cli` 安装到全局

```sh
# npm
npm install -g @vrn-deco/cli
# yarn
yarn add --global @vrn-deco/cli
# pnpm
pnpm install -g @vrn-deco/cli
```

让我们再创建一个项目，这次通过执行 `vrn create` 命令

```sh
vrn create my-app
```

同样按照提示操作，完成项目的创建

> 由于除本体外其他服务的依赖是动态管理的，因此在使用过程中会进行检查和增量安装

## 进阶指南

以下为进阶内容，阅读它您将了解：

- 全局配置 `vrn config` 命令

  - 开启或关闭更新检查
  - 切换 NPM 源
  - 切换包管理器

- Boilerplate 服务 `vrn boi` 命令
  - Package 创建模式
    - 交互式和非交互式
    - 自定义 `manifest-package`
  - HTTP 创建模式
    - 交互式和非交互式
    - 自定义 `api-url`
  - Git 创建模式
    - `post-git` 后处理
  - List 列出可用的包

### Config 命令

`config` 是用于管理 CLI 全局配置的命令，通过以下命令进入交互模式：

```sh
# 交互式查看配置项或修改它们
vrn config
```

CLI 将以列表形式展示所有可更改的配置项及当前值，您可以通过选择其中一项配置来修改它

#### 更新检查

`checkUpdateEnabled`: `boolean` (default: `true`)

在命令调度前执行更新检查，如果存在新版本，将在终端输出一条提示日志，它不会影响后续的程序执行，默认检查周期为 1 天

您可以设置 `checkUpdateEnabled: false` 来禁用更新检查

#### NPM 源

`npmRegistry`: `string` (default: `'https://registry.npmmirror.com'`)

CLI 使用的 NPM 源，版本更新检查和后续的增量依赖安装均从这里获取

提供了两个预设值：

- `NPM`: `https://registry.npmjs.org`
- `TAOBAO`: `https://registry.npmmirror.com`

为便于国内用户访问，默认为 `TAOBAO` 源，您可以将其修改为 `NPM` 源或自定义源（自行确保可访问性）

> 值得注意的是，该项仅影响 CLI 使用的 NPM 源，不会修改 NPM 的全局设置

#### 包管理器

`packageManager`: `'npm' | 'yarn' | 'pnpm'` (default: `'npm'`)

CLI 使用的包管理器，后续的增量依赖均会使用指定的包管理器进行操作

支持目前三个主流的包管理器：`npm`、`yarn`、`pnpm`，可以将其指定为您常用的包管理器（除 `npm` 外，需自行全局安装）

> 由于不同包管理器安装的依赖目录结构和生成的锁文件不同，请勿频繁切换此配置

### Boilerplate 命令

该命令提供 `boilerplate` 相关的服务，其实现遵循 [@vrn-deco/boilerplate-protocol](https://github.com/vrn-deco/boilerplate/tree/main/protocol) 规范

因 `boilrplate` 实在是太长了，我们为它定义了一个较短的别名 `boi`

通过 `-h` 选项查看帮助：

```sh
vrn boi -h
# 等同于
vrn boilerplate -h
```

核心功能是 `boi create` 子命令，同样可以通过 `-h` 选项查看帮助：

```sh
vrn boi create -h
```

也许您想起了“快速入门”中的例子，没错，`create` 是 `boi create`的简化别名

```sh
vrn create my-app
# 等同于
vrn boi create my-app
```

上面这个命令将使用 `package` 模式执行一次交互式创建！什么是 `package` 模式？现在就来了解它！

#### Creation Mode

根据 [@vrn-deco/boilerplate-protocol](https://github.com/vrn-deco/boilerplate/tree/main/protocol) 规范，我们提供了 `package`模式的创建，另外附加了两种模式：`http` 和 `git`

模式意味着 `boilerplate` 是通过何种方式提供的，以下是三种模式的特点：

- `package`：通过 npm package 来提供 boilerplate，这种 package 我们称之为 `boi-package`
  - 通过一个 `manifest-package` 来发布所有可用的 `boi-package`
  - `manifest-package` 和 `boi-package` 都属于动态依赖，是增量安装的
  - `boilerplate` 本身存放在 `boi-package` 中
  - `boi-package` 负责对自己的 `boilerplate` 进行描述和安装
  - 支持自定义脚本 hooks，更加灵活，且功能强大
- `http`：将 `boilerplate` 打包压缩（通常是 `.tgz`），我们称之为 `packed-boi `，之后通过服务端接口或 CDN 分发
  - 通过一个接口或 `manifest.json` 文件来描述所有可用的 `packed-boi`
  - 由 CLI 进行解压安装，只支持特定的压缩格式
  - 速度最快，但不支持对 `boilerplate` 内部的额外操作
- `git`：`git clone` 一个现有的仓库
  - 支持任意的来源和后处理

#### Package 模式创建

`package` 模式支持交互式和非交互式创建

##### 交互式创建

CLI 会询问各种所需的参数，并且向您展示所有可用的 `boi-package`，从中选择一个完成创建

```sh
# 默认情况下，您只需要传入一个参数 <folder_name>
vrn boi create my-app

# 如果您在 Monorepo 中，可以传入第二个参数 [base_directory]
vrn boi create my-app ./packages
```

默认所有可选的 `boi-package` 都是通过 `@vrn-deco/boilerplate-manifest` 包提供的，如果您想使用自己的 `manifest-package` 来提供 `boi-package`，可以使用 `--manifest-package` 选项指定

```sh
# 通过 @your-scope/your-manifest-package 来获取可用的 `boi-package`
vrn boi create my-app --manifest-package @your-scope/your-manifest-package
```

##### 非交互式创建

也许您想通过脚本来创建，或者使“创建”成为自动化任务中的一环，那么您应该使用非交互式创建，它将直接完成创建或失败

> 可以在 shell 脚本或 Node.js child_process 中调用该命令

```sh
vrn boi create my-app --yes \
   --name=my-app --version=1.0.0 --author=cphayim \
   --target @vrn-deco/boilerplate-javascript-vue # 仅举例，此包不一定存在
```

这几个选项都是必须的：

- `--yes`：非交互式
- `--name`: 项目名称
- `--version`：版本号
- `--author`：作者
- `--target, --target-boilerplate`：指定 `boi-package`
  - 必须是完整包名
  - 必须符合 [@vrn-deco/boilerplate-protocol](https://github.com/vrn-deco/boilerplate/tree/main/protocol#boilerplate-packages) 中对于 `boi-package` 的定义
  - 不会验证 `target` 是否在 `manifest` 中

Node.js 调用例子

```js
await execaCommand(
  `
  vrn create ${PROJECT_NAME} --yes \
    --name=${PROJECT_NAME} --version=${PROJECT_VERSION} \
    --author=${execaCommandSync('git config --global user.name').stdout}
    --target @vrn-deco/boilerplate-typescript-vue3-varlet-h5plus
`,
  {
    stdio: 'inherit',
    cwd: process.cwd(),
  },
)
```

#### HTTP 模式创建

> `http` 模式的存在是对特定场景的补充，我们仍然推荐您使用 `package` 模式

`http` 模式同样支持交互式与非交互式创建

##### 交互式创建

```sh
# 您需要传入 `--mode=http` 来启用它, 因为 `package` 模式是默认的
vrn boi create my-app --mode=http

# 如果您在 Monorepo 中，可以传入第二个参数 [base_directory]
vrn boi create my-app ./packages --mode=http
```

默认所有可选的 `packed-boi` 都是通过 `https://vrndeco.cn/boilerplate` 提供的，如果您想使用自己的接口来提供 `packed-boi`，可以使用 `--api-url` 选项指定请求的 BaseURL

```sh
vrn boi create my-app --mode=http --api-url=https://yoursite.com/boilerplate
```

##### 非交互式创建

```sh
vrn boi create my-app --mode=http --yes \
  --name=my-app --version=1.0.0 --author=cphayim \
  --target boilerplate-typescript-vue3-varlet.tgz
# 这里没有传递 `--api-url`，取默认值
# 它将下载 https://vrndeco.cn/boilerplate/boilerplate-typescript-vue3-varlet.tgz

vrn boi create my-app --mode=http --yes \
  --name=my-app --version=1.0.0 --author=cphayim \
  --target https://yoursite.com/boilerplate/boilerplate-typescript-vue3-varlet.tgz

# 等同于
vrn boi create myapp --mode=http --yes \
  --name=myapp --version=1.0.0 --author=cphayim \
  --api-url= https://yoursite.com/boilerplate \
  --target boilerplate-typescript-vue3-varlet.tgz
```

除了 `target` 选项的值以外，其它都和 `package` 模式一样：

- `--target, --target-boilerplate`：指定 `packed-boi` 文件名
  - 可以是文件名或完整 URL 路径
  - 不会验证 `target` 是否在接口返回的 `manifest` 中

#### Git 模式创建

> 请勿在 Monorepo 中使用 git 模式!

`git` 模式是通过 `clone` 某个存储库到本地来完成创建

```sh
# 您需要传入 `--mode=git` 来启用它，因为 `package` 模式是默认的
# `--target` 是存储库 url, 支持 `HTTPS` 和 `SSH`
vrn boi create my-app --mode=git --target=https://github.com/vrn-deco/xxx.git
vrn boi create my-app --mode=git --target=git@github.com:vrn-deco/xxx.git
```

您还可以通过 `--post-git` 来告诉 CLI，在克隆之后要如何处理原先的提交记录

- `--post-git`: (default: `'retain'`)
  - `retain`: 保留原记录
  - `remove`: 删除本地存储库
  - `rebuild`: 重建本地存储库

```sh
# keep origin record
vrn boi create my-app --mode=git --post-git=retain --target=git@github.com:vrn-deco/xxx.git
# rm -rf .git
vrn boi create my-app --mode=git --post-git=remove --target=git@github.com:vrn-deco/xxx.git
# rm -rf .git && git init && git add . && git commit -m "chore: init repository"
vrn boi create my-app --mode=git --post-git=rebuild --target=git@github.com:vrn-deco/xxx.git
```

#### List

使用 `boi list` 命令可以列出所有可用的 `boi-package`，可以使用别名 `boi ls`：

```sh
vrn boi ls
vrn boi ls --json # output json
vrn boi ls --json --out-file ./boilerplate.json # output json and write file
vrn boi ls --yaml	# output yaml
vrn boi ls --yaml --out-file ./boilerplate.yaml # output yaml and write file

# 列出 @your-scope/your-manifest-package 下所有的 `boi-package`
vrn boi ls --manifest-package @your-scope/your-manifest-package
```

> 需要注意的是，`list` 命令仅能列出 `package` 模式下可用的包，它不支持 `http` 和 `git` 模式

## 从 v0.x 迁移

您或团队可能正在使用 `v0.x` 版本，并且部署了相应的 `boilerplate` 接口

如果您想迁移到 `v1.x` 或保留 `v0.x` 版本，请参阅 [迁移指南](./docs/migration_zh.md)

## 更新日志

[CHANGELOG.md](./CHANGELOG.md)

## License

[MIT](./LICENSE)
