var mongoose = require('mongoose');
var express = require('express');
var fun = express();
//连接数据库
mongoose.connect('mongodb://localhost:4000/movie/urank')


//获取数据
var urankSchema = mongoose.Schema({
	"_id": String,//推荐者
	"total": {    //推荐视频数量
		type: Number,
		default: 0
	}
});

var urank = mongoose.model('urank',urankSchema,'urank')

urank.find().then((infos) => {
	//模板渲染
	fun.set('')
})


//连接服务器
fun.listen(4000,'localhost',(err) => {
	if (err) {
		console.log('服务器连接失败');
		return;
	}
	console.log('服务器连接成功');

});