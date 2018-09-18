$f("df", ___, function (_url) {
    //本地使用
    $f("set", "domain", "https://zhoudongshen.jnaw.top");
    //var server = "/proxy/http://localhost:4000/";
    //docker 使用
    var server = "/backend/";
    return server + _url;
});
