var mongoose = require('mongoose')
var categoryschema = require('../schemas/category')
var Category = mongoose.model('Category',categoryschema,'categorys')

module.exports  = Category 