module.exports = function (_conn) {
	var express = require('express');
    var router = express.Router();

	/**
	 * @api {get} /selectById/:json PC端获取画作的详情
	 * @apiName GetSelectById
	 * @apiGroup paintings
	 *
	 * @apiParam {int} id 主键id,必填
	 *
	 * @apiSuccess {json}  row 画作的详情信息
	 *
	 */

	router.get('/selectById', function (req, res, next) {

        var user_id= req.session.wx_userInfo.user_id;//从session中获取用户id

		_conn.query({
			sql: "SELECT (SELECT  price FROM paintings_price WHERE item_id=p.id ORDER BY DATE DESC LIMIT 0,1) price," +
			"IFNULL(fl.state,0) AS follow, p.*,t.type_name ,t.pid FROM paintings p " +
			"LEFT JOIN sys_type t ON p.paintings_type=t.id LEFT JOIN following AS fl ON fl.eid = p.id AND fl.e_type_id=5 AND fl.uid=:uid " +
            "  LEFT JOIN paintings_price ps ON ps.item_id=p.id WHERE p.id=:id GROUP BY p.id,IFNULL(fl.state,0)",
			params: {
                id: req.param("id"),
                uid:user_id,
			}
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
			//console.log(rows);
			res.send(rows);
		});
	});

    /**
     * @api {get} /getPaintingById/:json WX端获取画作的详情
     * @apiName GetgetPaintingById
     * @apiGroup paintings
     *
     * @apiParam {int} id 主键id,必填
     *
     * @apiSuccess {json}  row 画作的详情信息
     *
     */

    router.get('/getPaintingById', function (req, res, next) {
     
        var user_id= req.session.wx_userInfo.user_id;//从session中获取用户id
        //console.log("=================");

        _conn.query({
            sql: "SELECT p.*,IFNULL(( SELECT fl.state FROM  following  fl  WHERE fl.eid=:id AND fl.e_type_id=5 AND fl.uid=:uid ),0) follow ," +
			"COUNT(f.id) lookCount  FROM paintings p LEFT JOIN following f ON p.id= f.eid WHERE p.id=:id GROUP BY p.id",
            params: {
                id: req.param("id"),
				uid:user_id,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log(rows);
            res.send(rows);
        });
    });

    /**
     * @api {get} /selectPaintings/:json  查询微信的系列和套装详情
     * @apiName GetSelectPaintings
     * @apiGroup paintings
     *
     * @apiParam {int} id 主键id,必填
     *
     * @apiSuccess {json}  row 画作套装或系列的详情信息
     *
     */
    router.get('/selectPaintings', function (req, res, next) {
        var id= req.param("id");
        var user_id= req.session.wx_userInfo.user_id;//从session中获取用户id
      
		var sql1 ="SELECT COUNT(fl.eid) lookCount,IFNULL(( SELECT fl.state FROM  sys_type st  LEFT JOIN  following  fl " +
			"ON fl.eid = st.id AND fl.e_type_id IN (6,7) WHERE st.id=:id AND fl.uid=:uid ),0) follow ,st.* FROM   sys_type st " +
			" LEFT JOIN  following  fl ON fl.eid = st.id AND fl.e_type_id IN (6,7) WHERE st.id=:id ;";
        var sql2 = " SELECT (SELECT  price FROM paintings_price WHERE item_id=p.id ORDER BY DATE DESC LIMIT 0,1) price," +
			"pt.*,p.* FROM paintings_type pt LEFT JOIN paintings p ON pt.paintings_id= p.id " +
			"LEFT JOIN paintings_price ps ON ps.item_id=p.id  WHERE pt.type_id=:id AND p.paintings_state=1 GROUP BY p.id;";
        _conn.query({
            sql: sql1+sql2,
            params: {
                id:id,
                uid:user_id,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            // console.log(rows);
            res.send(rows);
        });
    });


    /**
	 * @api {get} /getTypePaintings/:json 根据分类查询画作列表
	 * @apiName GetGetTypePaintings
	 * @apiGroup paintings
	 *
	 * @apiParam {int} pageSize 每页显示的数量，必填
	 * @apiParam {int} page 显示的第几页，必填
	 * @apiParam {int} paintingsType 类型id,选填，用于条件查询
	 * @apiSuccess {json}  row 画作的列表集合
     */
    router.get('/getTypePaintings', function (req, res, next) {

        var pageSize = req.param("pageSize");
        var currPage =  req.param("page");
        var page = currPage==1?0:(currPage-1)*pageSize;

        var paintingsType = req.param("paintings_type");
        var paintingsId = req.param("paintings_id");
        var paintings_sort = req.param("paintings_sort");

        var sql="SELECT pv.* FROM paintings_type t LEFT JOIN (SELECT COUNT(f.eid) lookCount," +
			"(SELECT  price FROM paintings_price WHERE item_id=p.id ORDER BY DATE DESC LIMIT 0,1) price," +
            " p.* FROM paintings p LEFT JOIN following f ON f.eid=p.id AND f.e_type_id=5 " +
            " LEFT JOIN paintings_price ps ON ps.item_id=p.id GROUP BY p.id) pv ON t.paintings_id=pv.id WHERE t.type_id="+paintingsType;
        var sql1="SELECT COUNT(p.id) AS totalCount FROM  paintings_type t LEFT JOIN paintings p ON t.paintings_id=p.id WHERE t.type_id ="+paintingsType;

        if (typeof (paintingsId) != "undefined"  && paintingsId!="") {
            sql += " and pv.paintings_id ='"+paintingsId+"'";
            sql1 += " and p.paintings_id ='"+paintingsId+"'";
        }
        if(paintings_sort==0){
            sql+= " ORDER BY lookCount DESC, pv.id DESC ";
        }else{
            sql+= " ORDER BY lookCount ASC, pv.id DESC ";
        }
        sql += " limit " + page + " ," + pageSize + ";";

        _conn.query({
            sql: sql+sql1,

        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log(rows);
            rows.push({currPage:currPage});
            res.send(rows);
        });
    });

    /**
	 * @api {get} /getAllPaintings/:json  查询所有画作列表
     * @apiName GetGetAllPaintings
     * @apiGroup paintings
     *
     * @apiParam {int} pageSize 每页显示的数量，必填
     * @apiParam {int} page 显示的第几页，必填
     * @apiParam {int} paintings_id 画作编号，选填，用于条件查询
	 * @apiParam {int} paintings_sort 关注度排序，0是降序，1是升序
     * @apiSuccess {json}  row 画作的列表集合
     */
    router.get('/getAllPaintings', function (req, res, next) {
        var pageSize = req.param("pageSize");

        var currPage =  req.param("page");
        var page = currPage==1?0:(currPage-1)*pageSize;

        var paintingsId = req.param("paintings_id");
        var paintings_sort = req.param("paintings_sort");

        var sql = "SELECT COUNT(f.eid) lookCount,(SELECT  price FROM paintings_price WHERE item_id=p.id ORDER BY DATE DESC LIMIT 0,1) price," +
			"p.* FROM paintings p LEFT JOIN following f ON f.eid=p.id AND f.e_type_id=5 " +
            "LEFT JOIN paintings_price ps ON ps.item_id=p.id";
        var sql1="SELECT COUNT(id) AS totalCount FROM  paintings";

        if (typeof (paintingsId) != "undefined" && paintingsId!="") {

            sql += " WHERE p.paintings_id ='"+paintingsId+"'";
            sql1 += " WHERE paintings_id ='"+paintingsId+"'";
        }
        sql+=" GROUP BY p.id"
        if(paintings_sort==0){
            sql+= " ORDER BY lookCount DESC,p.id DESC ";
		}else{
            sql+= " ORDER BY lookCount ASC ,p.id DESC ";
		}
        sql += " limit " + page + " ," + pageSize + ";";

        _conn.query({
            sql: sql+sql1,

        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log(rows);
            rows.push({currPage:currPage});
            res.send(rows);
        });


    });

	/**
	 * @api {get} /changeState/:json 改变画作的状态，上架和下架功能
	 * @apiName GetChangeState
	 * @apiGroup paintings
	 *
	 * @apiParam {int} id 画作id，必填
	 * @apiParam {int} state 上架和下架，必填
	 *
	 * @apiSuccess {json}  row 修改成功或失败
	 *
	 */
	router.get('/changeState', function (req, res, next) {
		var id = req.param("id");
		var state = req.param("state");
		_conn.query({
			sql: "update paintings set paintings_state=:state where id=:id ",
			params: {
				state: state,
				id: id
			}
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
			//console.log(rows);
			res.send(rows);
		});
	});

	/**
	 * @api {post} /addPaintings/:json 添加画作
	 * @apiName PostAddPaintings
	 * @apiGroup paintings
	 *
	 * @apiParam {String} paintings_id 画作编码
	 * @apiParam {String} paintings_name 画作内容
	 * @apiParam {int} paintings_type 画作类型id
	 * @apiParam {String} paintings_img 画作图片地址
	 * @apiParam {String} paintings_state 画着图片
	 * @apiParam {int} paintings_state 上架和下架的状态
	 * @apiParam {String} paintings_spec 画作的尺寸
	 * @apiParam {String} paintings_year 画作的年代
	 *
	 * @apiSuccess {json}  row 添加成功或者失败
	 *
	 */
	router.post('/addPaintings', function (req, res, next) {
		var datatime =currentDate();
		var paintings_type=req.body.data.paintings_type;

		_conn.query({
			sql: "INSERT INTO paintings (paintings_id,paintings_name,paintings_type,paintings_img,paintings_state,paintings_spec,paintings_year,paintings_content,create_time) VALUES (:paintings_id,:paintings_name,:paintings_type,:paintings_img,:paintings_state,:paintings_spec,:paintings_year,:paintings_content,:create_time)",
			params: {
				paintings_id:req.body.data.paintings_id,
                paintings_name:req.body.data.paintings_name,
                paintings_type:req.body.data.paintings_type,
                paintings_img:req.body.data.paintings_img,
                paintings_state:req.body.data.paintings_state,
                paintings_spec:req.body.data.paintings_spec,
                paintings_year:req.body.data.paintings_year,
                paintings_content:req.body.data.paintings_content,
				create_time:datatime
            }
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
                return ;
			}
			// console.log(rows);
			// res.send(rows);
            var insertId = rows.insertId;//获取自动生成的id

            var paintings_types=paintings_type;
            var type_ids =paintings_types.split(',');
            var len =type_ids.length;
            // var values =[];
            var sql="INSERT INTO paintings_type (paintings_id,type_id) VALUES";
            for (i in type_ids){
              if(parseInt( i)==len-1){
                  sql+="("+insertId+","+type_ids[i]+");"
			  }else{

                  sql+="("+insertId+","+type_ids[i]+"),"
			  }


			}
			console.log(sql)
            //插入画作和类型关联表
            _conn.query({
                sql: sql,

            }, function (err1, rows1, fieds1) {
                if (err1) {
                    //res.send("err!!!!!!!!");
                    return ;
                }
				console.log("添加成功");
                res.send(rows1);
            });
		});
	});

	/**
	 * @api {get} /deletePaintings/:json 通过主键删除画作
	 * @apiName GetDeletePaintings
	 * @apiGroup paintings
	 *
	 * @apiParam {int} id 画作id，必填
	 *
	 * @apiSuccess {json}  row 修改成功或失败
	 *
	 */
	router.get('/deletePaintings', function (req, res, next) {
		var pid= req.param("id");
		var type =req.param("type");

		_conn.query({
			sql: "DELETE p ,f from paintings as p LEFT JOIN following as f ON f.eid=p.id WHERE p.id=:id",
            params: {
                id: pid
            }
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
				return ;
			}
			//console.log(rows);


            //删除关联表相关数据
            _conn.query({
                sql: "DELETE FROM paintings_type WHERE paintings_id=:id",
                params: {
                    id: pid
                }
            }, function (err1, rows1, fieds1) {
                if (err1) {
                    res.send("err!!!!!!!!");
                }
                console.log(rows1);
                //删除留言表相关数据
                _conn.query({
                    sql: "  DELETE FROM weixin_message WHERE target_type=:type and target_id=:id",
                    params: {
                        id: pid,
                        type:type
                    }
                }, function (err2, rows2, fieds2) {
                    if (err2) {
                        res.send("err!!!!!!!!");
                    }
                   // console.log(rows2);

                });

            });

             res.send(rows);
		});
	});

	/**
	 * @api {post} /updatePaintings/:json 通过主键修改画作
	 * @apiName PostUpdatePaintings
	 * @apiGroup paintings
	 *
	 * @apiParam {String} id 要修改的画作的id
	 * @apiParam {String} paintings_id 画作编码
	 * @apiParam {String} paintings_name 画作内容
	 * @apiParam {int} paintings_type 画作类型id
	 * @apiParam {String} paintings_img 画作图片地址
	 * @apiParam {int} paintings_state 上架和下架的状态
	 * @apiParam {String} paintings_spec 画作的尺寸
	 * @apiParam {String} paintings_year 画作的年代
	 * @apiParam {String} paintings_content 画作的简介
	 *
	 * @apiSuccess {json}  row 修改成功或失败
	 *
	 */
	router.post('/updatePaintings', function (req, res, next) {
		//修改画作信息
        var data = req.body.data;

		_conn.query({
			sql: "UPDATE paintings SET paintings_id=:paintings_id, paintings_name=:paintings_name, paintings_type=:paintings_type, paintings_img=:paintings_img, paintings_state=:paintings_state, paintings_spec=:paintings_spec, paintings_year=:paintings_year,paintings_content=:paintings_content where id=:id ",
			params:data
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
			//console.log(rows);

			//删除该画作原来的类型

            var paintings_id = data.id;//画作id

            _conn.query({
                sql:"DELETE FROM paintings_type WHERE paintings_id =:paintings_id",
                params: {
                    paintings_id:paintings_id,

                }
            }, function (err1, rows1, fieds1) {
                if (err1) {
                    res.send("err!!!!!!!!");
                }
                console.log(rows1);

                //添加新选择类型
                var paintings_id = data.id;//画作id
                var paintings_types=data.paintings_type;
                var type_ids =paintings_types.split(',');
                var len =type_ids.length;

                var sql="INSERT INTO paintings_type (paintings_id,type_id) VALUES";
                for (i in type_ids){
                    if(parseInt( i)==len-1){
                        sql+="("+paintings_id+","+type_ids[i]+");"
                    }else{
                        sql+="("+paintings_id+","+type_ids[i]+"),"
                    }
                }
                console.log(sql)
                //插入画作和类型关联表
                _conn.query({
                    sql: sql,

                }, function (err2, rows2, fieds2) {
                    if (err2) {
                        res.send("err!!!!!!!!");

                    }
                    console.log("添加成功");

                });

            });
            res.send(rows);
		});
	});

	/**
	 * @api {get} /getPaintingsType/:json 获取画作的类型
	 * @apiName GetgetPaintingsType
	 * @apiGroup paintings
     *
	 * @apiSuccess {json}  row 画作类型的集合
	 */

	router.get('/getPaintingsType', function (req, res, next) {
		_conn.query({
			sql: "select a.* from sys_type a join sys_type b on a.pid = b.id where a.modle_name = 'paintings' ",
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
			console.log(rows);
			// res.send(rows);
			var temp = [];
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].pid == 5) { //如果是 套装/系列
					var jsonStr = "{}";
					var jsonObj = JSON.parse(jsonStr);
					jsonObj["type_name"] = rows[i].type_name;
					jsonObj["type_id"] = rows[i].id;
					jsonObj["type_pid"] = rows[i].pid;
					var temps = [];
					for (var j = 0; j < rows.length; j++) {

						if (rows[i].id == rows[j].pid) {
							var lJsonStr = "{}";
							var lJsonObj = JSON.parse(lJsonStr);
							lJsonObj["type_name"] = rows[j].type_name;
							lJsonObj["type_id"] = rows[j].id;
							lJsonObj["type_pid"] = rows[j].pid;
							// jsonObj["type_list"]=lJsonObj;
							temps.push(lJsonObj);
						};
						// temp.push();
					};
					jsonObj["type_list"] = temps;
					// temp.pushjsonObj;
					temp.push(jsonObj);
				};
			};
			res.send(temp);
		});
	});


	/**
	 * @api {post} /addPaintingsType/:json 添加画作类型
	 * @apiName PostAddPaintingsType
	 * @apiGroup paintings
	 * @apiParam {int} paintingsType_Id 主键id
	 * @apiParam {String} paintingsType_Name 类型名称
	 * @apiParam {int} paintingsType_Pid 父id
	 * @apiParam {int} price 价格
	 * @apiParam {String} paintingsType_Content 简介
	 *
	 * @apiSuccess {json}  row 画作类型的集合
	 *
	 */
	router.post('/addPaintingsType', function(req, res, next) {
		_conn.query({
			sql: "INSERT INTO sys_type (type_name,pid,price,modle_name,content) VALUES (:type_name,:pid,:price,:modle_name,:content);",
			params: {
				type_name: req.body.paintingsType_Name,
				pid: req.body.paintingsType_Pid,
				price :req.body.price,
				modle_name: "paintings",
				content:req.body.paintingsType_Content
			}
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
			//console.log(rows);
			res.send(rows);
		});
	});

    /**
     * @api {get} /selectTypeById/:json 根据类型id查询或作类型情况
     * @apiName GetSelectTypeById
     * @apiGroup paintings
     * @apiParam {int} id主键id
     * @apiSuccess {json}  row 画作类型的详情
     *
     */
    router.get('/selectTypeById', function(req, res, next) {
    	var id= req.param("id");
        _conn.query({
            sql: "SELECT * FROM sys_type WHERE id=:id;",
            params: {
                id:id,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log(rows);
            res.send(rows);
        });
    });

    /**
     * @api {post} /updatePaintingsType/:json 修改画作类型
     * @apiName PostAddPaintingsType
     * @apiGroup paintings
     * @apiParam {int} paintingsType_Id 主键id
     * @apiParam {String} paintingsType_Name 类型名称
     * @apiParam {int} paintingsType_Pid 父id
	 * @apiParam {int} price  价格
     * @apiParam {String} paintingsType_Content 简介
     *
     * @apiSuccess {json}  row 画作类型的集合
     *
     */
    router.post('/updatePaintingsType', function(req, res, next) {
    	var date=req.body;
        _conn.query({
            sql: "UPDATE sys_type SET type_name=:type_name,pid=:pid,price=:price,content=:content where id=:id;",
            params: {
            	id:req.body.paintingsType_id,
                type_name: req.body.paintingsType_Name,
                pid: req.body.paintingsType_Pid,
                price :req.body.price,
                content:req.body.paintingsType_Content
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log(rows);
            res.send(rows);
        });
    });



    /**
     * @api {post} /deletePaintingsType/:json 批量删除画作类型
     * @apiName GetDeletePaintingsType
     * @apiGroup paintings
     *
     * @apiParam {int} paintingsType_Id 主键id
     * @apiSuccess {json}  row 修改成功或失败
     *
     */
    router.get('/deletePaintingsType', function(req, res, next) {

        var  idsStr = req.param("type_ids");
        var sql="DELETE FROM  sys_type WHERE id IN ("+idsStr+")";
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
            //删除留言表相关数据
            _conn.query({
                sql: "DELETE FROM weixin_message WHERE target_type IN(6,7) AND  target_id IN ("+idsStr+")",

            }, function (err, rows, fieds) {
                if (err) {
                    res.send("err!!!!!!!!");
                }
                //console.log(rows);

            });

            console.log(rows);
            res.send(rows);
        });
    });

    /**
     * @api {get} /getPaintingsList/:list 微信端画作下的套装或系列列表
     * @apiName GetGtPaintingsList
     * @apiGroup paingtings
     *
     * @apiParam {int} pid 父id，必填
     *
     * @apiSuccess {json}  rows 画作下的套装或系列的列表集合
     *
     */
    router.get('/getPaintingsList', function (req, res, next) {
        var pid =  req.param("pid");
        var sql = "SELECT * FROM sys_type WHERE pid =:pid "
        var sql2 =  ";SELECT a.type_id,p.* FROM (SELECT * FROM paintings_type WHERE type_id IN " +
			"(SELECT id FROM sys_type  WHERE pid =:pid)) a LEFT JOIN paintings p ON a.paintings_id=p.id where p.paintings_state=1";
        _conn.query({
            sql:  sql +sql2  ,
            params: {
                pid:pid,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);

            var data = [];
            for (var i = 0; i < rows[0].length; i++) {

                var jsonStr = "{}";
                var jsonObj = JSON.parse(jsonStr);

                jsonObj["type_id"] = rows[0][i].id;
                jsonObj["type_name"] = rows[0][i].type_name;
                jsonObj["price"] = rows[0][i].price;
                jsonObj["content"] = rows[0][i].content;
                var paintings = [];
                for (var j = 0; j < rows[1].length; j++) {

                    if (rows[0][i].id == rows[1][j].type_id) {
                        var pJsonStr = "{}";
                        var pJsonObj = JSON.parse(pJsonStr);
                        pJsonObj["paintings_img"] = rows[1][j].paintings_img;
                        pJsonObj["paintings_name"] = rows[1][j].paintings_name;
                        pJsonObj["paintings_content"] = rows[1][j].paintings_content;

                        paintings.push(pJsonObj);
                    };

                };
                jsonObj["paintings_list"] = paintings;

                data.push(jsonObj);

            };
            res.send(data);
        });
    });

    /**
     * @api {get} /getAllPaintingsList/:list 微信画作下全部作品列表
     * @apiName GetGetAllPaintingsList
     * @apiGroup paintings
     *
     * @apiSuccess {json}  rows 画作下全部作品的集合
     *
     */
    router.get('/getAllPaintingsList', function (req, res, next) {


        _conn.query({
            sql:  "SELECT (SELECT  price FROM paintings_price WHERE item_id=p.id ORDER BY DATE DESC LIMIT 0,1) price,p.* FROM paintings p LEFT JOIN paintings_price ps ON ps.item_id=p.id WHERE p.paintings_state=1 GROUP BY p.id" ,

        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log(rows);

            res.send(rows);
        });
    });

	 /**
	 * @api {get} /listPageCon/:json 根据画作id查询画作信息
	 * @apiName GetlistPageCon
	 * @apiGroup paintings
	 *
	 * @apiParam {int} pid 主键id
	 *
	 * @apiSuccess {json}  row 画作的信息
	 *
	 */
	 router.get('/listPageCon', function (req, res, next) {
        var pid =  req.param("pid");
  
		
        _conn.query({
			sql: "SELECT p.* FROM sys_type stt INNER JOIN paintings_type pt ON pt.type_id = stt.id "+
			     "INNER JOIN paintings p ON p.id = pt.paintings_id "+
			     "WHERE stt.id=:pid and p.paintings_state = 1;",
            params: {
                pid:pid,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            //console.log("-------------------------");
            if(!req.session.wx_userInfo){

                req.session.wx_userInfo={user_id:1,nickname:"游客"};//添加本地测试对象
                

            }
            if(!req.session.openid){
                req.session.openid="oRvPu04rd-fG7ZfxzaCIPq1_O4vc";
            }
            //console.log("-------------------------");

            res.send(rows);
        });
       
	});
	
	/**
	 * @api {get} /productepe/:json 根据父级查询下级画作分类
	 * @apiName Getproductepe
	 * @apiGroup paintings
	 *
	 * @apiParam {int} pid 主键id
	 *
	 * @apiSuccess {json}  row 画作分类下套装的信息
	 *
	 */
	router.get('/productepe', function (req, res, next) {
		var pid =  req.param("pid");
	
            
        
        _conn.query({
            sql: "SELECT * FROM sys_type AS st WHERE st.pid=:pid;",
            params: {
                pid:pid,
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
	 * @api {get} /titlevalidation/:json 查询是否有重名的套装系列标题
	 * @apiName Gettitlevalidation
	 * @apiGroup paintings
	 *
	 * @apiParam {int} pid 主键id
	 *
	 * @apiSuccess {json}  row 画作分类下套装的信息
	 *
	 */
    router.get('/titlevalidation',function (req, res, next) {

        var paintingsType_Name =  req.param("paintingsType_Name");
		
        _conn.query({
            sql:"select count(*) as count from sys_type where type_name=:paintingsType_Name",
            params: {
                paintingsType_Name:paintingsType_Name,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);

            res.send(rows);
        });
        
    })

      /**
	 * @api {get} /paintingsidvalidation/:json 查询是否有重名的套装系列标题
	 * @apiName Getpaintingsidvalidation
	 * @apiGroup paintings
	 *
	 * @apiParam {int} pid 主键id
	 *
	 * @apiSuccess {json}  row 画作分类下套装的信息
	 *
	 */
    router.get('/paintingsidvalidation',function (req, res, next) {

        var paintings_id =  req.param("paintings_id");
		
        _conn.query({
            sql:"select count(*) as count from paintings where paintings_id=:paintings_id",
            params: {
                paintings_id:paintings_id,
            }
        }, function (err, rows, fieds) {
            if (err) {
                res.send("err!!!!!!!!");
            }
            console.log(rows);

            res.send(rows);
        });
        
    })

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
