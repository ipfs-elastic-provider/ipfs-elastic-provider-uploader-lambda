'use strict'

const { bucket } = require('./config')
const { logger, elapsed, serializeError } = require('./logging')
const { isFileExisting, prepareUpload } = require('./storage')

async function main({ path: key }) {
  const start = process.hrtime.bigint()

  if (key.startsWith('/')) {
    key = key.slice(1)
  }

  if (await isFileExisting(bucket, key)) {
    logger.debug({ elapsed: elapsed(start), path: key }, `Rejected file ${key} as it has already been uploaded.`)
  }

  try {
    const response = await prepareUpload(bucket, key)
    logger.debug({ elapsed: elapsed(start), path: key, response }, `Prepared upload for file ${key}`)

    return response
  } catch (e) {
    logger.error(`Cannot prepare upload for path ${key}: ${serializeError(e)}`)

    throw e
  }
}

exports.handler = main
