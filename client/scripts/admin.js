$(function() {
    var route = "home"; //页面路由

    //获取当前系统时间
    var myDate = new Date();

    //存储系统信息
    var sys = {};

    //存储choose页面查询的学生信息及课程信息
    var choose_student = {};
    var choose_course = [];
    var new_schedule = [];

    //存储student页面数据
    var student = [];

    //存储course页面数据
    var course = [];

    //存储score页面数据
    var edit_score = [];
    var chart_score = [];

    //根据当前时间动态显示欢迎语
    let hour = myDate.getHours();
    if (hour <= 6 || hour >= 22) {
        $("#time").html("夜深了,");
    } else if (hour > 6 && hour < 11) {
        $("#time").html("早上好,");
    } else if (hour >= 11 && hour < 14) {
        $("#time").html("中午好,");
    } else if (hour >= 14 && hour < 19) {
        $("#time").html("下午好,");
    } else {
        $("#time").html("晚上好,");
    }

    //当前周数，秋季学期按9月1日开学计，春季学期按3月1日开学计
    if (myDate.getMonth() >= 8) {
        $("#now_week").html(parseInt(getGapDays(myDate.getFullYear() + "-9-1") / 7))
    } else if (myDate.getMonth() <= 1) {
        $("#now_week").html(parseInt(getGapDays(myDate.getFullYear() - 1 + "-9-1") / 7))
    } else {
        $("#now_week").html(parseInt(getGapDays(myDate.getFullYear() + "-3-1") / 7))
    }

    //拉取系统信息，渲染初始页面数据
    fetch("http://localhost:3000/get_notice").then(res => res.json()).then(res => {
        sys = res.value[0];

        //渲染home页面初始数据
        $("#edit_notice").html(sys.notice);

        //渲染choose页面选课情况
        if (sys.choose) {
            $("#choose_button").html("停止选课")
        } else {
            $("#choose_button").html("开始选课")
        }
    })

    //计算日期间隔的函数
    function getGapDays(start) {
        let startTime = new Date(start); // 开始时间
        let endTime = myDate; // 结束时间

        return Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24);
    }

    //退出登录
    $(".quit").click(function() {
        location.href = "http://localhost:5500/../pages/login.html";
    })

    //切换显示
    $(".side_block div").click(function() {
        //路由
        $("." + route + "_block").css("display", "none");
        $("#to_" + route).css("background-color", "#FFFFFF");
        route = $(this).attr("id").substring($(this).attr("id").indexOf("_") + 1);
        $("." + route + "_block").css("display", "flex");
        $("#to_" + route).css("background-color", "#cdcdce");

        if (route === "student") { //学生页面初始渲染
            fetch("http://localhost:3000/get_all_student").then(res => res.json()).then(res => {
                student = res;

                //清空原表
                $("#student_information tbody").html("");

                //渲染学生表
                for (let i = 0; i < student.length; i++) {
                    let new_tr = "<tr class=\"" + student[i].sid + "\">" +
                        "<td class=\"sid" + student[i].sid + "\">" + student[i].sid + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_sname " + student[i].sid + "\">" + student[i].sname + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_gender " + student[i].sid + "\">" + (student[i].gender === 0 ? "男" : "女") + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_age " + student[i].sid + "\">" + student[i].age + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_home " + student[i].sid + "\">" + student[i].home + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_school " + student[i].sid + "\">" + student[i].school + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_grade " + student[i].sid + "\">" + student[i].grade + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_class " + student[i].sid + "\">" + student[i].class + "</td>" +
                        "<td>" +
                        "<button class=\"delete_student_button " + student[i].sid + "\">删除</button>" +
                        "</td>" +
                        "</tr>";

                    $("#student_information tbody").append(new_tr)
                }

                //删除学籍
                $("#student_information").on("click", "button", function(e) {
                    e.preventDefault();

                    //获取点击的学生学号
                    let sid = $(this).attr("class").substring($(this).attr("class").indexOf(" ") + 1);

                    //删除学生的网络请求
                    fetch("http://localhost:3000/delete_student", {
                        method: "POST",
                        headers: {
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            sid: sid
                        })
                    }).then(res => res.json()).then(res => {
                        if (res.success) {
                            $("#add_student_err").html("成功")

                            //删除student数组中数据
                            for (let i = 0; i < student.length; i++) {
                                if (student[i].sid === sid) {
                                    student.splice(i, 1);
                                    break;
                                }
                            }

                            //删除表格中数据
                            $("#student_information tr." + sid).remove();
                        } else {
                            $("#add_student_err").html("网络错误")
                        }
                    })
                })

                //新增学籍
                //显示弹出框
                $("#add_student").click(() => {
                    ShowDiv('add_student_block', 'add_student_background')
                })

                //取消按钮
                $("#add_student_cancel").click(() => {
                    CloseDiv('add_student_block', 'add_student_background');
                })

                //确定按钮
                $("#add_student_submit").click(function(e) {
                    $("add_student_submit_err").html("");
                    e.preventDefault();

                    //构造一个新建学生的数据，并按格式拼接数据
                    let new_student = {};
                    new_student.sid = $("#add_student_sid").val();
                    new_student.sname = $("#add_student_sname").val();
                    if ($("#add_student_gender").val() === "男") {
                        new_student.gender = 0
                    } else if ($("#add_student_gender").val() === "女") {
                        new_student.gender = -1
                    }
                    new_student.age = $("#add_student_age").val();
                    new_student.home = $("#add_student_home").val();
                    new_student.school = $("#add_student_school").val();
                    new_student.grade = $("#add_student_grade").val();
                    new_student.class = $("#add_student_class").val();

                    //检查是否全部信息已经填写
                    for (let i in new_student) {
                        if (new_student[i] === "") {
                            console.log(new_student[i]);
                            $("#add_student_submit_err").html("请填写完整信息");
                            return false;
                        }
                    }

                    //检查学生是否已经存在
                    fetch("http://localhost:3000/get_student", {
                        method: "POST",
                        headers: {
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            sid: new_student.sid
                        })
                    }).then(res => res.json()).then(res => {
                        if (res.error) {
                            $("#add_student_submit_err").html("网络错误");
                            return false;
                        } else if (!res.empty) {
                            $("#add_student_submit_err").html("学籍已存在");
                            return false;
                        } else {
                            //不存在，将新数据上传至数据库
                            fetch("http://localhost:3000/add_student", {
                                method: "POST",
                                headers: {
                                    "content-Type": "application/json"
                                },
                                body: JSON.stringify(new_student)
                            }).then(res => res.json()).then(res => {
                                if (res.success) {
                                    $("#add_student_submit_err").html("成功");

                                    //更新本地数据
                                    student.push(new_student);

                                    //更新本地数据表格
                                    let new_tr = "<tr class=\"" + new_student.sid + "\">" +
                                        "<td class=\"" + new_student.sid + "\">" + new_student.sid + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_sname " + new_student.sid + "\">" + new_student.sname + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_gender " + new_student.sid + "\">" + (new_student.gender === 0 ? "男" : "女") + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_age " + new_student.sid + "\">" + new_student.age + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_home " + new_student.sid + "\">" + new_student.home + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_school " + new_student.sid + "\">" + new_student.school + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_grade " + new_student.sid + "\">" + new_student.grade + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_class " + new_student.sid + "\">" + new_student.class + "</td>" +
                                        "<td>" +
                                        "<button class=\"delete_student_button " + new_student.sid + "\">删除</button>" +
                                        "</td>" +
                                        "</tr>";

                                    $("#student_information tbody").append(new_tr)

                                    //定时消失
                                    setTimeout(function() {
                                        CloseDiv('add_student_block', 'add_student_background');
                                    }, 200)


                                } else {
                                    $("#add_student_submit_err").html("网络错误");
                                    return false;
                                }
                            })
                        }
                    })
                })

                //表格信息失去焦点，保存更改
                $("#student_information tbody").on("blur", "td:not(.sid)", function(e) {

                    let sid = $(this).attr("class").substring($(this).attr("class").indexOf(" ") + 1);
                    let type = $(this).attr("class").substring(5, $(this).attr("class").indexOf(" "));
                    let new_val = $(this).html();
                    if (type === "gender") {
                        if (new_val === "男") {
                            new_val = 0;
                        } else if (new_val === "女") {
                            new_val = 1;
                        }
                    } else if (type === "grade" || type === "class" || type === "age") {
                        new_val = +new_val;
                    }

                    //更新数据
                    for (let i = 0; i < student.length; i++) {
                        if (student[i].sid === sid) {
                            //如果没有修改，减少不必要的更新
                            if (student[i][type] === new_val) {
                                break;
                            }

                            //更新本地数据
                            student[i][type] = new_val;
                            //更新数据库
                            fetch("http://localhost:3000/update_student", {
                                method: "POST",
                                headers: {
                                    "content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    sid: student[i].sid,
                                    sname: student[i].sname,
                                    gender: student[i].gender,
                                    age: student[i].age,
                                    home: student[i].home,
                                    grade: student[i].grade,
                                    school: student[i].school,
                                    class: student[i].class,
                                })
                            }).then(res => res.json()).then(res => {
                                if (res.success) {
                                    $("#add_student_err").html("更改已保存")
                                    return true
                                } else {
                                    $("#add_student_err").html("网络错误，保存失败")
                                }
                            })
                        }
                    }
                })
            })
        } else if (route === "course") { //课程页面初始渲染
            fetch("http://localhost:3000/get_all_course").then(res => res.json()).then(res => {
                course = res;

                //清空原表
                $("#course_information tbody").html("");

                //渲染课程列表
                for (let i = 0; i < course.length; i++) {
                    let new_tr = "<tr class=\"" + course[i].cid + "\">" +
                        "<td class=\"sid" + course[i].cid + "\">" + course[i].cid + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_cname " + course[i].cid + "\">" + course[i].cname + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_teacher " + course[i].cid + "\">" + course[i].teacher + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_point " + course[i].cid + "\">" + course[i].point + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_suit_school " + course[i].cid + "\">" + course[i].suit_school + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_suit_grade " + course[i].cid + "\">" + course[i].suit_grade + "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_location " + course[i].cid + "\">" + course[i].location + "</td>" +
                        "<td  class=\"edit_time " + course[i].cid + "\">"

                    //循环拼接所有上课时间
                    let weekday = ["日", "一", "二", "三", "四", "五", "六"];
                    for (let j = 0; j < course[i].time.length; j++) {
                        new_tr += "星期" + weekday[course[i].time[j].day] + "&nbsp;&nbsp;" + course[i].time[j].start + "-" + (course[i].time[j].start + course[i].time[j].long - 1) + "节&nbsp;&nbsp;";
                    }

                    //拼接按钮
                    new_tr += "</td>" +
                        "<td contenteditable=\"true\" class=\"edit_cancel " + course[i].cid + "\">" + (course[i].cancel ? "是" : "否") + "</td>" +
                        "<td>" +
                        "<button class=\"delete_course_button " + course[i].cid + "\">删除</button>" +
                        "</td>" +
                        "</tr>";

                    $("#course_information tbody").append(new_tr)
                }

                //删除课程
                $("#course_information").on("click", "button", function(e) {
                    e.preventDefault();

                    //获取删除的课程cid
                    let cid = $(this).attr("class").substring($(this).attr("class").indexOf(" ") + 1);

                    //发送网络请求
                    fetch("http://localhost:3000/delete_course", {
                        method: "POST",
                        headers: {
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            cid: cid
                        })
                    }).then(res => res.json()).then(res => {
                        if (res.success) {
                            $("#add_course_err").html("成功")

                            //删除course数组中数据
                            for (let i = 0; i < course.length; i++) {
                                if (course[i].cid === cid) {
                                    course.splice(i, 1);
                                    break;
                                }
                            }

                            //删除表格中数据
                            $("#course_information ." + cid).remove();
                        } else {
                            $("#add_course_err").html("网络错误")
                        }
                    })
                })

                //新增学籍
                //显示弹出框
                $("#add_course").click(() => {
                    ShowDiv('add_course_block', 'add_course_background')
                })

                //取消按钮
                $("#add_course_cancel").click(() => {
                    CloseDiv('add_course_block', 'add_course_background');
                })

                //确定按钮
                $("#add_course_submit").click(function(e) {
                    $("add_course_submit_err").html("");
                    e.preventDefault();

                    //构造新课程的数据，并按格式添加信息
                    let new_course = {};
                    new_course.cid = $("#add_course_cid").val();
                    new_course.cname = $("#add_course_cname").val();
                    new_course.teacher = $("#add_course_teacher").val();
                    new_course.point = +$("#add_course_point").val();
                    new_course.suit_school = $("#add_course_suit_school").val();
                    new_course.suit_grade = $("#add_course_suit_grade").val();
                    new_course.location = $("#add_course_location").val();
                    new_course.cancel = -1;

                    //按格式拼接课程时间
                    let times = $("#add_course_time").val().split(" ");
                    let new_time = [];
                    for (let i = 0; i < times.length; i++) {
                        let time = times[i].split(",");
                        let one_time = {}
                        one_time.day = time[0];
                        one_time.start = time[1];
                        one_time.long = time[2];
                        new_time.push(one_time);
                    }

                    new_course.time = new_time;

                    //检查信息是否完整
                    for (let i in new_course) {
                        if (new_course[i] === "") {
                            $("#add_course_submit_err").html("请填写完整信息");
                            return false;
                        }
                    }

                    //查询课程是否存在
                    fetch("http://localhost:3000/get_one_course", {
                        method: "POST",
                        headers: {
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            cid: new_course.cid
                        })
                    }).then(res => res.json()).then(res => {

                        if (res.error) {
                            $("#add_course_submit_err").html("网络错误");
                            return false;
                        } else if (!res.empty) {
                            $("#add_course_submit_err").html("课程已存在");
                            return false;
                        } else {
                            //上传至数据库
                            fetch("http://localhost:3000/add_course", {
                                method: "POST",
                                headers: {
                                    "content-Type": "application/json"
                                },
                                body: JSON.stringify(new_course)
                            }).then(res => res.json()).then(res => {
                                if (res.success) {
                                    $("#add_course_submit_err").html("成功");

                                    //更新本地数据
                                    course.push(new_course);

                                    //更新课程表格
                                    let new_tr = "<tr class=\"" + new_course.cid + "\">" +
                                        "<td class=\"sid" + new_course.cid + "\">" + new_course.cid + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_cname " + new_course.cid + "\">" + new_course.cname + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_teacher " + new_course.cid + "\">" + new_course.teacher + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_point " + new_course.cid + "\">" + new_course.point + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_suit_school " + new_course.cid + "\">" + new_course.suit_school + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_suit_grade " + new_course.cid + "\">" + new_course.suit_grade + "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_location " + new_course.cid + "\">" + new_course.location + "</td>" +
                                        "<td \"class=\"edit_time " + new_course.cid + "\">"

                                    //循环拼接所有上课时间
                                    let weekday = ["日", "一", "二", "三", "四", "五", "六"];
                                    for (let j = 0; j < new_course.time.length; j++) {
                                        new_tr += "星期" + weekday[new_course.time[j].day] + "&nbsp;&nbsp;" + new_course.time[j].start + "-" + (new_course.time[j].start + new_course.time[j].long - 1) + "节&nbsp;&nbsp;";
                                    }

                                    //拼接按钮
                                    new_tr += "</td>" +
                                        "<td contenteditable=\"true\" class=\"edit_cancel " + new_course.cid + "\">" + (new_course.cancel ? "是" : "否") + "</td>" +
                                        "<td>" +
                                        "<button class=\"delete_course_button " + new_course.cid + "\">删除</button>" +
                                        "</td>" +
                                        "</tr>";

                                    $("#course_information tbody").append(new_tr)

                                    //定时消失
                                    setTimeout(function() {
                                        CloseDiv('add_course_block', 'add_course_background');
                                    }, 200)

                                } else {
                                    $("#add_course_submit_err").html("网络错误");
                                    return false;
                                }
                            })
                        }
                    })
                })

                //表格信息失去焦点，保存更改
                $("#course_information tbody").on("blur", " td:not(.cid)", function(e) {
                    let cid = $(this).attr("class").substring($(this).attr("class").indexOf(" ") + 1);
                    let type = $(this).attr("class").substring(5, $(this).attr("class").indexOf(" "));

                    let new_val = $(this).html();
                    if (type === "cancel") {
                        if (new_val === "是") {
                            new_val = 0;
                        } else if (new_val === "否") {
                            new_val = 1;
                        }
                    }

                    //更新数据
                    for (let i = 0; i < course.length; i++) {
                        if (course[i].cid === cid) {
                            //未做更改，减少不必要的更新
                            if (course[i][type] === new_val) {
                                break;
                            }

                            //更新本地数据
                            course[i][type] = new_val;
                            //更新数据库
                            fetch("http://localhost:3000/update_course", {
                                method: "POST",
                                headers: {
                                    "content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    cid: course[i].cid,
                                    cname: course[i].cname,
                                    teacher: course[i].teacher,
                                    location: course[i].location,
                                    point: course[i].point,
                                    suit_school: course[i].suit_school,
                                    suit_grade: course[i].suit_grade,
                                    cancel: course[i].cancel
                                })
                            }).then(res => res.json()).then(res => {
                                if (res.success) {
                                    $("#add_course_err").html("更改已保存")
                                    return true
                                } else {
                                    $("#add_course_err").html("网络错误，保存失败")
                                }
                            })
                        }
                    }
                })
            })
        }
    })

    //回到顶部按钮
    $("#return_top").click(function() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    })

    //修改教务通知
    $("#edit_notice_submit").click(function(e) {
        $(".err").html("");

        e.preventDefault();

        //更新最新的通知
        let new_notice = $("#edit_notice").html();
        sys.notice = new_notice;
        //更新教务信息
        fetch("http://localhost:3000/update_sys", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                notice: sys.notice,
                choose: sys.choose
            })
        }).then(res => res.json()).then(res => {
            if (res.success) {
                $("#edit_notice_err").html("成功")
            } else {
                $("#edit_notice_err").html("网络错误")
            }
        })
    })

    //修改密码
    $("#edit_password_submit").click(function(e) {
        e.preventDefault();
        $(".err").html("");

        //验证输入合法性
        let old_pass = $("#old_pass_input").val();
        let new_pass = $("#new_pass_input").val();
        let new_pass_again = $("#new_pass_again_input").val();

        if (old_pass === "") {
            $("#edit_pass_err").html("请输入旧密码")
            return false;
        } else if (new_pass === "") {
            $("#edit_pass_err").html("请输入新密码")
            return false;
        } else if (new_pass !== new_pass_again) {
            $("#edit_pass_err").html("两次输入密码不一致")
            return false;
        } else if (new_pass.length < 6) {
            $("#edit_pass_err").html("密码至少为6位")
            return false;
        } else { //输入合法，验证密码
            fetch("http://localhost:3000/admin_check", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: "admin",
                    password: old_pass
                })
            }).then(res => res.json()).then(res => {
                if (!res.request) {
                    $("#edit_pass_err").html("网络错误")
                    return false;
                } else if (!res.checked) {
                    $("#edit_pass_err").html("密码错误")
                    return false;
                } else { //密码正确，更新密码
                    fetch("http://localhost:3000/edit_admin_password", {
                        method: "POST",
                        headers: {
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            newpass: new_pass
                        })
                    }).then(res => res.json()).then(res => {
                        if (res.success) {
                            $("#edit_pass_err").html("成功")
                            $("#edit_password")[0].reset();
                        } else {
                            $("#edit_pass_err").html("网络错误")
                        }
                    })
                }
            })
        }
    })

    //choose页面监听
    //改变选课状态
    $("#choose_button").click(function(e) {
        $("#choose_err").html("");
        $(".container").css("display", "block"); //显示动画

        //更新选课状态信息
        fetch("http://localhost:3000/update_sys", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                notice: sys.notice,
                choose: !sys.choose
            })
        }).then(res => res.json()).then(res => {
            if (res.success) {
                sys.choose = !sys.choose;

                setTimeout(() => {
                    $(".container").css("display", "none"); //停止动画
                    if (sys.choose) {
                        $("#choose_err").html("选课已开始")
                        $("#choose_button").html("停止选课")
                    } else {
                        $("#choose_err").html("选课已结束")
                        $("#choose_button").html("开始选课")
                    }
                }, 1000);
            } else {
                $("#edit_notice_err").html("网络错误")
            }
        })
    })

    //查询选课信息
    $("#choose_query").click(function(e) {
        $("#choose_query_err").html("");
        e.preventDefault();

        let sid = $("#choose_student_sid").val();

        if (sid.length === 0) {
            $("#choose_query_err").html("请输入学号")
            return false;
        }

        //查询学生信息
        var p = new Promise(function(resolve, reject) {
            fetch("http://localhost:3000/get_student", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: sid
                })
            }).then(res => res.json()).then(res => {
                if (res.empty) {
                    reject(true);
                }

                if (res.error) {
                    reject(false);
                }
                console.log(1);

                choose_student = res;

                //获取到学生年级后，查询它可以选的课
                fetch("http://localhost:3000/get_course", {
                    method: "POST",
                    headers: {
                        "content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        grade: res.grade
                    })
                }).then(res => res.json()).then(res => {
                    if (res.error) {
                        reject(false);
                    }
                    choose_course = res;
                    resolve();
                })
            })

        }).then(function() {
            $("#choose_query_err").html("成功")

            //渲染课程数据
            let weekday = ["日", "一", "二", "三", "四", "五", "六"]; //填充星期的汉字

            for (let i = 0; i < choose_course.length; i++) {
                let new_tr = "<tr>" +
                    "<td>" + choose_course[i].cid + "</td>" +
                    "<td>" + choose_course[i].cname + "</td>" +
                    "<td>" + choose_course[i].teacher + "</td>" +
                    "<td>" + choose_course[i].point + "</td>" +
                    "<td>" + choose_course[i].location + "</td>" +
                    "<td>"
                    //循环拼接所有上课时间
                for (let j = 0; j < choose_course[i].time.length; j++) {
                    new_tr += "星期" + weekday[choose_course[i].time[j].day] + "&nbsp;&nbsp;" + choose_course[i].time[j].start + "-" + (choose_course[i].time[j].start + choose_course[i].time[j].long - 1) + "节&nbsp;&nbsp;";
                }

                //拼接按钮
                new_tr += "</td>" +
                    "<td>" +
                    "<button class=\"choose_course_button\" id=\"" + choose_course[i].cid + "\">选课</button>" +
                    "<button class=\"cancel_course_button\" id=\"" + choose_course[i].cid + "\">退课</button>" +
                    "</td>" +
                    "</tr>";

                $("#availiable_course tbody").append(new_tr)
            }

            //修改课程表
            for (let i = 0; i < choose_student.schedule.length; i++) {
                for (let j = 0; j < choose_student.schedule[i].time.length; j++) {
                    //设置课表内容
                    $("#now_course_" + choose_student.schedule[i].time[j].day + "_" + choose_student.schedule[i].time[j].start)
                        .html(choose_student.schedule[i].cname + "<br>（" + choose_student.schedule[i].teacher + "）<br>" + choose_student.schedule[i].location)
                        .attr("class", "course")
                        .attr("rowspan", choose_student.schedule[i].time[j].long);

                    //删除多余的空格
                    for (let k = 1; k < choose_student.schedule[i].time[j].long; k++) {
                        $("#now_course_" + choose_student.schedule[i].time[j].day + "_" + (choose_student.schedule[i].time[j].start + k))
                            .remove();
                    }

                }
            }

            return true;
        }).catch(function(res) {
            console.log(res);
            if (res) {
                $("#choose_query_err").html("学生不存在")
            } else {
                $("#choose_query_err").html("网络错误")
            }
            return false;
        })

        //绑定监听器
        //监听选课、退课按钮
        $("#availiable_course").on("click", "button", function(e) {
            e.preventDefault();

            let type = $(this).attr("class");
            let cid = $(this).attr("id");

            new_schedule = choose_student.schedule;

            //选课按钮
            if (type === "choose_course_button") {
                if (exist(cid) !== -1) {
                    alert("课程已存在")
                } else if (conflict(cid)) {
                    alert("时间冲突，冲突课程编号：" + cid);
                } else { //课程未选过且时间不冲突
                    let temp = {};
                    for (let i = 0; i < choose_course.length; i++) {
                        if (choose_course[i].cid === cid) {
                            temp = choose_course[i];
                            new_schedule.push(choose_course[i]); //加入选课结果
                            break;
                        }
                    }
                    //更新课表
                    for (let i = 0; i < temp.time.length; i++) {
                        $("#now_course_" + temp.time[i].day + "_" + temp.time[i].start)
                            .html(temp.cname + "<br>（" + temp.teacher + "）<br>" + temp.location)
                            .attr("class", "course")
                            .attr("rowspan", temp.time[i].long);

                        //删除多余的空格
                        for (let k = 1; k < temp.time[i].long; k++) {
                            $("#now_course_" + temp.time[i].day + "_" + (temp.time[i].start + k))
                                .remove();
                        }
                    }
                }
            } else {
                //退课按钮
                let index = exist(cid);
                if (index !== -1) {
                    let temp = new_schedule[index];
                    new_schedule.splice(index, 1); //删除课程

                    //重新渲染表格
                    for (let i = 0; i < temp.time.length; i++) {
                        //还原原课程格子的属性
                        $("#now_course_" + temp.time[i].day + "_" + temp.time[i].start).html("")
                            .attr("class", "no_course")
                            .attr("rowspan", "1")

                        //补回添加的空格,因为是按行绘制，利用向右侧节点（下一天同一时间）前插入新格子实现
                        //因此最右边（星期日）需要单独考虑
                        //注意：有可能前一天的对应时间格子已经被删除了，因此需要判断选择器是否选到了东西
                        for (let k = 1; k < temp.time[i].long; k++) {
                            let day = temp.time[i].day + 1;
                            let direction = "";
                            //确定格子的方向
                            if (day === 0) {
                                direction = "after";
                            } else {
                                direction = "before";
                            }

                            //检查前面的格子是否被删除了，如果是，找到下一个可插入的格子
                            while ($("#now_course_" + day + "_" + (temp.time[i].start + k)).length < 0) {
                                day += 1;
                                if (day > 6) {
                                    day = 0;
                                    direction = after;
                                }
                            }

                            if (direction === "before") {
                                $("#now_course_" + day + "_" + (temp.time[i].start + k))
                                    .before("<td class=\"no_course\" id=\"now_course_" + temp.time[i].day + "_" + (temp.time[i].start + k) + "\"></td>");

                            } else {
                                $("#now_course_" + day + "_" + (temp.time[i].start + k))
                                    .after("<td class=\"no_course\" id=\"now_course_" + temp.time[i].day + "_" + (temp.time[i].start + k) + "\"></td>");

                            }
                        }
                    }
                } else {
                    alert("未选择该课程")
                }
            }

            //判断课程是否存在的函数，不存在返回-1，存在返回下标
            function exist(cid) {
                for (let i = 0; i < new_schedule.length; i++) {
                    if (new_schedule[i].cid === cid) {
                        return i;
                    }
                }
                return -1;
            }

            //判断是否时间冲突的函数
            function conflict(cid) {
                //先抓取课程信息
                let temp = {};
                for (let i = 0; i < choose_course.length; i++) {
                    if (choose_course[i].cid === cid) {
                        temp = choose_course[i];
                        break;
                    }
                }

                //对每个时间冲突分析
                for (let i = 0; i < temp.time.length; i++) {
                    for (let j = 0; j < new_schedule.length; j++) {
                        for (let k = 0; k < new_schedule[j].time.length; k++) {
                            if (new_schedule[j].time[k].day === temp.time[i].day) { //日期相同
                                if (new_schedule[j].time[k].start === temp.time[i].start) { //开始时间相同
                                    return true;
                                } else if (temp.time[i].start >= new_schedule[j].time[k].start && new_schedule[j].time[k].start + new_schedule[j].time[k].long - 1 >= temp.time[i].start) {
                                    return true; //开始时间不同但是时间上重叠: 同时开课或晚于它开课时间但早于它下课时间开课
                                }
                            } else {
                                continue;
                            }
                        }
                    }
                }

                return false;
            }
        })

        //监听保存按钮
        $("#choose_save").click(function(e) {
            e.preventDefault();
            $("#choose_query_err").html("")

            if (choose_student === {}) {
                return false;
            } else { //保存选课信息
                fetch("http://localhost:3000/update_choose", {
                    method: "POST",
                    headers: {
                        "content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        sid: choose_student.sid,
                        schedule: new_schedule
                    })
                }).then(res => res.json()).then(res => {
                    if (res.success) {
                        $("#choose_query_err").html("保存成功")
                    } else {
                        $("#choose_query_err").html("网络错误")
                    }
                })
            }
        })
    })

    //查询课程成绩
    $("#add_score_submit").click(function(e) {
        e.preventDefault();

        let cid = $("#add_score_cid").val();

        if (cid === "") {
            return false;
        }

        //拉取成绩
        fetch("http://localhost:3000/get_course_score", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                cid: cid,
                year: -1
            })
        }).then(res => res.json()).then(res => {
            $("#add_title").html(res[0].cname);
            edit_score = res;
            //渲染成绩表格
            for (let i = 0; i < res.length; i++) {
                let new_tr = "<tr>" +
                    "<td>" + res[i].sid + "</td>" +
                    "<td>" + res[i].time + "</td>" +
                    "<td  contenteditable=\"true\" class=\"edit_grade " + res[i].sid + " " + res[i].time + " " + res[i].cid + "\">" + res[i].grade + "</td>" +
                    "</tr>"

                $("#add_score tbody").append(new_tr);
            }
        })
    })

    //监听新增按钮
    //显示弹出框
    $("#add_score_btn").click(() => {
        ShowDiv('add_score_block', 'add_score_background')
    })

    //取消按钮
    $("#add_score_cancel").click(() => {
        CloseDiv('add_score_block', 'add_score_background');
    })

    //确定按钮
    $("#add_score_submit_button").click(function(e) {
        $("#add_score_submit_err").html("");
        e.preventDefault();
        //新成绩数据，按格式拼接
        let new_score = {};

        new_score.sid = $("#add_score_sid").val();
        new_score.cid = $("#add_cid").val();
        new_score.time = +$("#add_score_time").val();
        new_score.grade = +$("#add_score_grade").val();

        //检查信息完整性
        for (let i in new_score) {
            if (new_score[i] === "" || new_score[i] === 0) {
                $("#add_score_submit_err").html("请填写完整信息");
                return false;
            }
        }

        //判断成绩是否已经存在
        fetch("http://localhost:3000/score_exist", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                sid: new_score.sid,
                cid: new_score.cid,
                time: new_score.time
            })
        }).then(res => res.json()).then(res => {
            if (!res.empty) {
                $("#add_score_submit_err").html("成绩已存在");
            } else {
                //抓取学生信息
                fetch("http://localhost:3000/get_student", {
                    method: "POST",
                    headers: {
                        "content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        sid: new_score.sid,
                    })
                }).then(res => res.json()).then(res => {
                    new_score.sname = res.sname;
                    //抓取课程信息
                    fetch("http://localhost:3000/get_one_course", {
                        method: "POST",
                        headers: {
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            cid: new_score.cid
                        })
                    }).then(res => res.json()).then(res => {
                        new_score.cname = res.cname;
                        new_score.teacher = res.teacher;
                        new_score.point = res.point;

                        //增加成绩
                        fetch("http://localhost:3000/add_record", {
                            method: "POST",
                            headers: {
                                "content-Type": "application/json"
                            },
                            body: JSON.stringify(new_score)
                        }).then(res => res.json()).then(res => {
                            if (res.success) {
                                $("#add_score_submit_err").html("成功");
                                setTimeout(function() {
                                    CloseDiv('add_score_block', 'add_score_background');
                                }, 200)

                                //更新本地数据
                                edit_score.push(new_score);
                                let new_tr = "<tr>" +
                                    "<td>" + new_score.sid + "</td>" +
                                    "<td>" + new_score.time + "</td>" +
                                    "<td  contenteditable=\"true\" class=\"edit_grade " + new_score.sid + " " + new_score.time + "\">" + new_score.grade + "</td>" +
                                    "</tr>"

                                $("#add_score tbody").append(new_tr);

                            } else {
                                $("#add_score_submit_err").html("网络错误");
                            }
                        })
                    })
                })
            }
        })

    })

    //成绩信息失去焦点，保存更改
    $("#add_score tbody").on("blur", "td", function(e) {
        let sid = $(this).attr("class").substring($(this).attr("class").indexOf(" ") + 1, $(this).attr("class").indexOf(" ") + 11);
        let time = +$(this).attr("class").substring($(this).attr("class").indexOf(" ") + 12, $(this).attr("class").indexOf(" ") + 16);
        let cid = $(this).attr("class").substring($(this).attr("class").indexOf(" ") + 17, );

        let new_val = +$(this).html();

        //更新数据
        for (let i = 0; i < edit_score.length; i++) {

            if (edit_score[i].cid === cid && edit_score[i].sid === sid && edit_score[i].time === time) {
                //减少不必要的更新
                if (edit_score[i].grade === new_val) {
                    break;
                }

                //更新本地数据
                edit_score[i].grade = new_val;
                console.log(edit_score);
                //更新数据库
                fetch("http://localhost:3000/update_record", {
                    method: "POST",
                    headers: {
                        "content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        sid: sid,
                        cid: cid,
                        time: time,
                        grade: new_val
                    })
                }).then(res => res.json()).then(res => {
                    console.log(res);
                    if (res.success) {
                        $("#add_score_tip").html("更改已保存")
                        return true
                    } else {
                        $("#add_score_tip").html("网络错误，保存失败")
                    }
                })
            }
        }
    })

    //显示图标的响应
    $("#stat_course_submit").click(function(e) {
        e.preventDefault();
        let cid = $("#stat_course_cid").val();

        //获取对应课程的成绩
        fetch("http://localhost:3000/get_course_score", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                cid: cid,
                year: -1,
            })
        }).then(res => res.json()).then(res => {
            chart_score = res;
            //按柱状图的格式拼接数据
            let chart_data = [0, 0, 0, 0, 0];
            //课程成绩段分布
            for (let i = 0; i < chart_score.length; i++) {
                if (chart_score[i].grade < 60) {
                    chart_data[0] += 1;
                } else if (chart_score[i].grade >= 60 && chart_score[i].grade < 70) {
                    chart_data[1] += 1;
                } else if (chart_score[i].grade >= 70 && chart_score[i].grade < 80) {
                    chart_data[2] += 1;
                } else if (chart_score[i].grade >= 80 && chart_score[i].grade < 90) {
                    chart_data[3] += 1;
                } else if (chart_score[i].grade >= 90 && chart_score[i].grade < 100) {
                    chart_data[4] += 1;
                }
            }

            var course_Chart = echarts.init(document.getElementById('score_stat_chart'));

            // 指定图表的配置项和数据
            var option = {
                tooltip: {},
                legend: {},
                xAxis: {
                    data: ["<60", "60-70", "70-80", "80-90", "90-100"]
                },
                yAxis: {},
                series: [{
                    name: '成绩',
                    type: 'bar',
                    data: chart_data
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            course_Chart.setOption(option);
        })
    })

    //按学生查询成绩显示图表
    $("#stat_student_submit").click(function(e) {
        e.preventDefault();
        let sid = $("#stat_student_sid").val();

        fetch("http://localhost:3000/get_score", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({
                sid: sid,
                year: -1,
            })
        }).then(res => res.json()).then(res => {
            chart_score = res;

            //雷达图的数据
            var legend_data = [{ name: "成绩", max: 100 }];
            var indicator = [];
            var score_data = [];

            //清除之前的课表、雷达图
            $("#term_score tbody tr").remove();

            //渲染成绩表格
            for (let i = 0; i < chart_score.length; i++) {
                //填充雷达图数据
                indicator.push({
                    name: chart_score[i].cname,
                    max: 100
                });

                score_data.push(chart_score[i].grade);
            }

            var course_Chart = echarts.init(document.getElementById('score_stat_chart'));

            // 指定图表的配置项和数据
            var option = {
                tooltip: {},
                legend: {
                    data: legend_data
                },
                radar: {
                    name: {
                        textStyle: {
                            color: '#fff',
                            backgroundColor: '#999',
                            borderRadius: 3,
                            padding: [3, 5]
                        }
                    },
                    indicator: indicator
                },
                series: [{
                    name: sid + "成绩",
                    type: 'radar',
                    areaStyle: { normal: {} },
                    data: [{
                        value: score_data
                    }]
                }]
            }

            // 使用刚指定的配置项和数据显示图表。
            course_Chart.setOption(option);
        })
    })

    //打开弹出层
    function ShowDiv(show_div, bg_div) {
        $("#" + show_div).css("display", "flex"); //显示窗口
        $("#" + bg_div).css("display", "block"); //显示灰色背景
        //设置背景宽度、高度与当前屏幕一致
        $("#" + bg_div).css("width", document.body.scrollWidth)
        $("#" + bg_div).css("height", $(document).height());
    };

    //关闭弹出层
    function CloseDiv(show_div, bg_div) {
        $("#" + show_div).css("display", "none"); //关闭窗口
        $("#" + bg_div).css("display", "none"); //关闭背景
    };
})