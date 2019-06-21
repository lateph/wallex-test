const user = require('./user')
const account = require('./account')
const bank = require('./bank')
const deposit = require('./deposit')
const transfer = require('./transfer')
const payment = require('./payment')
const {
    // GraphQLDate,
    // GraphQLTime,
    GraphQLDateTime
  }  = require('graphql-iso-date')

module.exports = {
    ...user,
    ...account,
    ...bank,
    ...deposit,
    ...transfer,
    ...payment,
    "DateTime": GraphQLDateTime,
}