# @vrn-deco/cli-shared

## 1.0.0

### Major Changes

Completely refactored with new architectural designs and specifications

#### Features:

- Dynamic dependency package management
- Support for multiple Package manager: npm, yarn, pnpm
- `boilerplate create` implements the `package` mode, creates projects by fetching `boilerplate-package` from `manifest-package`

#### BREAKING CHANGE:

Boilerplate related services are reimplemented using the `@vrn-deco/boilerplate-protocol` specification. If you are using `v0.x` and use a custom network interface to distribute boilerplate, please refer to the migration guide
