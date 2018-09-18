module.exports = function (_conn) {
  var express = require('express');
  var router = express.Router();


    /**
     * @api {get} /getMessageList/:json PC端留言列表展示
     * @apiName GetGetMessageList
     * @apiGroup message
     * @apiParam {int} pageSize 每页显示的数量，必填
     * @apiParam {int} page 当前的页数，必填
     * @apiParam {String} keyword 关键字，用于查询，选填
     * @apiSuccess {json}  rows 留言列表和总的数量和当前页的集合
     *
     */
    router.get('/getMessageList', function (req, res, next) {
        var pageSize = req.param("pageSize");
        var keyword = req.param("keyword");
        var currPage =req.param("page");
        var page = currPage==1?0:(currPage-1)*pageSize;

        var sql1="SELECT wm.*,st.type_name,wu.nickname ,CASE WHEN wm.target_type=5 THEN p.paintings_name " +
            "WHEN wm.target_type=6 OR wm.target_type=7 THEN sst.type_name " +
            "WHEN wm.target_type=1 OR wm.target_type=2  OR wm.target_type=4 THEN tc.title ELSE '' END msg" +
            " FROM weixin_message wm LEFT JOIN sys_type st ON wm.target_type=st.id LEFT JOIN weixin_user wu ON wm.user_id=wu.id" +
            " LEFT JOIN paintings p ON wm.target_id=p.id LEFT JOIN t_cms tc ON wm.target_id=tc.id " +
            "LEFT JOIN sys_type sst ON sst.id=wm.target_id";

        var sql2="select count(id) as totalCount from weixin_message";

        if(typeof(keyword) != "undefined" && keyword!=""){
            sql1+=" where wm.content LIKE :keyword ";
            sql2+=" where content LIKE :keyword "
        }
        sql1+=" ORDER BY wm.top DESC, wm.top_time DESC, wm.id  DESC limit "+page+","+pageSize+" ;";

        _conn.query({

            sql:sql1+sql2,
            params:{
                keyword:"%"+keyword+"%"
            }

        }, function(err, rows, fieds) {
            if (err) {
                //res.render('login.ejs');
            }
            rows.push({currPage:currPage});
            res.send(rows);


        });
    });


    /**
     * @api {get} /deleteMessageById/:json 删除留言
     * @apiName GetDeleteMessageById
     * @apiGroup message
     * @apiParam {int} id 主键，必填
     * @apiSuccess {json}  rows 删除的记录数
     *
     */
    router.get('/deleteMessageById', function (req, res, next) {

        var id = req.param("id");
        _conn.query({
            sql: "DELETE w ,f from weixin_message as w LEFT JOIN following as f ON f.eid=w.id WHERE w.id=:id",
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
     * @api {get} /deleteMessages/:json 批量删除留言
     * @apiName GetDeleteMessages
     * @apiGroup message
     * @apiParam {string} message_ids id数组，必填
     * @apiSuccess {json}  rows 删除的记录数
     */
    router.get('/deleteMessages', function(req, res, next) {

        var  idsStr = req.param("message_ids");
        var sql="DELETE FROM  weixin_message WHERE id IN ("+idsStr+")";
        console.log(sql);
        _conn.query({
            sql: sql,
            params: {
                idsStr:idsStr,

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
     * @api {get} /getWxMessageList/:json  微信端留言列表展示
     * @apiName GetGetWxMessageList
     * @apiGroup message
     * @apiParam {int} pageSize 每页显示的数量，必填
     * @apiParam {int} page 当前的页数，必填
     * @apiParam {String} type 类型，必填
     * @apiParam {String} id 具体内容的主键，必填
     * @apiSuccess {json}  rows 留言列表和总的数量和当前页的集合
     *
     */
    router.get('/getWxMessageList', function (req, res, next) {

        var pageSize = req.param("pageSize");
        var currPage =req.param("page");
        var page = currPage==1?0:(currPage-1)*pageSize;
        var target_type =req.param("type");
        var target_id =req.param("id");
        var uid = req.session.wx_userInfo.user_id;
        var sql = "SELECT COUNT(fl.eid) lookCount,IFNULL(fl.state,0) AS follow, wm.*,wu.nickname,wu.img FROM weixin_message wm " +
                 "LEFT JOIN weixin_user wu ON wm.user_id=wu.id LEFT JOIN following  fl ON fl.eid = wm.id AND fl.e_type_id=0 AND fl.uid=:user_id " +
                "WHERE wm.target_type=:target_type AND wm.target_id=:target_id GROUP BY wm.id,IFNULL(fl.state,0)  ORDER BY wm.top DESC, wm.top_time DESC, wm.id DESC  LIMIT " + page + ","+ pageSize + ";" +
                 " SELECT * FROM weixin_reply ;SELECT identity FROM weixin_user WHERE id=:user_id";
        _conn.query({
            sql: sql,
            params: {
                page: page,
                pageSize: pageSize,
                target_type:target_type,
                target_id:target_id,
                user_id:uid,

            }
        }, function(err, rows, fieds) {

            if (err) {
                res.render('message.js');
            }

            res.send(rows);

        });
    });


    /**
     * @api {post} /postreply/:json  留言回复功能
     * @apiName PostReply
     * @apiGroup message
     * @apiParam {long} message_id 留言表的主键id，必填
     * @apiParam {String} hfcontent 回复内容，必填
     * @apiParam {String} type 类型，必填
     * @apiParam {String} user_name 留言者姓名，必填
     * @apiSuccess {json}  rows 留言列表和总的数量和当前页的集合
     *
     */
    router.post('/reply', function (req, res, next) {

        var messageId  = req.param("message_id");
        var content = req.param("hfcontent");
        //var userName = req.param("user_name");
        var userName = req.session.wx_userInfo.nickname;
        var reply_time = currentDate();

        _conn.query({
            sql: "INSERT INTO weixin_reply (message_id,user_name,reply_content,reply_time) VALUES (:message_id,:user_name,:reply_content,:reply_time)",
            params: {

                message_id: messageId,
                user_name: userName,
                reply_content: content,
                reply_time:reply_time,
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
     * @api {get} /getReplyMessage/:json  查询回复留言列表
     * @apiName GetGetReplyMessage
     * @apiGroup message
     *
     * @apiSuccess {json}  rows 留言结果
     *
     */
    router.get('/getReplyMessage', function (req, res, next) {

        _conn.query({
            sql: "SELECT wm.*,wu.nickname FROM weixin_message wm LEFT JOIN weixin_user wu ON wm.user_id=wu.id WHERE wm.pid >0",

        }, function(err, rows, fieds) {

            if (err) {
                res.render('message.js');
            }
            res.send(rows);

        });
    });



    /**
     * @api {post} /addMessage/:json 添加留言
     * @apiName PostAddMessage
     * @apiGroup message
     *
     ** @apiParam {String} target_type 添加留言类型，必填
     * @apiParam {String} target_id 记录的主键id，必填
     * @apiParam {String} user_id 留言者姓名，必填
     * @apiSuccess {json}  rows 添加留言结果
     *
     */
    router.post('/addMessage', function (req, res, next) {
        var target_type= req.param("target_type");
        var target_id  = req.param("target_id");
        var pid = req.param("pid");
        var content = req.param("reply_content");
        //var user_id = req.param("user_id");
        console.log("session======="+req.session.wx_userInfo)
        var user_id =  req.session.wx_userInfo.user_id;
        var create_time = currentDate();

        _conn.query({
            sql: "INSERT INTO weixin_message (target_type,target_id,pid,user_id,content,create_time) VALUES (:target_type,:target_id,:pid,:user_id,:content,:create_time)",
            params: {

                target_type: target_type,
                target_id: target_id,
                pid: pid,
                user_id: user_id,
                content: content,
                create_time:create_time,
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
     * @api {get} /topMessage/:json 留言置顶
     * @apiName GetTopMessage
     * @apiGroup message
     *
     * @apiParam {int} id 留言主键，必填
     * @apiSuccess {json}  rows 置顶结果
     *
     */
    router.get('/topMessage', function (req, res, next) {
        var id= req.param("id");
        var top_time  = currentDate();

        _conn.query({
            sql: "UPDATE weixin_message SET top=:top,top_time=:top_time WHERE id=:id",
            params: {
                id:id,
                top:1,
                top_time:top_time,
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

    //获取当前时间
    var currentDate=function () {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        return currentdate;
    }