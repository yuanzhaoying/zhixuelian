var mongoose = require('mongoose')
var Save_codeSchema = require('../schemas/save_code')
var Save_code = mongoose.model('Save_code',Save_codeSchema)


module.exports  = Save_code 