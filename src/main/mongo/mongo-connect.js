'use strict'

const fs = require('fs')
const _ = require('lodash')
const mongodb = () => require('mongodb')
const MongoClient = () => mongodb().MongoClient

const startMongo = require('./start-mongo')
const mongoUrl = require('./mongo-url')

let connection

const fn = async ({
  protocol = 'mongodb://',
  host = 'localhost',
  port = fn.defaultPort,
  dbName = 'testdb',
  containerName = fn.defaultContainerName,
  opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
} = {}) => {
  if (connection) return connection

  const scriptArgs = [containerName, port]
  await startMongo({ scriptArgs })

  const url = mongoUrl({ protocol, host, port, dbName })

  opts = _.cloneDeep(opts) || {}
  if (!opts.auth?.user || !opts.auth?.password) {
    try { delete opts.auth } catch (e) { /* gulp */ }
  }

  const mongoClient = await MongoClient().connect(url, opts)
  connection = await mongoClient.db()
  connection.client = mongoClient

  return connection
}

fn.defaultPort = parseInt(fs.readFileSync(`${__dirname}/default-mongo-test-port`))
fn.defaultContainerName = fs.readFileSync(`${__dirname}/default-mongo-test-container`)

module.exports = fn
