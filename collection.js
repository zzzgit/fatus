//集合操作
define("collection", [], function() {
    var collection = {
        "invert": function(obj) {
            var result = {};
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) { //hasOwnProperty應該封裝成另外一個
                    continue;
                }
                result[obj[key]] = key;
            }
            return result;
        },
        "rosarify": function(arr) {
            var result = "";
            arr.forEach(function(item, index, arr) {
                result += " " + item;
            })
            return result.trim();
        },
        "contains": function(arr, item) {
            return arr.indexOf(item) > -1;
        }
    };
    return collection;
});