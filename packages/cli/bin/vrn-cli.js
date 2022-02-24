#!/usr/bin/env node
import importLocal from 'import-local'

if (importLocal(import.meta.url)) {
  const logger = await import('@vrn-deco/cli-log')
  logger.info('@vrn-deco/cli using local version...')
} else {
  await import('../dist/index.js')
}
