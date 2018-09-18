    $f("df", __, function (_url) {
        //本地使用
        //var server = "/proxy/http://localhost:4000/";
        //docker 使用
        var server = "/backend/";

        return server + _url;
    });
