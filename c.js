define("c", ["bar"], function(bar) {
    //定義模塊
    var result = {};
    result.c = "ccc";
    result.bb=function(){
    	console.log(bar.bar);
    }
    return result;
});
