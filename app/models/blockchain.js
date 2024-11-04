var mongoose = require('mongoose')
var Blockchainschema = require('../schemas/blockchain.js')
var Blockchain = mongoose.model('Blockchain',Blockchainschema)

module.exports  = Blockchain 