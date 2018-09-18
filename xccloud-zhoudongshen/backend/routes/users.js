module.exports = function (_conn) {
  var express = require('express');
  var router = express.Router();

    /**
     * @api {get} /getUserList/:json 查询用户列表
     * @apiName GetGetUserList
     * @apiGroup users
     *
     * @apiParam {int} pageSize 每页显示的条数，必填
     * @apiParam {int} page 当前页数，必填
     *
     * @apiSuccess {json}  row 用户集合
     *
     */
  router.get('/getUserList', function (req, res, next) {

      var pageSize = req.param("pageSize");
      var currPage =req.param("page");
      var page = currPage==1?0:(currPage-1)*pageSize;

      _conn.query({

          sql: "SELECT * from sys_user  LIMIT " + page + ","+ pageSize + "; select count(id) as totalCount from sys_user",
          params: {
              page: page,
              pageSize: pageSize
          }
      }, function(err, rows, fieds) {

          // console.info(err);
          // console.info(rows);
          if (err) {
              res.render('login.ejs');
          }
          rows.push({currPage:currPage});
          res.send(rows);

      });
  });


    /**
     * @api {get} /getTelIsHave/:json 查询用户手机号是否已存在
     * @apiName GetGetUserList
     * @apiGroup users
     *
     * @apiParam {String} userTele 用户的手机号码
     *
     * @apiSuccess {json}  row 是否存在用户
     *
     */
    router.get('/getTelIsHave', function (req, res, next) {

        var phone = req.param("userTele");
        _conn.query({

            sql: "select * from sys_user where user_phone=:phone",
            params:{
                phone:phone,

            }

        }, function(err, rows, fieds) {
            if (err) {
                //res.render('login.ejs');
            }

            res.send(rows);


        });
    });


    /**
     * @api {post} /addUser/:json 添加用户
     * @apiName GetAddUser
     * @apiGroup users
     *
     * @apiParam {String} name 用户的名字
     * @apiParam {String} telephone 用户的手机号
     * @apiParam {String} password 用户的密码
     *
     * @apiSuccess {json}  row 添加成功失败
     *
     */
    router.post('/addUser', function (req, res, next) {

        _conn.query({
            sql: "INSERT INTO sys_user (user_name,user_phone,user_pwd) VALUES (:name,:phone,:pasword)",
            params: {

                name: req.body.name,
                phone: req.body.telephone,
                pasword: req.body.password,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);
            res.send(rows);
        });
    });

    /**
     * @api {get} /delUserById/:json 删除用户
     * @apiName GetDelUserById
     * @apiGroup users
     *
     * @apiParam {int} id 主键id
     *
     * @apiSuccess {json}  row 删除成功或者失败
     *
     */
    router.get('/delUserById',function(req, res, next){
        _conn.query({
            sql: "DELETE FROM sys_user WHERE id=:id ",
            params: {
                id: req.param("id"),

            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);
            res.send(rows);
        });
    });
   
    /**
     * @api {get} /selectById/:json 根据id查询用户
     * @apiName GetSelectByIdS
     * @apiGroup users
     *
     * @apiParam {int} id 主键id
     *
     * @apiSuccess {json}  row 用户信息
     *
     */
    router.get('/selectById', function (req, res, next) {

        var id = req.param("id");
        _conn.query({
            sql: "select * from sys_user where id=:id",
            params:{
                id:id

            }

        }, function(err, rows, fieds) {
            if (err) {
                //res.render('login.ejs');
            }

            res.send(rows);


        });
    });

    

     /**
     * @api {post} /updateUser/:json 修改用户信息
     * @apiName PostUpdateUser
     * @apiGroup users
     *
     * @apiParam {int} id 主键id
     * @apiParam {String} name 姓名
     * @apiParam {String} telephone 电话
     * @apiParam {String} password 密码
     *
     * @apiSuccess {json}  row 修改成功或者失败
     *
     */
    router.post('/updateUser', function (req, res, next) {

        _conn.query({
            sql: "UPDATE sys_user SET user_name=:name,user_phone=:phone,user_pwd=:pasword WHERE id=:id",
            params: {
                id:req.body.id,
                name: req.body.name,
                phone: req.body.telephone,
                pasword: req.body.password,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);
            res.send(rows);
        });
    });
 
    router.get('/follow',function(req,res,next){
        //console.log("cccccccccccccccccccc")
        //console.log(req.session.wx_userInfo)
        var uid =req.session.wx_userInfo.user_id;
        var eid =req.param("eid");
        var e_type_id=req.param("e_type_id");
        _conn.query({
            sql: "INSERT INTO following (uid,eid,e_type_id) VALUES (:uid,:eid,:e_type_id)",
            params:{
                uid: uid,
                eid: eid,
                e_type_id:  e_type_id
            }
        },function(err,rows,fields){
            if(err){
                throw err;
            }
            res.send({rows:rows});
            console.log("ROWS ADDED: "+rows.affectedRows);
        }); 
    }); 
        
        router.get('/unfollow',function(req,res,next){
            var uid =req.session.wx_userInfo.user_id;
            var eid =req.param("eid");
            var e_type_id=req.param("e_type_id");
            var sql = "DELETE FROM following WHERE uid ="+ uid +" AND eid = "+eid+ " AND e_type_id="+e_type_id+"; ";
            _conn.query({
                sql: sql
                
            },function(err,rows,fields){
                if(err){
                    throw err;
                }
                res.send({rows:rows,sql:sql});
                console.log("ROWS DELETED: "+rows.affectedRows+"********"+sql);
            });    
        
    });
        router.get('/followingList',function(req,res,next){
                var pageSize = req.param("pageSize");
                var keyword = req.param("keyword");
                var currPage =req.param("page");
                var uid=req.session.wx_userInfo.user_id;
                var page = currPage==1?0:(currPage-1)*pageSize;
      
                console.log(currPage+"*************************"+pageSize);
                var sql="SELECT f.*,IFNULL(st.type_name,'留言') type_name," 
                +"IFNULL(f.state,0) AS follow ,CASE WHEN f.e_type_id=5 THEN p.paintings_name WHEN f.e_type_id IN(6,7) THEN st1.type_name WHEN f.e_type_id=0 THEN '留言' ELSE tc.title END title,"
                +"CASE WHEN f.e_type_id=5 THEN p.paintings_content  WHEN f.e_type_id=0 THEN wm.content ELSE tc.content END content, " 
                +" CASE WHEN f.e_type_id=5 THEN p.create_time  WHEN f.e_type_id=0 THEN wm.create_time ELSE tc.creat_time END create_time, "
                + " CASE WHEN f.e_type_id=5 THEN p.paintings_state ELSE 1 END state2, "
                + "CASE WHEN f.e_type_id=5 THEN p.paintings_img  "
                + "WHEN f.e_type_id IN(6,7) THEN (SELECT p.paintings_img From paintings p LEFT JOIN paintings_type pt ON p.id = pt.paintings_id WHERE pt.type_id =f.eid  limit 0,1) ELSE tc.img_path END img "
                 + "FROM following f LEFT JOIN t_cms tc ON f.eid=tc.id "
                  + "LEFT JOIN weixin_message wm ON f.eid=wm.id "
                   + "LEFT JOIN paintings p ON f.eid=p.id"
                    +" LEFT JOIN sys_type st ON st.id=f.e_type_id"
                   + "  LEFT JOIN sys_type st1 ON f.eid=st1.id "
                   + "WHERE f.uid = "+uid+ ";";
                var sql1="select COUNT(*) as totalCount from following AS fl where fl.uid = "+uid+" ;";
                // if(typeof(keyword) != "undefined" ){
                //     sql+=" and (tc.title LIKE :keyword or tc.content LIKE :keyword) ";
                //     sql1+=" and (tc.title LIKE :keyword or tc.content LIKE :keyword) ";
                // }
                    //sql+=" ORDER BY create_time DESC limit 1,10 ;  ";
      
                console.log(sql + sql1);
                _conn.query({
                   // sql: "select tc.*,tu.name,st.type_name from t_cms tc LEFT JOIN t_user tu ON tc.creater_id = tu.id LEFT JOIN sys_type st ON tc.type_id=st.id ORDER BY tc.id DESC limit "+page+","+pageSize+" ;select count(id) as totalCount from t_cms",
      
                    sql:sql +sql1
      
                }, function(err, rows, fieds) {
                    if (err) {
                        //res.render('login.ejs');
                    }
                    rows.push({currPage:currPage});
                
		console.log(rows);    
		res.send(rows);
    
                });
            });

    /**
     * @api {get} /getUserInfo/:json 微信端查询用户信息
     * @apiName GetGetUserInfo
     * @apiGroup index
     * @apiParam {int} openId 微信唯一标识
     *
     * @apiSuccess {json}  row 用户信息
     */
    router.get('/getUserInfo', function (req, res, next) {
        console.log("22222222222222222");
        console.log("********openid: "+req.session.openid);

        var openId =req.session.openid;

        _conn.query({

            sql: "SELECT * from weixin_user where openid=:openId",
            params: {
                openId: openId  
            }
        }, function(err, rows, fieds) {
            // console.info(rows);
            if (err) {
                res.send("err!!!!!!!!");
               
            }

            res.send(rows);

        });
    });


    
    /**
     * @api {get} /getWxUserList/:json 查询微信用户列表
     * @apiName GetGetWxUserList
     * @apiGroup users
     *
     * @apiParam {int} pageSize 每页显示的条数，必填
     * @apiParam {int} page 当前页数，必填
     *
     * @apiSuccess {json}  row 微信用户结果集
     *
     */
    router.get('/getWxUserList', function (req, res, next) {

        var pageSize = req.param("pageSize");
        var currPage = req.param("page");
        var keyword = req.param("keyword");
        var page = currPage==1?0:(currPage-1)*pageSize;
        var sql1 = "SELECT * from weixin_user ";
        var sql2 = "select count(id) as totalCount from weixin_user"
        if(typeof(keyword) != "undefined" && keyword!=""){
            sql1+=" where nickname like :keyword ";
            sql2+="  where nickname like :keyword "   
        }
        sql1+=" limit "+page+","+pageSize+" ;";
        console.log(sql1+sql2)
        _conn.query({

            sql: sql1+sql2,
            params: {
                keyword:"%"+keyword+"%",
                
            }
        }, function(err, rows, fieds) {

            // console.info(rows);
            if (err) {
                res.send("err!!!!!!!!");
            }
            rows.push({currPage:currPage});
            res.send(rows);

        });
    });

    /**
     * @api {get} /changeIsable/:json 修改微信用户是否可用
     * @apiName GetChangeIsable
     * @apiGroup users
     *
     * @apiParam {int} id 微信用户id，必填
     * @apiParam {int} state 1：禁用/0：可用，必填
     *
     * @apiSuccess {json}  row 修改成功或失败
     *
     */
    router.get('/changeIsable', function (req, res, next) {
        var id = req.param("id");
        var state = req.param("state");
        _conn.query({
            sql: "update weixin_user set is_able=:state where id=:id ",
            params: {
                state: state,
                id: id
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);
            res.send(rows);
        });
    });

    /**
     * @api {get} /changeIdentity/:json 设置微信用户权限
     * @apiName GetChangeIdentity
     * @apiGroup users
     *
     * @apiParam {int} id 微信用户id，必填
     * @apiParam {int} identity 0：普通用户 1：管理员（可回复留言），必填
     *
     * @apiSuccess {json}  row 修改成功或失败
     *
     */
    router.get('/changeIdentity', function (req, res, next) {
        var id = req.param("id");
        var identity = req.param("identity");
        _conn.query({
            sql: "update weixin_user set identity=:identity where id=:id ",
            params: {
                identity: identity,
                id: id
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);
            res.send(rows);
        });
    });






    return router;
    
};
