$(function() {
    //存储当前页面状态
    var login_style = "student";

    //切换用户登录的按钮，只有当前状态为管理员登录时生效
    $("#user_login_title").click(function() {
        if (login_style === "student") {
            return;
        } else {
            //改变样式和页面状态
            $(this).css("border-bottom-style", "solid")
            $(this).css("color", "black");
            $("#admin_login_title").css("border-bottom-style", "none")
            $("#admin_login_title").css("color", "rgb(128, 127, 127)")
            $("#username_tip").html("学号");
            $("#forget_password").html("忘记密码?");
            login_style = "student";
        }
    });

    //切换管理员登录的按钮，只有当前状态为用户登录时生效
    $("#admin_login_title").click(function() {
        if (login_style === "admin") {
            return;
        } else {
            $(this).css("border-bottom-style", "solid")
            $(this).css("color", "black");
            $("#user_login_title").css("border-bottom-style", "none")
            $("#user_login_title").css("color", "rgb(128, 127, 127)")
            $("#username_tip").html("管理员账号");
            $("#forget_password").html("");
            login_style = "admin";
        }
    });

    //注册按钮响应，显示注册block，隐藏登录block
    $("#regist").click(function() {
        $(".login_block").css("display", "none");
        $(".regist_block").css("display", "block");
    })

    //从注册返回
    $("#return").click(function() {
        $(".regist_block").css("display", "none");
        $(".login_block").css("display", "block");
    })

    //忘记密码按钮
    $("#forget_password").click(function() {
        if ($("#forget_password").html() === "忘记密码？") {
            $("#forget_password").html("请联系管理员老师重置密码")
        } else {
            $("#forget_password").html("忘记密码？")
        }
    })

    //登录按钮
    $("#login_button").click(function(e) {
        //阻止表单提交的默认刷新页面
        e.preventDefault();

        //先置错误信息为空
        $("#login_err").html("");

        //合法性判断
        let input_username = $("#username").val();
        let input_password = $("#password").val()

        //判断是否为空
        if (input_username === "") {
            $("#login_err").html("用户名不能为空")
            return false;
        } else if (input_password === "") {
            $("#login_err").html("密码不能为空")
            return false;
        }

        //使用了Promise！
        //验证账户密码
        var p = new Promise(function(resolve, reject) {
            //验证密码的网络请求
            fetch("http://localhost:3000/" + login_style + "_check", {
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: input_username,
                    password: input_password
                })
            }).then(res => res.json()).then(res => { //使用了回调！后面不再赘述
                if (!res.request) { //服务器出错
                    $("#login_err").html("网络错误，请稍后再试")
                    reject(false);
                } else if (!res.checked) { //验证失败
                    $("#login_err").html("用户名或密码错误")
                    reject(false)
                } else { //验证成功
                    resolve(true)
                }
            })
        }).then(function(res) { //验证成功，跳转页面
            $(".container").css("display", "block"); //显示加载动画
            setTimeout(function() {
                    location.href = "http://localhost:5500/../pages/" + login_style + ".html?sid=" + input_username;
                }, 200) //延迟200毫秒跳转至学生页面，携带sid参数
        }).catch(function(res) { //验证失败，拒绝响应，什么也不做
            return false;
        })
    })

    //注册按钮
    $("#regist_button").click(function(e) {
        //阻止点击按钮的默认刷新响应
        e.preventDefault();

        //先置错误提示信息为空
        $(".err").html("");

        //合法性判断
        let new_username = $("#new_username").val();
        let new_password = $("#new_password").val();

        //判断是否为空
        if (new_username === "") {
            $("#new_username_err").html("用户名不能为空")
            return false;
        } else if (new_password === "") {
            $("#new_password_err").html("密码不能为空")
            return false;
        }

        //密码长度必须为6位及以上
        if (new_password.length <= 5) {
            $("#new_password_err").html("密码必须为至少6位")
            return false;
        }

        //使用了Promise！
        //查询用户是否已经注册
        let p = new Promise(function(resolve, reject) {
            $(".container").css("display", "block"); //显示一个加载动画
            fetch("http://localhost:3000/student_check", { //验证用户是否存在
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: new_username,
                    password: new_password
                })
            }).then(res => res.json()).then(res => {
                if (!res.request) { //服务器或数据库错误
                    $("#regist_err").html("网络错误，请稍后再试");
                    reject(false);
                } else if (!res.rejest) { //学籍未注册
                    $("#regist_err").html("学籍未注册，请联系教务老师");
                    reject(false);
                } else if (res.isExist) { //用户已存在
                    $("#regist_err").html("用户已存在");
                    reject(false);
                } else { //可以注册
                    resolve(true);
                }
            })
        }).then(function(res) { //必须等待验证用户是否可以注册后，才可以增加用户
            fetch("http://localhost:3000/add_user", { //增加用户，并跳转界面
                method: "POST",
                headers: {
                    "content-Type": "application/json"
                },
                body: JSON.stringify({
                    sid: new_username,
                    password: new_password
                })
            }).then(res => res.json()).then(res => {
                if (!res.request) { //增加失败
                    $("#regist_err").html("网络错误，请稍后再试");
                    return false;
                } else {
                    setTimeout(function() {
                            location.href = "http://localhost:5500/../pages/student.html?sid=" + new_username;
                        }, 200) //延迟200ms跳转页面
                }
            })
        }).catch(function(res) { //无论上述过程中抛出任何异常，都将动画隐藏
            $(".container").css("display", "none");
            return false;
        })
    });
})