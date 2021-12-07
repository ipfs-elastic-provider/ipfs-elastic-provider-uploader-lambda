'use strict'

const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3')
const { NodeHttpHandler } = require('@aws-sdk/node-http-handler')
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post')
const { Agent } = require('https')
const { logger, serializeError } = require('./logging')

const agent = new Agent({ keepAlive: true, keepAliveMsecs: 60000 })

const s3Client = new S3Client({
  requestHandler: new NodeHttpHandler({ httpsAgent: agent })
})

async function isFileExisting(bucket, key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
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
    return await createPresignedPost(s3Client, { Bucket: bucket, Key: key })
  } catch (e) {
    logger.error(`Cannot check if ${key} already exists in bucket ${bucket}: ${serializeError(e)}`)
    throw e
  }
}

module.exports = { isFileExisting, prepareUpload }
