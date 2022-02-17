'use strict'

const t = require('tap')
const { mockS3HeadObject, mockS3PutObject } = require('./utils/mock')
const { handler } = require('../src/index')
// eslint-disable-next-line node/no-deprecated-api
const { parse } = require('url')

t.test('uploading - returns an upload URL', async t => {
  t.plan(1)

  const error = new Error('NOT FOUND')
  error.name = 'NotFound'
  mockS3HeadObject('cars', 'name', error)
  mockS3PutObject('cars', 'name', { presigned: parse('http://host.domain/path') })

  const response = await handler({ path: 'name' })

  t.strictSame(response, {
    isBase64Encoded: false,
    statusCode: 202,
    headers: {},
    body: '{"url":"http://host.domain/path"}'
  })
})

t.test('uploading - returns an error if the file already exists', async t => {
  t.plan(1)

  mockS3HeadObject('cars', 'name', {})

  const response = await handler({ rawPath: '/name' })

  t.strictSame(response, {
    isBase64Encoded: false,
    statusCode: 409,
    headers: {},
    body: '{"statusCode":409,"error":"Conflict","message":"Please use a different file name."}'
  })
})

t.test('uploading - handles S3 fetch errors', async t => {
  t.plan(1)

  mockS3HeadObject('cars', 'name', new Error('ERROR'))

  await t.rejects(() => handler({ rawPath: '/name' }), { message: 'ERROR' })
})

t.test('uploading - handles S3 presign errors', async t => {
  t.plan(1)

  const error = new Error('NOT FOUND')
  error.name = 'NotFound'
  mockS3HeadObject('cars', 'name', error)
  mockS3PutObject('cars', 'name', new Error('ERROR'))

  await t.rejects(() => handler({ rawPath: '/name' }), { message: 'ERROR' })
})
