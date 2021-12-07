'use strict'

require('dotenv').config()

const { S3_BUCKET: bucket } = process.env

module.exports = {
  bucket
}
