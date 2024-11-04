var User = require('../models/user');
var nodemailer = require('nodemailer');
const Save_code = require('../models/save_code');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

exports.register= function(req,res){
	res.render('register',{
		title: '智学链',
	})
}
exports.forget= function(req,res){
	res.render('forget',{
		title: '智学链',
	})
}
exports.signin = function(req,res){
	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;
	
	User.findOne({name:name},function(err,user){
		if(err){
			console.log(err);
		}
		//用户不存在
		if(!user){
			return res.json({'issuccess':false,'data':"用户名不存在",'place':'name'});
		}
		user.comparePassword(password,function(err,isMatch){
			if(err){
				console.log(err);
			}
			if(isMatch){
				req.session.user = user;
				return res.json({'issuccess':true,'data':"登录成功"});
			} else {
				return res.json({'issuccess':false,'data':"密码错误",'place':'password'});
			}
		});
	})
}
	
exports.signup = function(req,res){
	var userObj = req.body.user;
	//查找用户，判断用户是否已注册
	User.findOne({'$or':[{name:userObj.name},{email:userObj.email}]},function(err,user){
		if(err){
			console.log(err);
		}
		if(user){
			return res.json({'issuccess':false,'data':"用户名或邮箱已存在",'place':'name'});
		} else {
			Save_code.findOne({'name': userObj.name},function(err,doc){
				if(err){
					console.log(err);
				}
				if(doc){
					var nowDate = (new Date()).getTime()
					console.log(String(userObj.code))
					console.log(String(doc.code))
					console.log(nowDate - doc.meta.createAt)
					if(String(userObj.code) == String(doc.code) && nowDate - doc.meta.createAt < 600000){
						delete 	userObj.code;
						var _user = new User(userObj)
						_user.save(function(err,user){
							if(err){
								console.log(err);
							}
							if(user){
								Save_code.remove({'email':userObj.email},function (err,res) {})
								Save_code.remove({'name':userObj.name},function (err,res) {})
								req.session.user = user;
								return res.json({'issuccess':true,'data':"注册成功"});
							}
						});
					}else{
						return res.json({'issuccess':false,'data':"验证码不正确或者超时，请重新获取",'place':'code'});
					}
				}
			})
		}
	})
}
// exports.signup = function(req,res){
// 	var userObj = req.body.user;

// 	//查找用户，判断用户是否已注册
// 	User.findOne({name:userObj.name},function(err,user){
// 		if(err){
// 			console.log(err);
// 		}
// 		if(user){
// 			return res.json({'issuccess':false,'data':"用户名已存在",'place':'name'});
// 		} else {
// 			var _user = new User(userObj)
// 			_user.save(function(err,user){
// 				if(err){
// 					console.log(err);
// 				}
// 				req.session.user = user;
// 				return res.json({'issuccess':true,'data':"注册成功"});
// 			});
// 		}
// 	})
// }

exports.reset = function(req,res){
	var userObj = req.body.user;
	var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR)
	var password = bcrypt.hashSync(userObj.password,salt)
	User.findOne({'email':userObj.email},function(err,user){
		if(err){
			console.log(err);
		}
		if(!user){
			return res.json({'issuccess':false,'data':"邮箱不存在或输入错误",'place':'email'});
		}
	})
	Save_code.findOne({'name': userObj.name},function(err,doc){
		if(err){
			console.log(err);
		}
		if(!doc){
			return  res.json({'issuccess':false,'data':"请先获取验证码",'place':'code'});
		}
		if(doc){

			var nowDate = (new Date()).getTime()
			if(userObj.code == doc.code && nowDate - doc.meta.createAt < 600000){
				delete 	userObj.code;
				User.findOneAndUpdate({'name':userObj.name},{'$set': {'password':password}},{'new': true},function(err,user){
					if(err){
						console.log(err);
					}
					if(user){
						Save_code.remove({'email':userObj.email},function (err,res) {})
						Save_code.remove({'name':userObj.name},function (err,res) {})
						req.session.user = user;
						return res.json({'issuccess':true,'data':"修改成功"});
					}
				});
			}else{
				return res.json({'issuccess':false,'data':"验证码不正确或者超时,请重新获取",'place':'code'});
			}
		}
	})
}
exports.user= function(req, res) {
		res.render('update_info',{
			title: '后台录入',
			user:{
				poster: '',
				name:'',
				birth:'',
				content_type:'',
				profile:'',
				email:''
			}
	})
	
}
	
