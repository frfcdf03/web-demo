module.exports = function (_conn) {
  var express = require('express');
  var router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {

    var APPID="wx7f9ea6014e0c00d5";
    var APPSECRET="";
    var weixinCode = req.param("code");
    if(weixinCode==null){

      var url="https://open.weixin.qq.com/connect/qrconnect?" +
          "appid=" +APPID+
          "&redirect_uri=http://47.105.37.109/web-wechat/" +
          "&response_type=code" +
          "&scope=SCOPE" +
          "&state=0" +
          "#wechat_redirect";
      res.redirect(url);
      return;
    }else{
      var getInfoUrl="https://api.weixin.qq.com/sns/oauth2/access_token?" +
          "appid=" +APPID+
          "&secret=" +APPID+
          "&code=" +weixinCode+
          "&grant_type=authorization_code";

    }




  });


    return router;

};