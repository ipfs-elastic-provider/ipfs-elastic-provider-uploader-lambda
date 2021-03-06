'use strict'

/* c8 ignore next 5 */
const { resolve } = require('path')
const { readFileSync } = require('fs')

const { handler } = require('../src/index')

const event = JSON.parse(readFileSync(resolve(process.cwd(), process.argv[2] ?? 'event.json'), 'utf-8'))
handler(event)
