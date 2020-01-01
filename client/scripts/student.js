$(function() {
    var route = "home"; //页面路由

    //从链接中获取学号
    var url = location.href;
    var your_sid = url.substring(url.indexOf("sid") + 4);

    //获取当前系统时间
    var myDate = new Date();

    //存放你的个人信息
    var student = {};

    //存放你的所有成绩
    var scores = [];

    //存放你可以选的所有课
    var course = [];

    //存放系统信息
    var sys = {};

    //存放选课结果
    var new_schedule = [];

    //获取学生信息，用于初始渲染数据
    fetch("http://localhost:3000/get_student", {
        method: "POST",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            sid: your_sid
        })
    }).then(res => res.json()).then(res => {
        if (res.error) {
            alert("服务器错误");
        } else {
            student = res;
            new_schedule = res.schedule;

            //初始化渲染页面数据
            //home页面
            //顶端栏
            $("#sid").html(student.sid);
            $(".name").html(student.sname);

            //个人信息页面
            //时间
            let hour = myDate.getHours();

            //根据当前小时数动态显示欢迎语
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

            //入学时间=今日-入学年份的9月1日
            $("#days").html(getGapDays(student.grade + "-9-1"));

            //渲染主页面当前周数，秋季学期按9月1日开学计，春季学期按3月1日开学计
            if (myDate.getMonth() >= 8) { //如果当前月份为9-12月
                //getGapDays获取当前时间距离当前年份9月1日myDate.getFullYear() + "-9-1"的日期
                //除以周数就是当前周数
                $("#now_week").html(parseInt(getGapDays(myDate.getFullYear() + "-9-1") / 7))
            } else if (myDate.getMonth() <= 1) { //当前月份为1-2月
                $("#now_week").html(parseInt(getGapDays(myDate.getFullYear() - 1 + "-9-1") / 7))
            } else { //当前月份为3-8月
                $("#now_week").html(parseInt(getGapDays(myDate.getFullYear() + "-3-1") / 7))
            }

            //使用了闭包！
            //计算日期间隔的函数
            function getGapDays(start) {
                let startTime = new Date(start); // 开始时间
                let endTime = myDate; // 结束时间

                return Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24); //
            }


            //今日课程表中的时间
            let weekday = ["日", "一", "二", "三", "四", "五", "六"]; //填充星期的汉字
            $("#today_time").html(myDate.toLocaleDateString() + "&nbsp;&nbsp;星期" + weekday[myDate.getDay()]);

            //今日课程表
            //对应的时间
            let class_start_time = ["8:30", "9:20", "10:25", "11:15", "13:30", "14:20", "15:25", "16:15", "18:30", "19:20", "20:10", "21:00"];
            let class_end_time = ["9:15", "10:05", "11:10", "12:00", "14:15", "15:05", "16:10", "17:00", "19:15", "20:05", "20:55", "21:45"];
            //这个数组用于排序今天的课，因为数据中的课表顺序不能保证
            let today_course = new Array(5);
            for (let i = 0; i < student.schedule.length; i++) {
                for (let j = 0; j < student.schedule[i].time.length; j++) {
                    if (student.schedule[i].time[j].day === myDate.getDay()) {
                        today_course[(student.schedule[i].time[j].start + 1) / 2 - 1] = "<div class=\"today_course\">" + class_start_time[student.schedule[i].time[j].start - 1] + "-" + class_end_time[student.schedule[i].time[j].start + student.schedule[i].time[j].long - 2] + "&nbsp;&nbsp;&nbsp;&nbsp;" + student.schedule[i].cname + "&nbsp;&nbsp;" + student.schedule[i].teacher + "&nbsp;&nbsp;" + student.schedule[i].location + "</div>";
                        break;
                    }
                }
            }

            //添加课程进入首页的课表中
            for (let x in today_course) {
                $(".home_course_block").append(today_course[x]);
            }

            //获取教务通知，并渲染
            fetch("http://localhost:3000/get_notice").then(res => res.json()).then(res => {
                if (!res.request) {
                    $("#notice_content").html("网络故障，请稍后再试")
                } else {
                    sys = res;
                    $("#notice_content").html(res.value[0].notice);
                }
            })

            //profile页面
            //学籍信息
            $("#profile_sid").html(student.sid);
            $("#profile_sname").html(student.sname);
            $("#profile_gender").html(student.gender === 0 ? "男" : "女");
            $("#profile_age").html(student.age);
            $("#profile_home").html(student.home);
            $("#profile_grade").html(student.grade);
            $("#profile_school").html(student.school);
            $("#profile_class").html(student.class);

            //修改课程表（包括选课页面两个页面的）
            for (let i = 0; i < student.schedule.length; i++) {
                for (let j = 0; j < student.schedule[i].time.length; j++) {
                    //设置课表内容（个人信息页面）
                    $("#course_" + student.schedule[i].time[j].day + "_" + student.schedule[i].time[j].start)
                        .html(student.schedule[i].cname + "<br>（" + student.schedule[i].teacher + "）<br>" + student.schedule[i].location)
                        .attr("class", "course")
                        .attr("rowspan", student.schedule[i].time[j].long);

                    //设置课表内容（选课页面）
                    $("#now_course_" + student.schedule[i].time[j].day + "_" + student.schedule[i].time[j].start)
                        .html(student.schedule[i].cname + "<br>（" + student.schedule[i].teacher + "）<br>" + student.schedule[i].location)
                        .attr("class", "course")
                        .attr("rowspan", student.schedule[i].time[j].long);

                    //删除多余的空格
                    for (let k = 1; k < student.schedule[i].time[j].long; k++) {
                        $("#course_" + student.schedule[i].time[j].day + "_" + (student.schedule[i].time[j].start + k))
                            .remove();
                        $("#now_course_" + student.schedule[i].time[j].day + "_" + (student.schedule[i].time[j].start + k))
                            .remove();
                    }

                }
            }

            //成绩页面初始渲染
            //根据你的年级，渲染按钮个数
            for (let i = student.grade; i <= myDate.getFullYear(); i++) {
                $("#term_button_block").append("<button class=\"term_button\">" + i + "</button>");
            }

            //成绩概览图表
            var all_score_chart = echarts.init(document.getElementById("all_score_chart"));
            //成绩概览的数据
            var x_data = new Array();
            var y_data = [];

            for (let i = student.grade; i <= myDate.getFullYear(); i++) {
                x_data.push(i + "");
            }

            //获取成绩的数据
            fetch("http://localhost:3000/get_score", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    year: -1,
                    sid: student.sid
                })
            }).then(res => res.json()).then(res => {
                //将成绩按照echart的格式组装
                scores = res;
                y_data = allScore(res);
                let sum = {};
                let num = {};
                for (let i = student.grade; i <= myDate.getFullYear(); i++) {
                    sum[i + ""] = 0;
                    num[i + ""] = 0;
                }
                for (let i = 0; i < res.length; i++) {
                    num[res[i].time + ""] += 1;
                    sum[res[i].time + ""] += res[i].grade;
                }
                for (let i = student.grade; i <= myDate.getFullYear(); i++) {
                    y_data[i - student.grade] = sum[i + ""] / num[i + ""];
                }
            }).then(res => {
                //组装最后的数据
                var all_score_option = {
                        tooltip: {},
                        xAxis: {
                            type: "category",
                            boundaryGap: false,
                            data: x_data
                        },
                        yAxis: {
                            type: "value",
                            scale: true
                        },
                        series: [{
                            name: "成绩",
                            type: "line",
                            areaStyle: {},
                            data: y_data
                        }]
                    }
                    //渲染图标
                all_score_chart.setOption(all_score_option);
            })

            //获取可以选的所有课
            fetch("http://localhost:3000/get_course", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    grade: student.grade
                })
            }).then(res => res.json()).then(res => {
                course = res;
                if (!sys.value[0].choose) {
                    $("#availiable_course_title").html("未到选课时间");
                } else {
                    //渲染可选课程表格
                    for (let i = 0; i < course.length; i++) {
                        let new_tr = "<tr>" +
                            "<td>" + course[i].cid + "</td>" +
                            "<td>" + course[i].cname + "</td>" +
                            "<td>" + course[i].teacher + "</td>" +
                            "<td>" + course[i].point + "</td>" +
                            "<td>" + course[i].location + "</td>" +
                            "<td>"
                            //循环拼接所有上课时间
                        for (let j = 0; j < course[i].time.length; j++) {
                            new_tr += "星期" + weekday[course[i].time[j].day] + "&nbsp;&nbsp;" + course[i].time[j].start + "-" + (course[i].time[j].start + course[i].time[j].long - 1) + "节&nbsp;&nbsp;";
                        }

                        //拼接按钮
                        new_tr += "</td>" +
                            "<td>" +
                            "<button class=\"choose_course_button\" id=\"" + course[i].cid + "\">选课</button>" +
                            "<button class=\"cancel_course_button\" id=\"" + course[i].cid + "\">退课</button>" +
                            "</td>" +
                            "</tr>";

                        $("#availiable_course tbody").append(new_tr)
                    }
                }
            })
        }

        //计算日期间隔的函数，使用了闭包
        function getGapDays(start) {
            let startTime = new Date(start); // 开始时间
            let endTime = myDate; // 结束时间

            return Math.floor((endTime - startTime) / 1000 / 60 / 60 / 24);
        }

        //计算平均加权成绩的函数，使用了闭包
        function allScore(year) {
            let sum = {};
            let num = {};
            let result = [];
            //num存放学分，sum存放加权成绩
            for (let i = student.grade; i <= myDate.getFullYear(); i++) {
                sum[i + ""] = 0;
                num[i + ""] = 0;
            }
            for (let i = 0; i < res.length; i++) {
                num[res[i].time + ""] += res[i].point;
            }
            for (let i = 0; i < res.length; i++) {
                sum[res[i].time + ""] += res[i].grade * res[i].point / num[res[i].time + ""];
            }
            for (let i = student.grade; i <= myDate.getFullYear(); i++) {
                result[i - student.grade] = sum[i + ""];
            }

            return result;
        }
    })

    //退出登录
    $(".quit").click(function() {
        location.href = "http://localhost:5500/../pages/login.html";
    })

    //切换显示
    $(".side_block div").click(function() {
        $("." + route + "_block").css("display", "none");
        $("#to_" + route).css("background-color", "#FFFFFF");
        route = $(this).attr("id").substring($(this).attr("id").indexOf("_") + 1);
        $("." + route + "_block").css("display", "flex");
        $("#to_" + route).css("background-color", "#cdcdce");
    })

    //回到顶部按钮
    $("#return_top").click(function() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    })

    //profile页面监听
    //修改密码
    $("#edit_password_submit").click(function(e) {
        e.preventDefault();
        $(".err").html("");

        //验证输入合法性
        let old_pass = $("#old_pass_input").val();
        let new_pass = $("#new_pass_input").val();
        let new_pass_again = $("#new_pass_again_input").val();

        //显示各种错误
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
        } else { //输入合法，验证密码正确性
            fetch("http://localhost:3000/student_check", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: student.sid,
                    password: old_pass
                })
            }).then(res => res.json()).then(res => {
                if (!res.request) {
                    $("#edit_pass_err").html("网络错误")
                    return false;
                } else if (!res.checked) {
                    $("#edit_pass_err").html("密码错误")
                    return false;
                } else { //密码验证正确，更新密码
                    fetch("http://localhost:3000/edit_user_password", { //URL
                        method: "POST", //请求类型
                        headers: { //请求头
                            "content-Type": "application/json"
                        },
                        body: JSON.stringify({ //请求体：JSON序列化字符串
                            sid: student.sid,
                            newpass: new_pass
                        })
                    }).then(res => res.json()).then(res => { //第一个回调：将结果转为JSON对象
                        if (res.success) { //第二个回调：执行业务逻辑
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

    //score页面监听
    //使用JQon方法，监听尚未term_button_block中已添加和尚未添加的button元素的click事件
    $("#term_button_block").on("click", "button", function(e) {
        //雷达图的数据
        var legend_data = [{ name: "成绩", max: 100 }];
        var indicator = [];
        var score_data = [];

        e.preventDefault();
        //清除之前的课表、雷达图
        $("#term_score tbody tr").remove();

        //获取点击的年份
        let choose_year = parseInt($(this).html());

        //渲染标题
        $("#choose_term_title").html("选择学期：" + choose_year)

        //渲染成绩表格
        for (let i = 0; i < scores.length; i++) {
            if (scores[i].time === choose_year) {
                //获得该课程信息
                $("#term_score tbody").append(
                    "<tr>" +
                    "<td>" + scores[i].cid + "</td>" +
                    "<td>" + scores[i].cname + "</td>" +
                    "<td>" + scores[i].teacher + "</td>" +
                    "<td>" + scores[i].point + "</td>" +
                    "<td>" + scores[i].grade + "</td>" +
                    "/<tr>"
                )

                //填充雷达图数据
                indicator.push({
                    name: scores[i].cname,
                    max: 100
                });

                score_data.push(scores[i].grade);
            }
        }

        //声明雷达图
        var year_score = echarts.init(document.getElementById("term_score_chart"));

        var year_score_options = {
            tooltip: {},
            legend: { //顶端图例，此处只有一个就是成绩折线
                data: legend_data
            },
            radar: { //雷达图的各个顶点的数据
                name: {
                    textStyle: { //顶点文本的样式
                        color: '#fff',
                        backgroundColor: '#999',
                        borderRadius: 3,
                        padding: [3, 5]
                    }
                },
                indicator: indicator //各个顶点的数据，包括名称和最大值
            },
            series: [{ //雷达图的折线数据
                name: choose_year + "成绩", //鼠标悬浮时显示的数据名称
                type: 'radar', //雷达图
                areaStyle: { normal: {} }, //折线内部填充
                data: [{
                    value: score_data //只有一条
                }]
            }]
        }

        year_score.setOption(year_score_options);
    })

    //choose页面监听
    //监听选课、退课按钮
    $("#availiable_course").on("click", "button", function(e) {
        e.preventDefault();

        let type = $(this).attr("class");
        let cid = $(this).attr("id");
        //选课按钮
        if (type === "choose_course_button") {
            if (exist(cid) !== -1) {
                alert("课程已存在")
            } else if (conflict(cid)) {
                alert("时间冲突，冲突课程编号：" + cid);
            } else { //课程未选过且时间不冲突
                let temp = {};
                for (let i = 0; i < course.length; i++) {
                    if (course[i].cid === cid) {
                        temp = course[i];
                        new_schedule.push(course[i]); //加入选课结果
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
                        //判断要在前面还是后面添加格子
                        if (day === 0) {
                            direction = "after";
                        } else {
                            direction = "before";
                        }

                        //判断对应格子是否已经被删除了，如果删除了，循环选择下一个可以添加的位置
                        while ($("#now_course_" + day + "_" + (temp.time[i].start + k)).length < 0) {
                            day += 1;
                            if (day > 6) {
                                day = 0;
                                direction = after;
                            }
                        }

                        if (direction === "before") {
                            $("#now_course_" + day + "_" + (temp.time[i].start + k)) //在之前添加空格子
                                .before("<td class=\"no_course\" id=\"now_course_" + temp.time[i].day + "_" + (temp.time[i].start + k) + "\"></td>");

                        } else {
                            $("#now_course_" + day + "_" + (temp.time[i].start + k)) //在之后添加空格子
                                .after("<td class=\"no_course\" id=\"now_course_" + temp.time[i].day + "_" + (temp.time[i].start + k) + "\"></td>");

                        }
                    }
                }
            } else {
                alert("未选择该课程")
            }
        }

        //判断课程是否存在的函数，不存在返回-1，存在返回下标，使用了闭包
        function exist(cid) {
            for (let i = 0; i < new_schedule.length; i++) {
                if (new_schedule[i].cid === cid) {
                    return i;
                }
            }
            return -1;
        }

        //判断是否时间冲突的函数，使用了闭包
        function conflict(cid) {
            //先抓取课程信息
            let temp = {};
            for (let i = 0; i < course.length; i++) {
                if (course[i].cid === cid) {
                    temp = course[i];
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

    //提交选课
    $("#choose_submit_button").click(function(e) {
        e.preventDefault();

        if (!sys.value[0].choose) {
            return false;
        } else { //更新选课信息的网络请求
            fetch("http://localhost:3000/update_choose", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: student.sid,
                    schedule: new_schedule
                })
            }).then(res => res.json()).then(res => {
                if (res.success) {
                    $("#choose_submit_tip").html("成功")
                } else {
                    $("#choose_submit_tip").html("网络错误")
                }
            })
        }
    })
})