'use strict'

const { resolve } = require('path')

/* c8 ignore next */
require('dotenv').config({ path: process.env.ENV_FILE_PATH || resolve(process.cwd(), '.env') })

const { S3_BUCKET: bucket } = process.env

module.exports = {
  bucket: bucket ?? 'cars'
}
