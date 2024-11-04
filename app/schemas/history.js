var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var oDate = require("../../libs/date");

var HistorySchema = new mongoose.Schema({
	movieid:{
		type: ObjectId,
		ref: 'Movie'
	},
	moviename: String,
	userid:{
		type: ObjectId,
		ref: 'User'
	},
	username: String,
	viewtime: String,
	meta:{
		createAt:{
			type:Date,
			default: Date.now()
		},
		updateAt:{
			type:Date,
			default: Date.now()
		}
	}
}, { usePushEach: true});

HistorySchema.pre('save',function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})
HistorySchema.statics = {
	fetch: function(cb){
		return this.find({}).sort('meta.updateAt').exec(cb);
	},
	findById: function(id,cb){
		return this.findOne({_id: id}).exec(cb);
	},
	delete: function(id,cb){
		return this.remove({_id: id}).exec(cb);
	},
}
module.exports = HistorySchema;