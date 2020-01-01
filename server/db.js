var mongoose = require("mongoose");
var db = mongoose.connection;
var Schema = mongoose.Schema;

//链接数据库
mongoose.connect('mongodb://localhost/Web');

//用户表
var userSchema = new Schema({
    sid: String,
    password: String
});

//管理员账户表
var adminSchema = new Schema({
    sid: String,
    password: String
});

//学生信息表
var studentSchema = new Schema({
    sid: String,
    sname: String,
    gender: Number,
    age: Number,
    home: String,
    grade: Number,
    school: String, //学院
    class: Number,
    //课表，课程id，课程名，老师，天数（0-6,0位周日），起始节数（1,3,5,7,9），课长度（2节、3节、4节）
    schedule: [{ cid: String, cname: String, teacher: String, location: String, time: [{ day: Number, start: Number, long: Number }] }]
});

//课程信息表
var courseSchema = new Schema({
    cid: String,
    cname: String,
    teacher: String,
    location: String,
    point: Number,
    time: [{ day: Number, start: Number, long: Number }],
    suit_school: String,
    suit_grade: Number, //1-4（大一到大四）
    cancel: Boolean
})

//成绩表
var recordSchema = new Schema({
    sid: String,
    sname: String,
    cid: String,
    cname: String,
    teacher: String,
    point: Number,
    time: Number,
    grade: Number
})

//系统信息表
var systemSchema = new Schema({
    notice: String,
    choose: Boolean
})

//将建立的Schema编译为Model，并绑定到mongoose对象中
mongoose.model("user", userSchema);
mongoose.model("admin", adminSchema);
mongoose.model("student", studentSchema);
mongoose.model("course", courseSchema);
mongoose.model("record", recordSchema);
mongoose.model("system", systemSchema);

db.on('error', function callback() { //监听是否有异常
    console.log("Connection error");
});

db.once('open', function callback() { //监听一次打开
    //在这里创建你的模式和模型
    console.log('connected!');
});

//将mongoose对象暴露出去
module.exports = mongoose;