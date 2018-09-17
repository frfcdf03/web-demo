$f("df", __, function (_url) {
    var server = "";
    if (this.ISTEST) {
        return _url;
    } else {
        return "/proxy/" + server + _url;
    }
});