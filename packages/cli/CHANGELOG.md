# @vrn-deco/cli

## 1.0.0

### Major Changes

Completely refactored with new architectural designs and specifications

#### Features:

- Dynamic dependency package management
- Support for multiple Package manager: npm, yarn, pnpm
- `boilerplate create` implements the `package` mode, creates projects by fetching `boilerplate-package` from `manifest-package`

#### BREAKING CHANGE:

Boilerplate related services are reimplemented using the `@vrn-deco/boilerplate-protocol` specification. If you are using `v0.x` and use a custom network interface to distribute boilerplate, please refer to the migration guide

### Patch Changes

- Updated dependencies
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
