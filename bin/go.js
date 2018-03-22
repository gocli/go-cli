#!/usr/bin/env node

const go = require('..')
const args = process.argv.slice(2)
go(args).catch(console.error)
