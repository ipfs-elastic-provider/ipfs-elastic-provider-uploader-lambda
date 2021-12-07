'use strict'

const { ConflictError } = require('http-errors-enhanced')
const { bucket } = require('./config')
const { logger, elapsed, serializeError } = require('./logging')
const { isFileExisting, prepareUpload } = require('./storage')

async function main({ path: key }) {
  const start = process.hrtime.bigint()

  if (key.startsWith('/')) {
    key = key.slice(1)
  }

  if (await isFileExisting(bucket, key)) {
    const response = new ConflictError('Please use a different file name.')

    logger.debug(
      { elapsed: elapsed(start), path: key, statusCode: response.statusCode, response: response.serialize() },
      `Rejected file ${key} as it has already been uploaded.`
    )

    return {
      isBase64Encoded: false,
      statusCode: 409,
      headers: {},
      body: response
    }
  }

  try {
    const response = await prepareUpload(bucket, key)

    logger.debug({ elapsed: elapsed(start), path: key, statusCode: 200, response }, `Prepared upload for file ${key}`)

    return {
      isBase64Encoded: false,
      statusCode: 'number',
      headers: {},
      body: response
    }
  } catch (e) {
    logger.error(`Cannot prepare upload for path ${key}: ${serializeError(e)}`)

    throw e
  }
}

exports.handler = main
