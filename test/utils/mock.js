'use strict'

const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const { mockClient } = require('aws-sdk-client-mock')

const s3Mock = mockClient(S3Client)

function mockS3HeadObject(bucket, key, response) {
  const mock = s3Mock.on(HeadObjectCommand, {
    Bucket: bucket,
    Key: key
  })

  if (response instanceof Error) {
    mock.rejects(response)
  } else {
    mock.resolves(response)
  }
}

function mockS3PutObject(bucket, key, response) {
  const mock = s3Mock.on(PutObjectCommand, {
    Bucket: bucket,
    Key: key
  })

  if (response instanceof Error) {
    mock.rejects(response)
  } else {
    mock.resolves(response)
  }
}

module.exports = {
  s3Mock,
  mockS3HeadObject,
  mockS3PutObject
}
