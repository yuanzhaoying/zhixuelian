var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var oDate = require("../../libs/date");

var CommentSchema = new mongoose.Schema({
	movie:{
		type: ObjectId,
		ref: 'Movie'
	},
	from:{
		type: ObjectId,
		ref: 'User'
	},
	username:String,
	reply: [{
		from:{type: ObjectId,ref: 'User'},
		to:{type: ObjectId,ref: 'User'},
		content: String,
		createtime: String,
	}],
	content: String,
	createtime: String,
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

CommentSchema.pre('save',function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})
CommentSchema.statics = {
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
module.exports = CommentSchema;