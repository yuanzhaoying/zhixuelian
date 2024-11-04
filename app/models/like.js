var mongoose = require('mongoose')
var Likeschema = require('../schemas/like')
var Like = mongoose.model('Like',Likeschema)

module.exports  = Like