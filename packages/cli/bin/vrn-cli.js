#!/usr/bin/env node
if (require('import-local')(__filename)) {
  require('@vrn-deco/cli-log').logger.info('@vrn-deco/cli using local version...')
} else {
  require('../dist').main()
}
