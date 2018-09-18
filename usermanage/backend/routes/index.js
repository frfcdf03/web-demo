module.exports = function (_conn) {
  var express = require('express');
  var router = express.Router();

  /* GET home page. */
  router.get('/', function (req, res, next) {

    /*   var username = req.body.username;
          var password = req.body.password;
          _conn.query({
              sql: "select * from t_manager where username=:username and password=:password",
              params: {
                  username: username,
                  password: password
              }
          }, function(err, rows, fieds) {
              if (err) {
                  res.render('login.ejs');
              }
              console.log(rows);

          });
      }); */

    res.send({
      user: {
        data: 'test',
        name: 'aui',
        tags: ['art', 'template', 'nodejs']
      }
    });
  });
  return router;
};