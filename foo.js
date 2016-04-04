define("foo", ["bar"], function(bar) {
    //定義模塊
    var result = {};
    result.foo = bar.bar;
    return result;
});
