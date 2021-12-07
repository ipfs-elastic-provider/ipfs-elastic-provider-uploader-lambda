'use strict'

const { handler } = require('../src/index')
const { resolve } = require('path')
const { readFileSync } = require('fs')

const event = JSON.parse(readFileSync(resolve(process.cwd(), process.argv[2] ?? 'event.json'), 'utf-8'))
handler(event)
