var _ = require('underscore')
var Movie = require('../models/movie')
var Like = require('../models/like')
var History = require('../models/history')
var Category = require('../models/category')
var Comment = require('../models/comment')
var fs = require('fs')
var path = require('path')
const Blockchain = require('../models/blockchain')
const Blockchains = require('./blockchain.js')
const blockchains = new Blockchains()
const key = require('./keys')
const { result } = require('underscore')

exports.movie = function (req, res) {
  Category.fetch(function (err, categorys) {
    res.render('addEdit', {
      title: '后台录入',
      movie: {
        director: '',
        school_age: '',
        view: '',
        title: '',
        year: '',
        poster: '',
        content_type: '',
        flash: '',
        summary: '',
        category: '',
        v: '',
        emotion: '',
      },
      categorys: categorys,
    })
  })
}

exports.history2 = function (req, res) {
	History.find().populate('movieid')
	  .exec(function (err, histories) {
	   if (err) {
	   console.log(err)
	   }
	   res.render('Learning_Center', {
	   title: '历史记录',
	   histories: histories,
	   })
	 //console.log(histories[0]._doc.movieid._doc.title);
	 //console.log(histories[0].meta.updateAt);
	   })
	}

exports.vUpdate = function (req, res) {
  var id = req.params.id
  Movie.update({ _id: id }, { $inc: { v: 1 } }, function (err) {
    if (err) {
      console.log(err)
    }
    Movie.findById(id, function (err, doc) {
      if (err) {
        console.log(err)
      } else {
        return res.redirect(doc.flash)
      }
    })
  })
}
//更新点赞
exports.like = function (req, res) {
  var id = req.params.id
  //判断是点赞还是取消点赞
  var isLike = JSON.parse(req.query.isLike)
  var user = req.session.user

  if (!user) {
    res.json({
      code: 0,
      msg: '请先登录',
    })
  } else if (!isLike) {
    //点赞数加一 将当前用户名加入点赞用户数组
    Movie.update(
      { _id: id },
      { $inc: { likes: 1 }, $addToSet: { likeUsers: user.name } },
      function (err) {
        if (err) {
          console.log(err)
        }
        Movie.findById(id, function (err, doc) {
          if (err) {
            console.log(err)
            res.json({
              code: 0,
              msg: '点赞失败',
            })
          } else {
            res.json({
              code: 1,
              msg: '点赞成功',
            })
          }
        })
      }
    )
    //点赞记录
    var uid;
    if(req.session["user"] != null){
      uid = req.session.user._id;
      uname = req.session.user.name;
      var _like = {
        movieid:id,
        userid:uid,
        username:uname,
      };
      var like = new Like(_like);
      like.save();
    }
  } else {
    var uid = req.session.user._id;
    //Like.deleteOne({movieid:id},{userid:uid})
    Like.remove({'movieid':id,'userid':uid},function(err,result){
			if(err){
				console.log(err);
			}
		})
    //点赞数减一 将当前用户名移除点赞用户数组
    Movie.update(
      { _id: id },
      { $inc: { likes: -1 }, $pull: { likeUsers: user.name } },
      function (err) {
        if (err) {
          console.log(err)
        }
        Movie.findById(id, function (err, doc) {
          if (err) {
            console.log(err)
            res.json({
              code: 0,
              msg: '取消点赞失败',
            })
          } else {
            res.json({
              code: 1,
              msg: '取消点赞成功',
            })
          }
        })
      }
    )
  }
}

