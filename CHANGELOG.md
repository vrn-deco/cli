# @vrn-deco/cli

## 1.0.2

### Patch Changes

The `boi create` and `boi list` commands now support specifying manifest-package

```sh
# Interactive creation, pulling the manifest from `@your-scope/your-manifest-package`
vrn boi create ooo --manifest-package @your-scope/your-manifest-package

# Non-nteractive creation
# can specify a boilerplate that is not in the manifest as the target
# without specifying --manifest-package
vrn boi create myapp --yes \
    --name=myapp --version=1.0.0 --author=cphayim \
    --target @your-scope/boilerplate-xxx

# Will list the available boilerplate in `@your-scope/your-manifest-package`
vrn boi list --manifest-package @your-scope/your-manifest-package
```

#### Updated dependencies:

- @vrn-deco/cli-check-update@1.0.2
- @vrn-deco/cli-command@1.0.2
- @vrn-deco/cli-command-boilerplate@1.0.2
- @vrn-deco/cli-command-config@1.0.2
- @vrn-deco/cli-config-helper@1.0.2
- @vrn-deco/cli-log@1.0.2
- @vrn-deco/cli-npm-helper@1.0.2
- @vrn-deco/cli-shared@1.0.2

## 1.0.1

### Patch Changes

Embrace the `Pure ESM`, need Node.js `v14.13.1` above

#### Refactor:

- Migrate all modules from cjs to esm

#### Updated dependencies::

- @vrn-deco/cli-check-update@1.0.1
- @vrn-deco/cli-command@1.0.1
- @vrn-deco/cli-command-boilerplate@1.0.1
- @vrn-deco/cli-command-config@1.0.1
- @vrn-deco/cli-config-helper@1.0.1
- @vrn-deco/cli-log@1.0.1
- @vrn-deco/cli-npm-helper@1.0.1
- @vrn-deco/cli-shared@1.0.1

## 1.0.0

### Major Changes

Completely refactored with new architectural designs and specifications

#### Features:

- Dynamic dependency package management
- Support for multiple Package manager: npm, yarn, pnpm
- `boilerplate create` implements the `package` mode, creates projects by fetching `boilerplate-package` from `manifest-package`

`boilerplate create`:

```sh
# Interactive creation
vrn boi create myapp
vrn boi create myapp ./packages

# Non-interactive creation, suitable for CI and automation tasks
vrn boi create myapp --yes \
   --name=myapp --version=1.0.0 --author=cphayim \
   --target @vrn-deco/boilerplate-javascript-vue

vrn boi create myapp ./packages --yes \
   --name=@vrn-deco/myapp --version=1.0.0 --author=cphayim \
   --target @vrn-deco/boilerplate-javascript-vue
```

`boilerplate list`:

```sh
# list available boilerplate
vrn boilerplate list
vrn boilerplate list --json
vrn boilerplate list --json --out-file ./boilerplate.json
vrn boilerplate list --yaml
vrn boilerplate list --yaml --out-file ./boilerplate.yaml
```

`config`:

```sh
# Interactively edit configuration items
# you can modify `npmRegistry`, `packageManager`, `checkUpdateEnabled`
vrn config
```

#### BREAKING CHANGE:

Boilerplate related services are reimplemented using the `@vrn-deco/boilerplate-protocol` specification. If you are using `v0.x` and use a custom network interface to distribute boilerplate, please refer to the migration guide

### Patch Changes

#### Updated dependencies::

- @vrn-deco/cli-check-update@1.0.0
- @vrn-deco/cli-command@1.0.0
- @vrn-deco/cli-command-boilerplate@1.0.0
- @vrn-deco/cli-command-config@1.0.0
- @vrn-deco/cli-config-helper@1.0.0
- @vrn-deco/cli-log@1.0.0
- @vrn-deco/cli-npm-helper@1.0.0
- @vrn-deco/cli-shared@1.0.0

## 0.3.4

### Patch Changes

Automatic check for updates turned off

## 0.3.0

### Minor Changes

#### Fetures:

- Replacing the `tar` command with the built-in decompressor
- Adapt to new `vrn-boilerplate` rules

## 0.2.12

### Patch Changes

#### Bug Fixes:

- Rebuild the missing config file
- Compatibility with `non-tty` terminals (Windows)

## 0.2.10

### Patch Changes

#### Bug Fixes:

- Rebuild the missing config file
- Compatibility with `non-tty` terminals (Windows)

## 0.2.4

### Patch Changes

#### Bug Fixes:

- User directory write permission problem

## 0.2.0

### Minor Changes

#### Fetures:

- Support for custom `registry`
- Now you can distribute `boilerplate` using your own web interface
- Automatic new version check and prompt
