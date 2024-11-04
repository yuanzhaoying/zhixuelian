var Comment = require('../models/comment');
var Movie = require('../models/movie');

exports.reply = function(req,res){
	var username = req.session.user.name;
	var _comment = req.body.comment;
	_comment['username']=username;
	var movieId = _comment.movie;
	if(_comment.cid){
		Comment.findById(_comment.cid,function(err,comment){
			if(err) console.log(err);
			var reply = {
				from: _comment.from,
				to: _comment.tid,
				content: _comment.content,
				createtime:_comment.createtime,
			}
			comment.reply.push(reply);

			comment.save(function(err,comment){
				if(err) console.log(err);
				Movie.update({_id:movieId},{$inc:{comments:1}},function(err){
					if(err)	console.log(err);
				})
				res.redirect('/movie/'+ movieId);
			})
		})
	} else {
		var comment = new Comment(_comment);
		comment.save(function(err,comment){
			if(err) console.log(err);
			Movie.update({_id:movieId},{$inc:{comments:1}},function(err){
				if(err)	console.log(err);
			})
			res.redirect('/movie/'+ movieId);
		})
	}	
}