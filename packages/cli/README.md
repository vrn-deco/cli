<div align="center">

<a href="https://github.com/vrn-deco/cli">
<img src="../../docs/images/cli-logo.png" width="600" alt="vrn-cli" />
</a>

![GitHub Actions Status](https://github.com/vrn-deco/cli/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/vrn-deco/cli/branch/main/graph/badge.svg?token=9PA5BCTSFB)](https://codecov.io/gh/vrn-deco/cli)
[![npm package](https://badgen.net/npm/v/@vrn-deco/cli)](https://www.npmjs.com/package/@vrn-deco/cli)
![GitHub language](https://img.shields.io/github/languages/top/vrn-deco/cli.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-f49033.svg)](https://pnpm.io/)

</div>

`@vrn-deco/cli` is an automated command line tool whose core feature is to help you quickly build an engineered project via `boilerplate`. It supports multiple creation modes, you can get `boilerplate` from the sources we provide, or you can specify a third party or your own source.

> ⚠️ Please make sure your **Node.js version >=18.0.0**

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

## Advanced Guide

See [vrn-deco/cli repository](https://github.com/vrn-deco/cli)
