var express = require('express');
var mongoose = require('../db');
//引入model
var userModel = mongoose.model("user");
var adminModel = mongoose.model("admin");
var studentModel = mongoose.model("student");
var courseModel = mongoose.model("course");
var recordModel = mongoose.model("record");
var systemModel = mongoose.model("system");
var router = express.Router();

//根路由
router.get('/', function(req, res, next) {
    res.json({
        request: true
    })
});

//管理员登录验证
router.post('/admin_check', function(req, res, next) {
    let input_username = req.body.sid;
    let input_password = req.body.password;

    adminModel.find({ "sid": input_username }, "password", function(err, admin) {
        if (err) {
            res.json({
                request: false,
                isExist: false,
                checked: false
            })
        } else {
            if (admin.length === 0) {
                res.json({
                    request: true,
                    isExist: false,
                    checked: false
                })
            } else {
                if (admin[0].password === input_password) {
                    res.json({
                        request: true,
                        isExist: true,
                        checked: true
                    })
                } else {
                    res.json({
                        request: true,
                        isExist: true,
                        checked: false
                    })
                }
            }
        }
    })
})

//学生登录验证
router.post('/student_check', function(req, res, next) {
    let input_username = req.body.sid;
    let input_password = req.body.password;

    studentModel.find({ "sid": input_username }, "sname", function(err, sname) {
        if (err) {
            res.json({
                request: false,
                rejest: false,
                isExist: false,
                checked: false
            })
        } else {
            if (sname.length === 0) {
                res.json({
                    request: true,
                    rejest: false,
                    isExist: false,
                    checked: false
                })
            } else {
                userModel.find({ "sid": input_username }, "password", function(err, admin) {
                    if (err) {
                        res.json({
                            request: false,
                            rejest: false,
                            isExist: false,
                            checked: false
                        })
                    } else {
                        if (admin.length === 0) {
                            res.json({
                                request: true,
                                rejest: true,
                                isExist: false,
                                checked: false
                            })
                        } else {
                            if (admin[0].password === input_password) {
                                res.json({
                                    request: true,
                                    rejest: true,
                                    isExist: true,
                                    checked: true
                                })
                            } else {
                                res.json({
                                    request: true,
                                    rejest: true,
                                    isExist: true,
                                    checked: false
                                })
                            }
                        }
                    }
                })
            }
        }
    })
})

//增加用户
router.post('/add_user', function(req, res, next) {
    var newuser = new userModel({
        sid: req.body.sid,
        password: req.body.password
    })

    newuser.save(function(err) {
        if (err) {
            res.json({
                request: false,
                success: false
            })
        } else {
            res.json({
                request: true,
                success: true
            })
        }
    })
})

