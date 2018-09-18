module.exports = function (_conn) {
	var express = require('express');
	var router = express.Router();
	/**
	 * @api {get} /getPaintingPrice/:json 获取画作的历史价格分页
	 * @apiName GetGetPaintingPrice
	 * @apiGroup price
	 *
	 * @apiParam {id} id 画作id
	 * @apiParam {String} type item的类型 ： 1-画作； 2-画作的分类，分类或套装,如果传"paintings"type=1,传其他的是type=0
	 * @apiParam {int} page 当前页数
	 * @apiParam {int} pageSize 每页显示的数量
	 *
	 * @apiSuccess {json}  row 画作的价格历史价格价格
	 *
	 */
	router.get('/getPaintingPrice', function (req, res, next) {
		var type = req.param("type");
		if (type=="paintings"){
			type = 1;
		}else{
			type = 0;
		};
        var id = req.param("id");
        var page = req.param("page") == 1 ? 0 : (req.param("page") - 1) * req.param("pageSize");
        var pageSize = req.param("pageSize");
		
		//获取年月日
        // var myDate = new Date();
		// var yyyy = myDate.getFullYear();
		// var mm = myDate.getMonth()+1;
		// var dd = myDate.getDate();
		// var hh = myDate.getHours(); //获取系统时，
		// var mm = myDate.getMinutes(); //分
		// var ss = myDate.getSeconds(); //秒

        var sql0 = "select a.* from paintings_price as a where 1=1 ";

        var sql_where = " and a.item_type ="+type+" and a.item_id ="+id+" ";

        //分页sql
        var sql1 = "limit " + page + " , " + pageSize + " ;select count(a.id) as totalCount from paintings_price as a where 1=1 ";
    
        var sql1_end = " ;";

		_conn.query({
			sql: sql0+sql_where+sql1+sql_where,
			params: {
				item_type: type,
				item_id:id
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
	 * @api {get} /getPaintingPriceList/:json 获取画作的历史价格未分页
	 * @apiName GetGetPaintingPriceList
	 * @apiGroup price
	 *
	 * @apiParam {String} type 类型
	 * @apiParam {id} id 画作id或者类型id(套装的类型)
	 * @apiParam {String} type item的类型 ： 1单幅画作； 2-画作的分类，分类或套装,
	 *
	 * @apiSuccess {json}  row 画作的价格历史价格价格
	 *
	 */
	router.get('/getPaintingPriceList', function (req, res, next) {
		var type = parseInt(req.param("type"));
		var id = parseInt(req.param("id"));
		var sql = "select pp.* from paintings_price as pp where 1=1 and pp.item_id=:id and pp.item_type=:type  ORDER BY pp.date desc";

		_conn.query({
			sql: sql,
			params: {
				type: type,
				id:id
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
	 * @api {get} /deleteById/:json 通过主键删除画作价格
	 * @apiName GetDeleteById
	 * @apiGroup price
	 *
	 * @apiParam {int} id 画作主键
	 *
	 * @apiSuccess {json}  rows 是否删除成功
	 *
	 */
	router.get('/deleteById', function (req, res, next) {

		var id = req.param("id");
		_conn.query({
			sql: "delete from paintings_price where id=:id",
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
	 * @api {get} /deletePricesById/:json 删除这条数据以后的信息
	 * @apiName GeteletePricesById
	 * @apiGroup price
	 *
	 * @apiParam {int} id 画作主键D
	 *
	 * @apiSuccess {json}  rows 是否删除成功
	 *
	 */
	router.get('/deletePricesById', function (req, res, next) {
        console.log(date);
		var date = req.param("date");
		_conn.query({
			sql: "delete from paintings_price where date > :date",
			params:{
				date:date

			}

		}, function(err, rows, fieds) {
			if (err) {
				//res.render('login.ejs');
			}

			res.send(rows);


		});
	});


	/**
	 * @api {get} /selectById/:json 查询画作价格详情
	 * @apiName GetSelectById
	 * @apiGroup price
	 *
	 * @apiParam {int} id 价格主键
	 *
	 * @apiSuccess {json}  rows 价格详情的集合
	 *
	 */
	router.get('/selectById', function (req, res, next) {

		var id = req.param("id");
		_conn.query({
			sql: "select * from paintings_price where id=:id",
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
	 * @api {post} /updatePrice/:json 修改画作价格详情
	 * @apiName PostUpdatePrice
	 * @apiGroup price
	 *
	 *  @apiParam {int} id 要修改的价格的id
	 * @apiParam {date} date 时间
	 * @apiParam {decimal} price 价格
	 *
	 * @apiSuccess {json}  rows 是否修改成功
	 *
	 */

	router.post('/updatePrice', function (req, res, next) {

		_conn.query({
			sql: "update paintings_price set date=:date,price=:price where id=:id",
			params:{
				date:req.param("date"),
				price:req.param("price"),
				id:req.param("id"),

			}

		}, function(err, rows, fieds) {
			if (err) {
				//res.render('login.ejs');
			}
			res.send(rows);


		});
	});

	/**
	 * @api {post} /addPrice/:json 添加画作价格
	 * @apiName PostAddPrice
	 * @apiGroup price
	 *
	 * @apiParam {int} item_id 画作id或者类型id
	 * @apiParam {date} date 时间
	 * @apiParam {decimal} price  价格
	 * @apiParam {int} item_type  类型1代表多幅作品，2或者其他代表套装
	 *
	 * @apiSuccess {json}  rows 是否添加成功
	 *
	 */
	router.post('/addPrice', function (req, res, next) {


		_conn.query({
			sql: "INSERT INTO paintings_price (item_id,date,price,item_type) VALUES(:item_id,:date,:price,:item_type)",
			params:{
				item_id:req.param("item_id"),
				date:req.param("date"),
				price:req.param("price"),
				item_type:req.param("item_type"),


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