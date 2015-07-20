function ensureAuthenticated (origin, callback) {
    var credentials = {};
    if (getCookie("ts-author")) {
        var cookie = JSON.parse(getCookie("ts-author"));
        credentials.token = cookie.token;
        credentials.username = cookie.username;
        credentials.email = cookie.email;
        credentials.jira = cookie.jira;
    }
    if (!credentials.token) {
        loadLogin(origin);
    } else {
        $.post("/api/authenticate", {token: credentials.token}).done(function (data) {
            $.get("/api/users/" + credentials.username + "/groups/?token=" + credentials.token).done(function(result){
                console.log(result);
                var admin = false, canEnter = false, manager = false;
                result.forEach(function(field){
                    switch (field){
                        case "component-identifier-service-admin":
                            canEnter = true;
                            admin = true;
                            break;
                        case "component-identifier-service-manager":
                            canEnter = true;
                            manager = true;
                            break;
                        case "component-identifier-service-consumer":
                            canEnter = true;
                            break;
                    }
                });
                if (canEnter){
//                    console.log(data);
                    //credentials.username = data.username;
                    options.token = credentials.token;
                    options.username = credentials.username;
                    options.email = credentials.email;
                    options.jiraUser = credentials.jira;
                    options.adminUser = admin;
                    options.managerUser = manager;
                    callback(credentials);
                }else
                    loadLogin(origin);
            }).fail(function(){

            });
        }).fail(function () {
            loadLogin(origin);
        });
    }
}

function loadLogin(origin) {
    window.location.assign("login.html?return=" + origin);
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function loginWithCredentials(credentials, callback, rememberMe) {
    $.post("/api/login", credentials).done(function (data) {
        var token = data.token;
        var email = data.email;
        var cookieJson = {
            token: token,
            username: credentials.username
//            email: email
        };
        if (data.jira && data.jira.username){
            cookieJson.jira = {
                username: data.jira.username,
                password: data.jira.password
            };
        }
        cookieJson = JSON.stringify(cookieJson);
        $.notify("Authorized!", "success");
        var days = 7;
        if (rememberMe)
            days = 90;
        createCookie("ts-author",cookieJson,days);
        callback();
    }).fail(function (e) {
        $.notify("Not authorized", "error");
//        $("#forget-password-button").show();
//        $("#loginForm").addClass('has-error');
    });
}

function logout() {
//    $.post("/api/logout", {token: options.token}).done(function (data) {
//    }).fail(function () {
//    });
    options.token = null;
    options.username = "";
    options.email = "";
    createCookie("ts-author","{}",-1);
    $("#username-label").html("");
    window.location.reload();
}