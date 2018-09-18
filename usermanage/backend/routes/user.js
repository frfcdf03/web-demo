module.exports= function(_conn){
    var express = require("express");
    var router = express.Router();

    router.get('/test',function(req,res,next){
        res.send({test:"test"});
    });

    router.get('/addUser',function(req,res,next){
       var username = req.param("username"); 
       var password = req.param("password"); 
       var tel = req.param("tel"); 
       var sql = "INSERT INTO usertab (username,password,tel) VALUES "+"('"+username+"','"+password+"','"+tel+"');";
       _conn.query({sql:sql},function(err,result){
           if(err) throw err;
           res.send(result);
           console.log("Number of records inserted"+result.affectedRows);
       });
        
    });

    router.get('/delUser',function(req,res,next){
        var id = req.param("id"); 
        var sql ="DELETE FROM usertab WHERE id = '"+ id+"';";
        _conn.query({sql:sql},function(err,result){
            if(err) throw err;
            res.send({sql:sql});
            console.log("Number of records deleted"+result.affectedRows);
        });
    });

    router.get('/updateUser',function(req,res,next){
        var id = req.param("id");
        var username = req.param("username"); 
        var password = req.param("password"); 
        var tel = req.param("tel"); 
        var sql = "UPDATE usertab SET password='"+password+"', tel='"+tel+"', username='"+username+"' WHERE id ='"+id+"';";
        _conn.query({sql:sql},function(err,result){
            if(err) throw err;
            res.send({result:result,sql:sql});
            console.log("Number of records Updated"+result.affectedRows);
        });
    });
     
    router.get('/listUser',function(req,res,next){
        var start = req.param('start');
        var end = req.param('end');
        var sql = "SELECT id, username, tel, password FROM usertab ORDER BY id DESC limit "+start+" , "+end+";";
        _conn.query({sql:sql},function(err,result,field){
            if(err) throw err;
            res.send(result);
        });
    });

    router.get('/countUser',function(req,res,next){
        var num = req.param("num");
        var sql ="SELECT COUNT(*) AS namecount FROM usertab;";
        _conn.query({sql:sql},function(err,result,field){
            if(err) throw err;
            res.send(result);
        });
    });

    router.get('/sUser',function(req,res,next){
        var username = req.param('username');
        var sql = "SELECT id, username, tel, password FROM usertab WHERE username = '"+username+"';";
        _conn.query({sql:sql},function(err,result,field){
            if(err) throw err;
            res.send(result);
        });
    });
     return router;
};