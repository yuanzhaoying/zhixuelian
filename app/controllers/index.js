var Movie = require('../models/movie');
var Category = require('../models/category');
var Comment = require('../models/comment');
var Keyword = require('../models/keyword');
const LikeSchema = require('../schemas/like');
const { like } = require('./movie');



exports.index = function(req, res) {
	// var se = req.params.se;
	// console.log(se);
	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
		//console.log(categorys )
			if(err)  console.log(err);
			/*
			Movie.find({  }).exec(function(err,ranks){
				Movie.find({  }).sort({likes: -1}).limit(5).exec(function(err,movies){
					res.render('index',{
					   title: '智学链',
					   category: categorys,
					   movies: movies,
					   ranks:ranks,
					   order:'hot'
				   });
				   })
			} )*/

			Movie.find({  }).sort({v:-1}).exec(function(err,ranks){
				Movie.find({  }).sort({updateAt:-1}).limit(5).exec(function(err,rems){
					Movie.find({  }).sort({likes: -1}).limit(5).exec(function(err,movies){
						res.render('index',{
						   title: '智学链',
						   category: categorys,
						   movies: movies,
						   ranks:ranks,
						   rems:rems,
						   order:'hot'
					   });
					   })
				})

			} )

	})
}

var History = require('../models/history')

exports.Learning_Center = function (req, res) {
  Category.find({}).populate({ path: 'movies' }).exec(function (err, categorys) {
    if (err) console.log(err);
    Movie.find({}).sort({ pv: -1 }).exec(function (err, movies) {
	   History.find().populate('movieid').exec(function (err, histories) {
        if (err) {
          console.log(err)
        }
        res.render('Learning_Center', {
          title: '学习中心',
          category: categorys,
          ranks: movies,
          histories: histories
        });
        //console.log(histories[0].meta.updateAt);
      })
    })
  })
}

exports.hot = function(req, res) {
	console.log('hot')
	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({v: -1}).exec(function(err,movies){
				
				res.render('index',{
					title: '智学链',
					category: categorys,
					ranks: movies,
					order:'hot'
				});
			})
	})
}

exports.shijian = function(req, res) {
	console.log('shijian')
	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({year: -1}).exec(function(err,movies){

				res.render('index',{
					title: '智学链',
					category: categorys,
					ranks: movies,
					order:'shijian'
				});

			})
	})
}

exports.qianDuan = function(req, res) {

	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({pv: -1}).exec(function(err,movies){

				res.render('qianDuan',{
					title: '智学链_前端技术',
					category: categorys,
					ranks: movies
				});
				
			})
	})
}
exports.quKuai = function(req, res) {

	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({pv: -1}).exec(function(err,movies){

				res.render('quKuai',{
					title: '智学链_区块链',
					category: categorys,
					ranks: movies
				});
			})
	})
}
exports.yiDong = function(req, res) {

	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({pv: -1}).exec(function(err,movies){

				res.render('yiDong',{
					title: '智学链_移动开发',
					category: categorys,
					ranks: movies
				});
			})
	})
}
exports.xinXi = function(req, res) {

	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({pv: -1}).exec(function(err,movies){

				res.render('xinXi',{
					title: '智学链_信息系统',
					category: categorys,
					ranks: movies
				});
			})
	})
}
exports.shuJu = function(req, res) {

	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({pv: -1}).exec(function(err,movies){

				res.render('shuJu',{
					title: '智学链_数据库',
					category: categorys,
					ranks: movies
				});
			})
	})
}
exports.houDuan = function(req, res) {

	Category.find({}).populate({path:'movies'}).exec(function(err,categorys){
			if(err)  console.log(err);
			Movie.find({}).sort({pv: -1}).exec(function(err,movies){

				res.render('houDuan',{
					title: '智学链_后端技术',
					category: categorys,
					ranks: movies
				});
			})
	})
}
exports.search = function(req,res){
	var search_text = req.query.search_text;
	var page = parseInt(req.query.p) || 0;
	var count = 20; //每页展示视频数量
	var start = page * count;

		//如果搜索词不为空，保存搜索关键词
		if(search_text != ''){
			Keyword.findOne({keyword:search_text},function(err,keyword){
				if(err)	console.log(err);
				if(!keyword){
					var _keyword = new Keyword({
						keyword:  search_text,
						count: 1
					});	
					_keyword.save(function(err,keyword){
						if(err)	console.log(err);
					})
				} else {
					Keyword.update({_id:keyword._id},{$inc:{count:1}},function(err){
						if(err)	console.log(err);
					})
				}
			})
		}
		Movie.find({title: new RegExp(search_text+".*",'i')}).exec(function(err,movies){
			if(err){
				console.log(err);
			}
	
			var totalPage = Math.ceil(movies.length / count);
			var results = movies.slice(start,start + count);
			
			Keyword.find({}).sort({count: -1}).limit(10).exec(function(err,keywords){
				res.render('search',{
					title: '查询结果',
					keyword: search_text,
					currentPage: page + 1,
					totalPage: totalPage, 
					movies: results,
					keywords: keywords
				});
			})
		})
	}