exports.logout = function(req,res){
	delete req.session.user;
	res.redirect('back')
}
// exports.update = function(req,res){
// 	var id = req.session.user._id;
// 	console.log(id);
// 	var xinxi = req.body.user;
// 	console.log(xinxi);
// 	var poster = xinxi.poster;
// 	var name = xinxi.name;
// 	var birth = xinxi.birth;
// 	var content_type = xinxi.content_type;
// 	var profile = xinxi.profile;
// 	console.log(poster,birth,content_type,profile);
// 	User.update({"_id": id},{"$set":{"poster":poster,"name":name,"birth":birth,"profile":profile,"content_type":content_type}});
// 	console.log("修改成功")
// }

exports.update = function(req,res){
	var id = req.session.user._id;
	//console.log(id);
	var xinxi = req.body.user;
	//console.log(xinxi);
	var poster = xinxi.poster;
	var name = xinxi.name;
	var birth = xinxi.birth;
	var content_type = xinxi.content_type;
	var profile = xinxi.profile;
	var email = xinxi.email;
	var code = xinxi.code;

	Save_code.findOne({'email': email},function(err,doc){
		if(err){
			console.log(err);
		}
		if(!doc){
			return  res.json({'success':false,'data':"请先获取验证码",'place':'code'});
		}
		if(doc){
			var nowDate = (new Date()).getTime()
			if(code == doc.code && nowDate - doc.meta.createAt < 600000){
				Save_code.remove({'email':email},function (err,res) {})
				User.findOneAndUpdate({"_id": id},{"$set":{"poster":poster,"name":name[1],"birth":birth,"profile":profile,"content_type":content_type,'email':email}},{'new': true},function(err,user){
					if(err){
						console.log(err);
					}else{
						res.json({"success":true,"data":"信息保存成功"});
					}
				})

			}else{
				return res.json({'success':false,'data':"验证码不正确或者超时,请重新获取",'place':'code'});
			}
		}
	})
}

exports.list = function(req,res){	
	User.fetch(function(err,users){
		if(err) console.log(err);
		res.render('user_list',{
			title: '用户列表',
			users: users
		})	
	})
}
exports.jifen = function(req,res,next){	
	var us = req.session.user;
// 	console.log(us);
	var id = us._id;
// 	console.log(id);
	User.findById(id,function(err,user){
		if(err) console.log(err);	
		res.render('admin',{
			title: '后台管理',
			user:user,
		})
	})
	// next();
}

// 登陆控制
exports.signinRequired = function(req,res,next){
	var user = req.session.user;
	if(!user){
		return res.redirect('/register#signin');
	}
	next();
}
// 权限控制
// 0: user, 1: verified user, 2: professonal user , >10 admin, >50 super admin
exports.adminRequired = function(req,res,next){
	var user = req.session.user;
	//角色权限>=10为管理员，否则无权限继续
	if(!user.role || user.role < 10){
		return res.redirect('/');
	}
	next();
}


function getRandom(min, max) {//意思是获取min-max数字之间的某个随机数，直接调用即可
	return Math.round(Math.random() * (max - min) + min);
  }

exports.email = async function(req,res,next){
	let verification_code_str = "0123456789";
	let code = '';
	for (var i = 0; i < 4; i++) {
	  code += verification_code_str[getRandom(0, verification_code_str.length - 1)];
	}
  
    let transporter = nodemailer.createTransport({
		host: 'smtp.126.com',
		secure: true,
		auth: {
			user: 'x_hongmin@126.com',
			pass: 'SITKGAURMIVSFONE' 
		}
	});

	var email = req.query.email;
	var name = req.query.name;
	var isLive = 'no';

	await Save_code.remove({'email':email},function (err,res) {})
	await Save_code.remove({'name':name},function (err,res) {})

	var save_code = new Save_code({
		'name': name,
		'email': email,
		'code': code,
		'isLive': isLive,
	});
	await save_code.save();
    let status = null

    await new Promise((resolve, reject) => {
        transporter.sendMail({
            from: '"智学链" <x_hongmin@126.com>',
            to: email, 
            subject: '智学链邮箱验证码',
            html: `
            <p>【智学链】验证码：</p>
		<span style="font-size: 18px; color: red">` + code + `</span>
		<p>您正在通过邮箱验证码找回智学链账号密码，该验证码10分钟内有效。为了保障您的账户安全，请勿向他人泄露验证码信息。</p>
		<p></p>
		<p></p>
		<p>此致</p>
		<p>智学链团队</p>
		`
		
        }, function (err, info) {
            if (err) {
                status = 0
                reject()
            } else {
                status = 1
                resolve()
            }
        });
    })
    return status
}