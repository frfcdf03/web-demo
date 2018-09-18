module.exports = function (_conn) {
  var express = require('express');
  var router = express.Router();

    /**
     * @api {get} /getWxNewsList/:list 微信获取新闻列表
     * @apiName GetGetWxNewsList
     * @apiGroup news
     *
     * @apiParam {int} pageSize 每页显示的数量，必填
     * @apiParam {int} page 当前的页数，必填
     * @apiParam {String} keyword 关键字，用于查询，选填
     *
     * @apiSuccess {json}  rows 新闻列表和总的数量和当前页的集合
     *
     */
  router.get('/getWxNewsList', function (req, res, next) {
    
          var pageSize = req.param("pageSize");
          var keyword = req.param("keywords");  
          var currPage =req.param("page");
          var modleName=req.param("modleName"); 
          var page = currPage==1?0:(currPage-1)*pageSize; 
          var uid =req.session.wx_userInfo.user_id;//从session中获取用户id;

          var sql="select DISTINCT tc.id, IFNULL(fl.state,0) AS follow ,tc.*,su.user_name as name,st.type_name from t_cms tc LEFT JOIN following AS fl ON fl.eid =tc.id AND fl.e_type_id = tc.type_id AND fl.uid =" +uid +" LEFT JOIN sys_user su ON tc.creater_id = su.id LEFT JOIN sys_type st ON tc.type_id=st.id where st.modle_name =:modleName ";
          var sql1="select count(tc.id) as totalCount from t_cms tc LEFT JOIN sys_type st ON tc.type_id = st.id where st.modle_name =:modleName ";
         
          sql+=" ORDER BY tc.id DESC limit "+page+","+pageSize+" ;";
             
             console.log(sql+sql1);
          _conn.query({
              
              sql:sql+sql1,
              params:{
                 
                  modleName:modleName

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
     * @api {get} /getNewsList/:list pc获取新闻列表
     * @apiName GetGetNewsList
     * @apiGroup news
     *
     * @apiParam {int} pageSize 每页显示的数量，必填
     * @apiParam {int} page 当前的页数，必填
     * @apiParam {String} keyword 关键字，用于查询，选填
     *
     * @apiSuccess {json}  rows 新闻列表和总的数量和当前页的集合
     *
     */
  router.get('/getNewsList', function (req, res, next) {
    
        var pageSize = req.param("pageSize");
        var currPage =req.param("page");
        var page = currPage==1?0:(currPage-1)*pageSize;
        var keyword = req.param("keywords");
        var modleName=req.param("modleName");
        console.log("********************")
       
        var sql="SELECT DISTINCT tc.id, tc.*,su.user_name AS NAME,st.type_name FROM t_cms tc  LEFT JOIN sys_user su ON tc.creater_id = su.id LEFT JOIN sys_type st ON tc.type_id=st.id where st.modle_name =:modleName ";
        var sql1=" SELECT COUNT(tc.id) AS totalCount FROM t_cms tc LEFT JOIN sys_type st ON tc.type_id=st.id WHERE st.modle_name =:modleName  ";
       
        if(typeof(keyword) != "undefined" ){
            sql+=" and tc.title LIKE :keyword or tc.content LIKE :keyword ";
            sql1+=" and tc.title LIKE :keyword or tc.content LIKE :keyword "   
        }
            sql+=" ORDER BY tc.id DESC limit "+page+","+pageSize+" ;";
            console.log("********************");
           console.log(sql+sql1);
        _conn.query({
            
            sql:sql+sql1,
            params:{
                keyword:"%"+keyword+"%",
                modleName:modleName

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
     * @api {get} /getType/:list 获取新闻类型
     * @apiName GetGetType
     * @apiGroup news
     *
     * @apiParam {int} pid 父id，必填
     *
     * @apiSuccess {json}  rows 新闻类型的集合
     *
     */
  router.get('/getType', function (req, res, next) {

      var pid = req.param("pid");
        _conn.query({
            sql: "select * from sys_type where pid=:pid",
            params:{
                pid:pid

            }

        }, function(err, rows, fieds) {
            if (err) {
                //res.render('login.ejs');
            }

            res.send(rows);


        });
  });

    /**
     * @api {post} /addNews/:json 添加新闻
     * @apiName PostAddNews
     * @apiGroup news
     *
     * @apiParam {String} titleAdd 标题
     * @apiParam {String} editor 内容
     * @apiParam {int} typeAdd 新闻所属类型id
     *
     * @apiSuccess {json}  rows 是否添加成功
     *
     */
  router.post('/addNews', function (req, res, next) {

      var time=currentDate();
      console.log(req.param("titleAdd")+"*********"+req.param("editor"));

        _conn.query({
            sql: "INSERT INTO t_cms (title,content,creater_id,creat_time,type_id,img_path) VALUES(:titleAdd,:contentAdd,:creater_id,:creat_time,:typeAdd,:img_path)",
            params:{
                titleAdd:req.param("titleAdd"),
                contentAdd:req.param("editor"),
                creater_id:1,
                creat_time:time,
                typeAdd:req.param("typeAdd"),
                img_path:req.param("img_path")

            }

        }, function(err, rows, fieds) {
            if (err) {
                //res.render('login.ejs');
            }

            res.send(rows);


        });
  });


    /**
     * @api {get} /deleteById/:json 通过主键删除新闻
     * @apiName GetDeleteById
     * @apiGroup news
     *
     * @apiParam {int} id 新闻主键
     *
     * @apiSuccess {json}  rows 是否删除成功
     *
     */
  router.get('/deleteById', function (req, res, next) {

      var id = req.param("id");
      var type =req.param("type");
        _conn.query({
            sql: "DELETE t ,f from t_cms as t LEFT JOIN following as f ON f.eid=t.id WHERE t.id=:id",
            params:{
                id:id
            }

        }, function(err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //删除留言表相关数据
            _conn.query({
                sql: " DELETE FROM weixin_message WHERE target_type=:type and target_id=:id",
                params: {
                    id: id,
                    type:type
                }
            }, function (err, rows, fieds) {
                if (err) {
                    res.send("err!!!!!!!!");
                }
                console.log(rows);
            });

            res.send(rows);


        });
  });

    /**
     * @api {get} /selectById/:json 查询新闻详情
     * @apiName GetSelectById
     * @apiGroup news
     *
     * @apiParam {int} id 新闻主键
     *
     * @apiSuccess {json}  rows 新闻详情的集合
     *
     */
  router.get('/selectById', function (req, res, next) {

        var id = req.param("id");
        _conn.query({
            sql: "select * from t_cms where id=:id;select * from sys_type where pid='1'",
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
     * @api {post} /updateNews/:json 修改新闻详情
     * @apiName PostUpdateNews
     * @apiGroup news
     *
     *  @apiParam {int} idUpdate 要修改的新闻的id
     * @apiParam {String} titleUpdate 标题
     * @apiParam {String} contentUpdate 内容
     * @apiParam {int} typeUpdate 新闻所属类型id
     *
     * @apiSuccess {json}  rows 是否修改成功
     *
     */

  router.post('/updateNews', function (req, res, next) {

      console.log(req.param("titleUpdate")+"*********"+req.param("contentUpdate")+"********"+req.param("typeUpdate")+"********"+req.param("idUpdate"));

        _conn.query({
            sql: "update t_cms set title=:title,content=:content,type_id=:type_id ,img_path=:img_path where id=:id",
            params:{
                title:req.param("titleUpdate"),
                content:req.param("contentUpdate"),
                type_id:req.param("typeUpdate"),
                img_path:req.param("img_path"),
                id:req.param("idUpdate"),

            }

        }, function(err, rows, fieds) {
            if (err) {
                //res.render('login.ejs');
            }

            res.send(rows);


        });
  });
 
  router.get('/newsLists', function (req, res, next) {

    var pid = req.param("pid");
    _conn.query({
        sql: "select * from t_cms where type_id in(2,3) ORDER BY id DESC limit 0,5;"
    }, function(err, rows, fieds) {
        if (err) {
            //res.render('login.ejs');
        }

        res.send(rows);


    });
});

router.get('/newsListsByPid', function (req, res, next) {

    var pid = req.param("pid");
    _conn.query({
        sql: "select * from t_cms where type_id=:pid ORDER BY id DESC limit 0,5;",
        params:{
           pid:pid
        }
    }, function(err, rows, fieds) {
        if (err) {
            //res.render('login.ejs');
        }

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
    var hours= date.getHours();
    var minutes=date.getMinutes();
    var seconds=date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
   if(0<=hours && hours<= 9){
        hours="0"+hours;
    }
    if(0<=minutes && minutes<= 9){
        minutes="0"+minutes;
    }
    if(0<=seconds && seconds<= 9){
        seconds="0"+seconds;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + hours + seperator2 + minutes + seperator2 + seconds;
    return currentdate;
}