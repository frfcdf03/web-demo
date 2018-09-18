module.exports=function(_pool){
  return {
    query:function(_data,_fn){
      _pool.getConnection(function(err, connection) {
        connection.config.queryFormat = function (query, values) {
          if (!values) return query;
          return query.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) {
              return this.escape(values[key]);
            }
            return txt;
          }.bind(this));
        };
        // Use the connection
        connection.query(_data.sql,_data.params||null,function (error, results, fields) {
//          console.log(results);
          // And done with the connection.
          connection.release();
          // Handle error after the release.
            if (error) {
                console.log("-------------error-----------------");
                console.log(_data);
                console.log(error);
                console.log("-------------error-----------------");
            }
          _fn(error,results,fields);
          // Don't use the connection here, it has been returned to the pool.
        });
      });
    }
  };
};
