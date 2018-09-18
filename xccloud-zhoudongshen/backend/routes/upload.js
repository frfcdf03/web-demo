module.exports = function (_conn) {
    var express = require('express');
    var router = express.Router();
    var multer = require("multer");
    var path =require("path");
    var storage = multer.diskStorage({
        destination:'./public/upload/',
        filename : function(req,file,cb){
          cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname));
        }
      
      });
      
      var upload =multer({
        storage:storage
      }).single('myImage');

    router.get('/test1',(req,res,next)=>{
        res.render('index2.art',0);
        res.end();
});

router.post('/test2',function(req,res,next){
    res.send("test");
});

router.post('/main',function(req,res){
    upload(req,res,(err)=>{
            if(err){
               throw err;
            }
            else{
                if(!req.file){
                    res.send("err empty file!");
                    return;
                }
                else{
                console.log(req.file+"**********************");
                res.send("public/upload/"+req.file.filename);
                return;
                }
            }

    });
});

    return router;
};