define("lang", [], function() {
    var lang = {
        //產生16為的16進制字符串
        "uid": function() {
            var str = "";
            for (var i = 0; i < 2; i++) {
                str += Math.random().toString(16).substring(2);
            }
            return str;
        }
    };
    return lang;
});