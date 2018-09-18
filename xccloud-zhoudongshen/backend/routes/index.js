module.exports = function (_conn,redisclient) {

    var express = require('express');
    var request = require('request');
    var crypto = require('crypto');
    var router = express.Router();
    var appid ="wx27c23f345c637029";
    var appsecret = "48a6576e53f154483c5064d6427838c9" ;
    var ip ="zhoudongshen.jnaw.top";
    

    /* GET home page. */
    /**

     * @api {get} /login/:json 请求登陆页面
     * @apiName GetLogin
     * @apiGroup index
     *
     *  @apiSuccess {json}  返回登陆页面视图
     */
    router.get('/login', function (req, res, next) {
        if(req.session.user){
            res.redirect("/web-pc");
            return;
        }
        res.render("login.art");
    });
    /**
     * @api {get} /logout/:json 请求首页
     * @apiName GetLogout
     * @apiGroup index
     *
     * @apiSuccess {json}  session失效
     */
    router.get('/logout', function (req, res, next) {

        req.session.destroy();
        res.redirect("/login");
    });

    /**
     * @api {get} /main/:json 请求首页
     * @apiName GetMain
     * @apiGroup index
     *
     * @apiSuccess {json}  返回首页视图
     */
    router.get('/main',function(req,res,next){
        /**
         * 需要session验证
         */
        if(req.session.user){res.render("index.art",{userName:req.session.user});}
        else {res.redirect("/login");}
    });

    /**
     * @api {post} /checkUser/:json 验证登陆信息
     * @apiName PostCheckUser
     * @apiGroup index
     * @apiParam {String} username 用户名
     * @apiParam {String} password 密码
     * @apiSuccess {json}  返回验证信息
     */
    router.post('/checkUser',function(req,res,next){
        _conn.query({
            sql: "SELECT user_name FROM sys_user WHERE user_name=:username AND user_pwd=:password",
            params: {
                username: req.body.username,
                password: req.body.password,
            }
        }, function (err, rows, fieds) {
            if (err) {
                return res.send("err!!!!!!!!");
            }
            if(req.session.user){
                res.send("already login!!!!!");
            } else{
                if(rows.length>0){
                    req.session.user = rows;
                    res.send({data: "success"});
                }
                else{
                    res.send({data: "failed"});
                }
            }
        });
    });


    router.get('/testDB', function (req, res, next) {
        _conn.query("select * from paintings;", function (err, rows, fieds) {
            if (err) {
                console.log(err);
            }
            res.send(fieds);
        });
    });

    router.get('/wx-redirect',function(req,res,next){
        var redirectUrl = "https://"+ip+"/signin/";
        if (req.query.plugin != undefined && req.query.plugin != null) {
            redirectUrl = redirectUrl + "?plugin=" + req.query.plugin + "&param=" + req.query.param;
        }
        var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+appid+"&redirect_uri="+encodeURIComponent(redirectUrl)+"&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";
        console.log(url);
        res.redirect(url);
    });

	var getUserInfo =function(req,res,next){
        	request('https://api.weixin.qq.com/sns/userinfo?access_token=' + req.session.access_token + '&openid='+req.session.openid +'&lang=zh_CN', function (error, response, body) {
           	 if (error)
                	throw error;

            	var userInfo = JSON.parse(body);//用户的信息
            	req.session.wx_userInfo=userInfo;
		console.log("*33333333"+req.session.wx_userInfo.nickname);


            	//查询数据库该用户是否存在
        	_conn.query({sql:"Select * FROM weixin_user WHERE openid='"+req.session.openid+"';"},function(err,rows,field){
            	if(err){
              		return   res.send("err!!!!!!!!");
            	}

	   
            	if(rows.length<=0){//未存在
	       //插入用户信息到数据库

                	var sql = "INSERT INTO weixin_user (follow_time,openid,img,nickname) VALUES (:follow_time,:openid,:headimgurl,:nickname);";

                	_conn.query({
                   	 	sql:sql,
                    		params:{
                        	follow_time:new Date(),
                        	openid: req.session.openid,
                        	headimgurl: req.session.wx_userInfo.headimgurl,
                        	nickname: req.session.wx_userInfo.nickname
                   		 }
                	},function(err,rows1,field){
                   
                    		if(err){
                     			 return  res.send("err!!!!!!!!");
                    		}
		 			console.log("insertId "+ rows1.insertId);
					req.session.wx_userInfo.user_id=rows1.insertId;
				        return res.redirect("/web-weixin");
	
               		 });

           	 }
		else{//如果存在

                	if(rows[0].is_able==1){//如果不可用
                   		return  res.render("jinyong.art");		
                	}
			req.session.wx_userInfo.user_id=rows[0].id;

			console.log("用户结果集："+ rows);
			console.log("登录返回值："+ rows);
			 return res.redirect("/web-weixin");

            	}
	        	
	

       	 		});

        	});

   	 }	
    router.get('/signin',function(req,res,next){
        if (req.query.plugin != undefined && req.query.plugin != null) {
            req.session.redirect = {
                plugin: req.query.plugin,
                param: req.query.param
            };
        }
        request('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + appsecret + '&code=' + req.query.code + '&grant_type=authorization_code', function (error, response, body) {
            if(error)
                throw error;
            console.log('web-body:', body); // Print the HTML for the Google homepage.
            var rtn_body = JSON.parse(body);
            req.session.openid  = rtn_body.openid;
            req.session.access_token=rtn_body.access_token;

            //查询该用户是否已存在，若没有直接插入数据库调转页面，若该用户被禁用将跳到禁用页面
	
 	        getUserInfo (req,res,next);
 
		console.log("********"+req.session.wx_userInfo);
         

        });
	console.log("11111111"+req.session.wx_userInfo);

    });
    


    router.get('/weixin',function(req,res,next){

        //获取access_token
        redisclient.get("access_token", function (err, access_token){
            if(access_token == null){
                request("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+appsecret+"",function (error, response, body){
                    console.log('web-acct·',body);
                    var rtn_body=JSON.parse(body);
                    console.log(rtn_body.access_token);
                    redisclient.set("access_token", rtn_body.access_token, "EX", 7199);

                    redisclient.get("jsapi_token", function (err, jsapi_token) {
                        if(jsapi_token == null){
                            redisclient.get("access_token", function (err, access_token) {
                                request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+access_token+"&type=jsapi",function(error, response, body){
                                    console.log('web-jst1',body);
                                    var rtn_body=JSON.parse(body);
                                    redisclient.set("jsapi_token", rtn_body.ticket, "EX", 7199);
                                });
                            });
                        }

                    });
                });

            }else{
                redisclient.get("jsapi_token", function (err, jsapi_token) {
                    if(jsapi_token == null){

                        request("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+access_token+"&type=jsapi",function(error, response, body){
                            console.log('web-jst',body);
                            var rtn_body=JSON.parse(body);
                            redisclient.set("jsapi_token", rtn_body.ticket, "EX", 7199);
                        });

                    }
                });
            }


        });
        
	if(req.session.redirect){
        var plugin =req.session.redirect.plugin;
        var param = req.session.redirect.param;
        req.session.redirect=null;
	        res.render("index2.art",{redirect:true,plugin:plugin,param:param});
	}
	else{
		res.render("index2.art",{redirect:false,plugin:"home",param:0});
	}	
    });


    router.post('/getAPI',function (req, res, next) {




        var url = req.param("url");
        console.log(url);
        var noncestr = "123456";
        var timestamp = new Date().getTime().toString();
        timestamp = timestamp.substring(0, timestamp.length - 3);
        redisclient.get("jsapi_token", function (err, jsapi_token) {
            var string1 = "jsapi_ticket=" + jsapi_token + "&noncestr=" + noncestr + "&timestamp=" + timestamp + "&url=" + url;
            console.log(string1);
            var shasum = crypto.createHash('sha1');
            shasum.update(string1);
            var signature = shasum.digest('hex');
            console.log(signature);
            //openid->user.session
            console.log('wx_info8888',req.session.openid+"****");
            

	        res.send({
                noncestr: noncestr,
                timestamp: timestamp,
                signature: signature,
                            });
        })
    });

    router.get('/auth',function(req,res,next){
        var signature = req.param('signature');
        var timestamp = req.param('timestamp');
        var nonce = req.param('nonce');
        var echostr = req.param('echostr');
        var token = "weixin";
        var str1 = new Array(token,timestamp,nonce);
        var str2 = str1.sort().join("");
        var shasum = crypto.createHash('sha1');
        shasum.update(str2);
        var sgnt = shasum.digest('hex');
        if(sgnt==signature){
            res.send(echostr);
        }
        else{
            res.send(echostr);
        }
    });


    return router;
};
