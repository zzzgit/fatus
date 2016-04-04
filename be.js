//貨幣模塊
define("Be", [], function() {

    function parseBun(be) {
        var result;

        if (!isNaN(be)) {
            result = be;
        } else if (be instanceof Be) {
            result = be._val;
        } else {
            result = (+be.toString());
        }
        result = parseInt(result);
        return result == result ? result : 0;
    };
    //货币类
    var Be = function(num) {
        this._val = num ? +num : 0;
        this.valueOf = function() { //是否应该挂载在prototype上
            return this._val;
        };
    };
    Be.prototype = {
        //取元的部分
        getGon: function() {
            return this._val / 100;
        },
        //取分的部分
        getBun: function() {
            return this._val % 100;
        },
        //总共多少分
        asBun: function() {
            return this._val;
        },
        //减法
        substract: function(be) {
            return be == null ? this : this._val -= parseBun(be) && this;
        },
        //加法
        add: function(be) {
            return be == null ? this : this._val += parseBun(be) && this;
        }
    };
    //静态方法,计算结果,不影响两个参数的值
    Be.add = function(augend, addend) {
        return new Be(augend + addend);
    };
    Be.substract = function(minuend, subtrahend) {
        return new Be(minuend - subtrahend);
    };
    return Be;
});