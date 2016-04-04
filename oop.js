//OOP
define("OOP", [], function() {
    //接口
    // var  CanCallSuper=function(){
    // };
    // CanCallSuper.prototype.callSuper=function(method){       //method對應的必須是函數，不然會報錯
    //  this.prototype[method].apply(this,arguments);       //函數執行過程中不能修改函數本身，不然這樣會污染prototype對象
    // };
    //兩種繼承的手段,必須保證父類構造函數,在不帶參數的情況下不能報錯,可以在實例化之前檢查父類的構造函數,以便準確定位問題
    //第三種方式就是不封裝,直接用字面量來寫子函數,這種方式限制最少,但是代碼不能重用
    //這個函數的限制，調用上層的函數，只能有一層，另外，上層構造函數必須執行

    //這種繼承有一個缺陷：繼承操作之後，不能重新指定prototype，只能修改
    function inherit(SperClass, SubClass) {
        var name = SubClass.name;
        var Generated_by_OOP = function() {
            SperClass.apply(this, arguments);
            SubClass.apply(this, arguments);
        }
        Generated_by_OOP.prototype = $.extend(Object.create(new SperClass), SubClass.prototype, {
            "callSuper": function(method) { //method對應的必須是函數，不然會報錯
                Generated_by_OOP.prototype[method].apply(this, arguments); //函數執行過程中不能修改函數本身，不然這樣會污染prototype對象
            },
            "constructor": SubClass
        });
        Generated_by_OOP.superClass = SperClass;
        //defineProperty修改length和name,但是編程一般用匿名函數,用不到
        return Generated_by_OOP;
    }

    /*    Function.prototype.fork = Function.prototype.derive = function(obj) {
            var that = this;
            var Clazz = function() {
                that.apply(this, arguments);
                obj && obj.constrct && obj.constrct.apply(this, arguments);
            };
            if (!obj) {
                return Clazz;
            }
            Clazz.prototype = Object.create(new that);
            Clazz.constructor = obj.constrct;
            //defineProperty修改length和name,但是編程一般用匿名函數,用不到
            var prototype = Clazz.prototype;
            for (var k in obj) {
                prototype[k] = obj[k];
            }
            return Clazz;
        };*/
    return {
        "inherit": inherit
    }
});