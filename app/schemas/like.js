var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var oDate = require("../../libs/date");

var LikeSchema = new mongoose.Schema({
	movieid:{
		type: ObjectId,
		ref: 'Movie'
	},
	userid:{
		type: ObjectId,
		ref: 'User'
	},
	time: String,
	username:String,
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

LikeSchema.pre('save',function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})
LikeSchema.statics = {
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
module.exports = LikeSchema;