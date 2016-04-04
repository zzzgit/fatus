// 數學模塊，後面再改名
define("bbb", [], function() {
    var math = {
        // 包括邊界
        "getInt": function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };
    return math;
});