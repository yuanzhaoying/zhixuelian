var mongoose = require('mongoose')
var Historyschema = require('../schemas/history')
var History = mongoose.model('History',Historyschema)

module.exports  = History