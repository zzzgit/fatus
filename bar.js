define("bar", ["foo"], function(foo) {
    //定義模塊
    var result = {};
    result.bar = 333;
    result.go=function(){
    	console.log(foo.foo);
    }
    return result;
});
