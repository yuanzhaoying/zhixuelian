var mongoose = require('mongoose');

var Blockchainchema = new mongoose.Schema({
    index:{
		type: String,
		default: '0'
	},
    previousHash:{
		type: String,
		default: '0'
	},
    timestamp:{
		type: String,
		default: '1538669227813'
	},
    data:{
			type: Object,
			default: ['Welcome to studyblockchain!']
		},
    hash:{
		type: String,
		default: '00000aa1fbf27775ab79612bcb8171b3a9e02efe32fa628450ba6e729cf03996'
	},
	nonce:{
		type: String,
		default: '979911'
	},
	meta: {
		createAt: {
		  type: Date,
		  default: Date.now()
		},
		updateAt: {
		  type: Date,
		  default: Date.now()
		}
	  }
})

Blockchainchema.pre('save',function(next){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	} else {
		this.meta.updateAt = Date.now();
	}
	next();
})
Blockchainchema.statics = {
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
module.exports = Blockchainchema;