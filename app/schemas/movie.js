var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var MovieSchema = new Schema({
  presenter: String, //推荐者
  director: String, //作者
  title: String, //视频名称
  school_age: String, //学龄
  content_type: String, //视频内容类
  view: String, //观看量
  summary: String, //提交原因
  flash: { type: String, unique: true }, //下载地址
  poster: String, //封面
  year: String, //上传时间
  pv: {
    type: Number,
    default: 0,
  }, //播放量
  comments: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  }, //点赞量
  likeUsers: {
    type: Array,
    default: [],
  }, //点赞人用户名
  v: {
    type: Number,
    default: 0,
  }, //本平台播放量
  emotion: {
    type: Number,
    default: 0,
  }, //情感值
  category: String, //视频平台
  meta: {
    createAt: {
      type: Date,
      default: Date.now(),
    },
    updateAt: {
      type: Date,
      default: Date.now(),
    },
  },
})

MovieSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})
MovieSchema.statics = {
  fetch: function (cb) {
    return this.find({}).sort('meta.updateAt').exec(cb)
  },
  findById: function (id, cb) {
    return this.findOne({ _id: id }).exec(cb)
  },
  delete: function (id, cb) {
    return this.remove({ _id: id }).exec(cb)
  },
}
module.exports = MovieSchema
