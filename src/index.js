'use strict'

const { setTimeout } = require('timers/promises')
const { bucket } = require('./config')
const { logger, elapsed, serializeError } = require('./logging')
const { isFileExisting, prepareUpload } = require('./storage')
const { storeMetrics } = require('./telemetry')

async function main(event) {
  let key = event.path || event.rawPath // Allow integration with API Gateway or Lambda Proxy
  const start = process.hrtime.bigint()

  if (key.startsWith('/')) {
    key = key.slice(1)
  }

  try {
    if (await isFileExisting(bucket, key)) {
      const response = { statusCode: 409, error: 'Conflict', message: 'Please use a different file name.' }

      logger.debug(
        { elapsed: elapsed(start), path: key, statusCode: response.statusCode, response },
        `Rejected file ${key} as it has already been uploaded.`
      )

      return {
        isBase64Encoded: false,
        statusCode: 409,
        headers: {},
        body: JSON.stringify(response)
      }
    }

    const response = { url: await prepareUpload(bucket, key) }

    logger.debug({ elapsed: elapsed(start), path: key, statusCode: 200, response }, `Prepared upload for file ${key}.`)

    return {
      isBase64Encoded: false,
      statusCode: 202,
      headers: {},
      body: JSON.stringify(response)
    }
  } catch (e) {
    logger.error(`Cannot prepare upload for path ${key}: ${serializeError(e)}`)

    throw e
    /* c8 ignore next */
  } finally {
    // Wait a little more to let all metrics being collected
    await setTimeout(200)

    // Output metrics
    logger.info({ metrics: storeMetrics() }, 'Operation has completed.')
  }
}

exports.handler = main
