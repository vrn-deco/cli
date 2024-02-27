# @vrn-deco/cli

## 1.2.5

Update some dependencies ([#71](https://github.com/vrn-deco/cli/issues/71), [#72](https://github.com/vrn-deco/cli/issues/72), [#74](https://github.com/vrn-deco/cli/issues/74))

## 1.2.4

Update some dependencies ([#61](https://github.com/vrn-deco/cli/issues/61))

## 1.2.3

### Features:

Some unforeseen circumstances can lead to corrupted dependency files, now you can use `clean` to clean it

```
vrn boi clear
```

## 1.2.2

### Refactor:

- Supports calling without arguments for `create` ([#23](https://github.com/vrn-deco/cli/issues/23))

```sh
vrn create app

# Will ask for `folderName`
vrn create
```

Note that if you call with no arguments and pass the --yes option, you will get an error

## 1.2.1

### Refactor:

- Turn off the default `auto-install-dependencies` ([#19](https://github.com/vrn-deco/cli/issues/19), [#20](https://github.com/vrn-deco/cli/pull/20))
  - No longer pass autoinstall dependencies to `presetRunner` by default
  - Can manually enable it via the `-i` or `--auto-install-deps` options
- Prettify welcome logo of CLI ([#21](https://github.com/vrn-deco/cli/pull/21))

## 1.2.0

### Features:

- Implement the conventions of protocol v1.3.0 ([vrn-deco/boileerplate#109](https://github.com/vrn-deco/boilerplate/pull/109))
- Passing additional parameters when calling the `runner` ([#11](https://github.com/vrn-deco/cli/issues/11), [#12](https://github.com/vrn-deco/cli/pull/12))
  - In `package` mode will automatically install dependencies, disable with `-A` or `--no-auto-install-deps` option
  - In `package` mode will automatically initialize git, disable by specifying `--post-git remove`
- Implemented Lang and Boilerplate support for new protocols in interactive mode selection ([#11](https://github.com/vrn-deco/cli/issues/11), [#16](https://github.com/vrn-deco/cli/pull/16))
  - Highlight `recommended` and `deprecated`
  - Optimized `tags` display

## 1.1.3

### Bug Fixes:

- node:stream/promises compatibility on node 14 ([#6](https://github.com/vrn-deco/cli/issues/6))

## 1.1.2

Change welcome LOGO

## 1.1.1

### Bug Fixes:

- Dynamic import ESM error in Windows terminal ([#5](https://github.com/vrn-deco/cli/issues/5))

## 1.1.0

Two other creation modes from the [1.x Features](https://github.com/vrn-deco/cli/wiki/Features) concept are implemented

### Features:

- Implements the `http` creation mode

  - Support interactive and non-interactive creation
  - Support specify the `apiURL`

- Implements the `git` creation mode
  - Support `HTTPS` and `SSH`
  - Support handle original records after `git clone`

The `http` mode is similar to the `v0.x`, fetching the `manifest` data from a `manifest.json` interface, which contains all the optional `boilerplate` compressed files, selecting one of the `boilerplates` interactively based on the command line prompts, and then downloading and decompressing it

##### HTTP Mode creation

Interactive creation:

```sh
# You need to pass `--mode=http` to enable it, as 'package' mode is default
vrn boi create my-app --mode=http
# You can pass `--api-url` to specify the baseURL, default https://vrndeco.cn/boilerplate
vrn boi create my-app --mode=http --api-url=https://yoursite.com/boilerplate
```

Non-interactive creation:

```sh
# As with the `package` mode, you need to pass `--yes`, `--name`, `--version`, `--author`, `--target`
# here `--target` is packed file name, not the package name
# this means that it will download from the default `--api-url`
# https://vrndeco.cn/boilerplate/boilerplate-typescript-vue3-varlet.tgz
vrn boi create my-app --mode=http --yes \
  --name=my-app --version=1.0.0 --author=cphayim \
  --target boilerplate-typescript-vue3-varlet.tgz

# You can pass the full url directly to `—target`
vrn boi create my-app --mode=http --yes \
  --name=my-app --version=1.0.0 --author=cphayim \
  --target https://yoursite.com/boilerplate/boilerplate-typescript-vue3-varlet.tgz

# Equivalent to
vrn boi create my-app --mode=http --yes \
  --name=my-app --version=1.0.0 --author=cphayim \
  --api-url= https://yoursite.com/boilerplate \
  --target boilerplate-typescript-vue3-varlet.tgz
```

> The `http` mode exists to complement specific scenarios, we still recommend that you use the `package` mode.

##### Git Mode creation

The `git` mode is created by cloning the specified repository

```sh
# You need to pass `--mode=git` to enable it, as 'package' mode is default
# `--target` is repository url, support `HTTPS` and `SSH`
vrn boi create my-app --mode=git --target=https://github.com/vrn-deco/xxx.git
vrn boi create my-app --mode=git --target=git@github.com:vrn-deco/xxx.git
```

You can pass `--post-git` handle original records after `git clone`

```sh
# keep origin record
vrn boi create my-app --mode=git --post-git=retain --target=git@github.com:vrn-deco/xxx.git
# rm -rf .git
vrn boi create my-app --mode=git --post-git=remove --target=git@github.com:vrn-deco/xxx.git
# rm -rf .git && git init && git add . && git commit -m "chore: init repository"
vrn boi create my-app --mode=git --post-git=rebuild --target=git@github.com:vrn-deco/xxx.git
```

## 1.0.2

The `boi create` and `boi list` commands now support specifying manifest-package

### Features:

- `boi create` & `boi list` support specifying `--manifest-package`

```sh
# Interactive creation, pulling the manifest from `@your-scope/your-manifest-package`
vrn boi create my-app --manifest-package @your-scope/your-manifest-package

# Non-nteractive creation
# can specify a boilerplate that is not in the manifest as the target
# without specifying --manifest-package
vrn boi create my-app --yes \
    --name=my-app --version=1.0.0 --author=cphayim \
    --target @your-scope/boilerplate-xxx

# Will list the available boilerplate in `@your-scope/your-manifest-package`
vrn boi ls --manifest-package @your-scope/your-manifest-package
```

## 1.0.1

Embrace the `Pure ESM`, need Node.js `v14.13.1` above

### Refactor:

- Migrate all modules from CJS to ESM

- Change the test case to ESM

### Bug Fixes:

- Possible command parsing errors when passing `debug`

## 1.0.0

Completely refactored with new architectural designs and specifications

### Features:

- Dynamic dependency package management
- Support for multiple Package manager: npm, yarn, pnpm
- `boilerplate create` implements the `package` mode, creates projects by fetching `boilerplate-package` from `manifest-package`

##### Package Mode creation

Interactive creation:

```sh
vrn boi create my-app
vrn boi create my-app ./packages
```

Non-interactive creation, suitable for CI and automation tasks:

```sh
vrn boi create my-app --yes \
   --name=my-app --version=1.0.0 --author=cphayim \
   --target @vrn-deco/boilerplate-javascript-vue

vrn boi create my-app ./packages --yes \
   --name=@vrn-deco/my-app --version=1.0.0 --author=cphayim \
   --target @vrn-deco/boilerplate-javascript-vue
```

##### Boilerplate list

list available boilerplate, can specify format and output file

```sh
vrn boi ls
vrn boi ls --json
vrn boi ls --json --out-file ./boilerplate.json
vrn boi ls --yaml
vrn boi ls --yaml --out-file ./boilerplate.yaml
```

##### Global config

Interactively edit configuration items, you can modify `npmRegistry`, `packageManager`, `checkUpdateEnabled`

```sh
vrn config
```

### BREAKING CHANGE:

Boilerplate related services are reimplemented using the `@vrn-deco/boilerplate-protocol` specification. If you are using `v0.x` and use a custom network interface to distribute boilerplate, please refer to the migration guide

## 0.3.4

Automatic check for updates turned off

## 0.3.0

### Features:

- Replacing the `tar` command with the built-in decompressor
- Adapt to new `vrn-boilerplate` rules

## 0.2.12

### Bug Fixes:

- Rebuild the missing config file
- Compatibility with `non-tty` terminals (Windows)

## 0.2.10

### Bug Fixes:

- Rebuild the missing config file
- Compatibility with `non-tty` terminals (Windows)

## 0.2.4

### Bug Fixes:

- User directory write permission problem

## 0.2.0

### Features:

- Support for custom `registry`
- Now you can distribute `boilerplate` using your own web interface
- Automatic new version check and prompt

```sh
vrn config set registry https://boilerplate.vrndeco.cn
vrn create app
```
