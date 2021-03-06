'use strict'

const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { Agent } = require('https')

const { logger, serializeError } = require('./logging')
const telemetry = require('./telemetry')

const agent = new Agent({ keepAlive: true, keepAliveMsecs: 60000 })

const s3Client = new S3Client({
  requestHandler: new NodeHttpHandler({ httpsAgent: agent })
})

async function isFileExisting(bucket, key) {
  try {
    telemetry.increaseCount('s3-heads')

    await telemetry.trackDuration('s3-heads', s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key })))
    return true
  } catch (e) {
    if (e.name !== 'NotFound') {
      logger.error(`Cannot check if ${key} already exists in bucket ${bucket}: ${serializeError(e)}`)
      throw e
    }

    return false
  }
}

async function prepareUpload(bucket, key) {
  try {
    telemetry.increaseCount('s3-signs')

    return await telemetry.trackDuration(
      's3-signs',
      getSignedUrl(s3Client, new PutObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 })
    )
  } catch (e) {
    logger.error(`Cannot prepare file ${key} for upload in bucket ${bucket}: ${serializeError(e)}`)
    throw e
  }
}

module.exports = { isFileExisting, prepareUpload }