//增加学籍信息
router.post('/add_student', function(req, res, next) {
    var newstudent = new studentModel(req.body).save(function(err) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//修改用户密码
router.post('/edit_user_password', function(req, res, next) {
    userModel.update({ sid: req.body.sid }, { password: req.body.newpass }, function(err, user) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//修改管理员密码
router.post('/edit_admin_password', function(req, res, next) {
    adminModel.update({ sid: "admin" }, { password: req.body.newpass }, function(err, user) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//增加学籍信息
router.post('/get_student', function(req, res, next) {
    studentModel.find({ "sid": req.body.sid }, function(err, student) {
        if (err) {
            res.json({
                error: true
            })
        } else {
            if (student.length === 0) {
                res.json({
                    empty: true
                })
            } else {
                res.json(student[0]);
            }
        }
    })
})

//获取教务通知
router.get('/get_notice', function(req, res, next) {
    systemModel.find(function(err, sys) {
        if (err) {
            res.json({
                request: false
            })
        } else {
            res.json({
                request: true,
                value: sys
            })
        }
    })
})

//获取学生的全部成绩
router.post('/get_score', function(req, res, next) {
    if (req.body.year === -1) {
        recordModel.find({ sid: req.body.sid }, function(err, record) {
            if (err) {
                res.json({
                    err: true
                })
            } else {
                res.json(record);
            }
        })
    } else {
        recordModel.find({ sid: req.body.sid, time: req.body.year }, function(err, record) {
            if (err) {
                res.json({
                    err: true
                })
            } else {
                res.json(record);
            }
        })
    }
})

//获取课程的全部成绩
router.post('/get_course_score', function(req, res, next) {
    if (req.body.year === -1) {
        recordModel.find({ cid: req.body.cid }, function(err, record) {
            if (err) {
                res.json({
                    err: true
                })
            } else {
                res.json(record);
            }
        })
    } else {
        recordModel.find({ cid: req.body.cid, time: req.body.year }, function(err, record) {
            if (err) {
                res.json({
                    err: true
                })
            } else {
                res.json(record);
            }
        })
    }
})

//验证成绩是否存在
router.post('/score_exist', function(req, res, next) {
    recordModel.find({ sid: req.body.sid, cid: req.body.cid, time: req.body.time }, function(err, record) {
        console.log(record);
        if (record.length === 0) {
            res.json({
                empty: true
            })
        } else {
            res.json({
                empty: false
            })
        }
    })
})

//登成绩
router.post('/add_record', function(req, res, next) {
    recordModel.find({ sid: req.body.sid, cid: req.body.cid, time: req.body.time }, function(err, record) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            if (record.length === 0) {
                new recordModel({
                    sid: req.body.sid,
                    sname: req.body.sname,
                    cid: req.body.cid,
                    cname: req.body.cname,
                    teacher: req.body.teacher,
                    point: req.body.point,
                    time: req.body.time,
                    grade: req.body.grade
                }).save();
                res.json({
                    success: true
                })
            } else {
                res.json({
                    success: false
                })
            }
        }
    })
})

//添加课程
router.post('/add_course', function(req, res, next) {
    courseModel.find({ cid: req.body.cid }, function(err, record) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            if (record.length === 0) {
                let cancel = "";
                if (req.body.cancel === -1) {
                    cancel = false
                } else {
                    cancel = true
                }
                new courseModel({
                    cid: req.body.cid,
                    cname: req.body.cname,
                    teacher: req.body.teacher,
                    location: req.body.location,
                    point: req.body.point,
                    time: req.body.time,
                    suit_school: req.body.suit_school,
                    suit_grade: req.body.suit_grade,
                    cancel: cancel
                }).save();
                res.json({
                    success: true
                })
            } else {
                res.json({
                    success: false
                })
            }
        }
    })
})

//获得适合一个年级的所有课程
router.post('/get_course', function(req, res, next) {
    courseModel.find({ suit_grade: req.body.grade }, function(err, course) {
        if (err) {
            res.json({
                error: false
            })
        } else {
            res.json(course)
        }
    })
})

//更新系统信息
router.post('/update_sys', function(req, res, next) {
    systemModel.update({ notice: req.body.notice, choose: req.body.choose }, function(err, user) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//更新学生选课信息
router.post('/update_choose', function(req, res, next) {
    studentModel.update({ sid: req.body.sid }, { schedule: req.body.schedule }, function(err, user) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//获取全部学生信息
router.get('/get_all_student', function(req, res, next) {
    studentModel.find(function(err, student) {
        if (err) {
            res.json({
                error: true
            })
        } else {
            res.json(student);
        }
    })
})

//获取全部课程信息
router.get('/get_all_course', function(req, res, next) {
    courseModel.find(function(err, student) {
        if (err) {
            res.json({
                error: true
            })
        } else {
            res.json(student);
        }
    })
})

//删除学籍
router.post('/delete_student', function(req, res, next) {
    studentModel.deleteOne({ sid: req.body.sid }, function(err) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            recordModel.deleteMany({ sid: req.body.sid }, function(err) {
                if (err) {
                    res.json({
                        success: false
                    })
                } else {
                    res.json({
                        success: true
                    })
                }
            })
        }
    })
})

//删除课程
router.post('/delete_course', function(req, res, next) {
    courseModel.deleteOne({ cid: req.body.cid }, function(err) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            recordModel.deleteMany({ cid: req.body.cid }, function(err) {
                if (err) {
                    res.json({
                        success: false
                    })
                } else {
                    res.json({
                        success: true
                    })
                }
            })
        }
    })
})

//更新学籍信息
router.post('/update_student', function(req, res, next) {
    studentModel.update({ sid: req.body.sid }, {
        sname: req.body.sname,
        gender: req.body.gender,
        age: req.body.age,
        home: req.body.home,
        grade: req.body.grade,
        school: req.body.school, //学院
        class: req.body.class,
    }, function(err) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//更新课程信息
router.post('/update_course', function(req, res, next) {
    let cancel = "";
    if (req.body.cancel === 0) {
        cancel = true
    } else {
        cancel = false;
    }

    courseModel.update({ cid: req.body.cid }, {
        cid: req.body.cid,
        cname: req.body.cname,
        teacher: req.body.teacher,
        location: req.body.location,
        point: req.body.point,
        suit_school: req.body.suit_school,
        suit_grade: req.body.suit_grade,
        cancel: cancel
    }, function(err) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//更新成绩
router.post('/update_record', function(req, res, next) {
    recordModel.update({ sid: req.body.sid, cid: req.body.cid, time: req.body.time }, {
        grade: req.body.grade
    }, function(err) {
        if (err) {
            res.json({
                success: false
            })
        } else {
            res.json({
                success: true
            })
        }
    })
})

//获取一门课的信息
router.post('/get_one_course', function(req, res, next) {
    courseModel.find({ cid: req.body.cid }, function(err, course) {
        if (err) {
            res.json({
                error: true
            })
        } else {
            if (course.length === 0) {
                res.json({
                    empty: true
                })
            } else {
                res.json(course[0]);
            }
        }
    })
})

module.exports = router;