exports.detail = function (req, res) {
  var id = req.params.id;
  //历史记录
  var uid;
  var uname;
  // console.log(History.find({username:'wk'}));
 // var mname = Movie.findById(id)
  if(req.session["user"] != null){
	  uid = req.session.user._id;
    uname = req.session.user.name;
	  var _history = {
		  movieid:id,
		  userid:uid,
      username:uname,
	  };
	  var history = new History(_history);
	  history.save();
  }

  var id = req.params.id
  var username = req.session.user && req.session.user.name
  console.log({ username })
  Movie.update({ _id: id }, { $inc: { pv: 1 } }, function (err) {
    if (err) {
      console.log(err)
    }
  })
  Movie.findById(id, function (err, movie) {
    Comment.find({ movie: id })
      .populate('from', 'name')
      .populate('reply.from reply.to', 'name')
      .exec(function (err, comments) {
        if (err) {
          console.log(err)
        }
        //根据点赞数倒序查询当前分类前五条
        Movie.find({ category: movie.category })
          .sort({ likes: -1 })
          .limit(5)
          .exec(function (err, likes) {
            res.render('detail', {
              title: movie.title + ' - 详情',
              movie: movie,
              comments: comments,
              likes: likes,
              isLike: username ? movie._doc.likeUsers.includes(username) : false,
            })
          })
      })
  })
}

exports.update = function (req, res) {
  var id = req.params.id

  if (id) {
    Movie.findById(id, function (err, movie) {
      if (err) {
        console.log(err)
      }
      Category.fetch(function (err, categorys) {
        if (err) {
          console.log(err)
        }
        res.render('addEdit', {
          title: '视频编辑',
          movie: movie,
          categorys: categorys,
        })
      })
    })
  }
}

exports.add = function (req, res) {
  var id = req.body.movie._id
  var movieObj = req.body.movie
  var _movie
  var data

  // let blockchainl=new Blockchain()
  // 	console.log(blockchainl);
  // if(Blockchain.length == NULL){
  // 	console.log('执行了');
  // 	blockchainl.save(function(err,blockchain,numberAffected){
  // 		if(err){
  // 			console.log(err);
  // 		}
  // 		console.log(numberAffected);
  // 	});
  // }

  if (id) {
    Movie.findById(id, function (err, movie) {
      if (err) {
        console.log(err)
      }
      _movie = _.extend(movie, movieObj)

      _movie.save(function (err, movie) {
        if (err) {
          console.log(err)
        }
        console.log(blockchainl)

        //				res.redirect('/movie/'+_movie.id)
        res.json({ success: true, data: '编辑视频成功' })
      })
    })
  } else {
    _movie = new Movie(movieObj)

    _movie.save(function (err, movie) {
      data = blockchains.transfer(key.keys.pub, movie.title, movie.flash)
      let blockchainl = new Blockchain(blockchains.generateNewBlock())
      // console.log(data)
      if (err) {
        console.log(err)
      }
      // Blockchain.fetch(function(err,blockchain){
      // 	if(err){
      // 		console.log(err);
      // 	}
      // 	console.log(blockchain);
      blockchainl.save(function (err, blockchain) {
        if (err) {
          console.log(err)
        }
        res.json({ success: true, data: '添加视频成功' })
        // })
      })
    })
  }
}

exports.list = function (req, res) {
  Movie.fetch(function (err, movies) {
    if (err) {
      console.log(err)
    }
    res.render('list', {
      title: '视频列表',
      movies: movies,
    })
  })
}

exports.delete = function (req, res) {
  var id = req.query.id

  if (id) {
    Movie.delete(id, function (err, movie) {
      if (err) {
        console.log(err)
      } else {
        res.json({ success: true })
      }
    })
  }
}

exports.fileUpload = function (req, res) {
  var postData = req.files.file
  var filePath = postData.path
  var originalFilename = postData.originalFilename

  if (originalFilename) {
    fs.readFile(filePath, function (err, data) {
      var timestamp = Date.now()
      var type = postData.type.split('/')[1]
      var poster = timestamp + '.' + type
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
      fs.writeFile(newPath, data, function (err) {
        var src = '/upload/' + poster
        res.json({ src: src })
      })
    })
  }
}

exports.uploadPoster = function (req, res, next) {
  var postData = req.files.uploadPoster

  var filePath = postData.path
  var originalFilename = postData.originalFilename

  if (originalFilename) {
    fs.readFile(filePath, function (err, data) {
      var timestamp = Date.now()
      var type = postData.type.split('/')[1]
      var poster = timestamp + '.' + type
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
      fs.writeFile(newPath, data, function (err) {
        req.poster = '/upload/' + poster
        next()
      })
    })
  } else {
    next()
  }
}
