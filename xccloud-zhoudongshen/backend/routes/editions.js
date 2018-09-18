module.exports = function (_conn) {
	var express = require('express');
	var router = express.Router();
	/**
	 * @api {get} /getEditionList/:json 获取版本分页列表
	 * @apiName GetGetEditionList
	 * @apiGroup editions
	 *
	 * @apiParam {id} id 画作id
	 * @apiParam {int} page 当前页数
	 * @apiParam {int} pageSize 每页显示的数量
	 *
	 * @apiSuccess {json}  row 画作的版本分页数据集
	 *
	 */
	router.get('/getEditionList', function (req, res, next) {
		console.log("这是化作版本")
	 
        var paintings_id = req.param("paintings_id");
        var pageSize = req.param("pageSize");
        var currPage =req.param("page");
        var page = currPage==1?0:(currPage-1)*pageSize;

        var sql1 = "select * from paintings_edition where paintings_id=:paintings_id limit " + page + " , " + pageSize + " ;select count(*) as totalCount from paintings_edition where paintings_id=:paintings_id ";

		_conn.query({
			sql: sql1,
			params: {
				
				paintings_id:paintings_id
			}
		}, function (err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
            console.log(rows);
            rows.push({currPage:currPage});
			res.send(rows);
		});
	});
	

	/**
	 * @api {get} /delpaintingEdition/:json 删除画作版本
	 * @apiName GetDelpaintingEdition
	 * @apiGroup editions
	 *
	 * @apiParam {int} paintings_id 画作id
	 * @apiParam {string} editionNum 版本号
	 * 
	 * @apiSuccess {json}  rows 是否删除成功
	 *
	 */
	router.get('/delpaintingEdition', function (req, res, next) {

		var paintingsId = req.param("paintings_id");
		var editionNum = req.param("editionNum");
		_conn.query({
			sql: "delete from paintings_edition where paintings_editionNum=:editionNum and paintings_id=:paintingsId",
			params:{
				paintingsId:paintingsId,
				editionNum:editionNum

			}

		}, function(err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}

			res.send(rows);


		});
	});


	/**
	 * @api {get} /selectByeditionNum/:json 查询版本详情
	 * @apiName GetSelectByeditionNum
	 * @apiGroup editions
	 *
	 * @apiParam {int} paintings_id 画作id
	 * @apiParam {string} editionNum 版本号
	 * 
	 * @apiSuccess {json}  rows 版本号的信息
	 *
	 */
	router.get('/selectByeditionNum', function (req, res, next) {

		var paintingsId = req.param("paintings_id");
		var editionNum = req.param("editionNum");
		_conn.query({
			sql: "select * from  paintings_edition where paintings_editionNum=:editionNum and paintings_id=:paintingsId",
			params:{
				paintingsId:paintingsId,
				editionNum:editionNum
			}

		}, function(err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}

			res.send(rows);


		});
	});

	/**
	 * @api {post} /updateEdition/:json 修改画作版本
	 * @apiName PostUpdateEdition
	 * @apiGroup editions
	 *
	 * @apiParam {int} paintings_id 画作id
	 * @apiParam {string} editionNum 版本号
	 *
	 * @apiSuccess {json}  rows 是否修改成功
	 *
	 */

	router.post('/updateEdition', function (req, res, next) {

		_conn.query({
			sql: "UPDATE paintings_edition SET STATUS=:status,selltime=:selltime,buyer=:buyer,buyer_phone=:buyer_phone WHERE paintings_id=:paintings_id AND paintings_editionNum=:editionNum",
			params:{
				paintings_id:req.param("paintings_id"),
				editionNum:req.param("editionNum"),
				status:req.param("status"),
				selltime:req.param("selltime"),
				buyer:req.param("buyer"),
				buyer_phone:req.param("buyer_phone"),
				

			}

		}, function(err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}
			res.send(rows);


		});
	});

	/**
	 * @api {post} /addPaintingsEditions/:json 添加画作版本号
	 * @apiName PostAddPaintingsEditions
	 * @apiGroup edition
	 *
	 * @apiParam {int} paintings_id 画作id
	 * @apiParam {string} editionNum 版本号
	 *
	 * @apiSuccess {json}  rows 是否添加成功
	 *
	 */
	router.post('/addPaintingsEditions', function (req, res, next) {


		_conn.query({
			sql: "INSERT INTO paintings_edition (paintings_editionNum,paintings_id) VALUES(:editionNum,:paintings_id)",
			params:{
				paintings_id:req.param("paintings_id"),
				editionNum:req.param("editionNum"),
			}

		}, function(err, rows, fieds) {
			if (err) {
				res.send("err!!!!!!!!");
			}

			res.send(rows);


		});
	});

	return router;
};