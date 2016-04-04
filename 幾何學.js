function bbb(d, rad) {
    var x = Math.sin(rad) * d;
    var y = Math.cos(rad) * d;
    return new Point(x, y);

}
//角度坐标系转换，角度化成弧度，弧度算出坐标，坐标偏移
var p = bbb(3, 2);
var o = new Point(4, 5);
p = cc.upgradeCS(o);


var Point = function(x, y) {
    if (arguments.length) {
        this.x = this.y = 0;
        return this;
    }
    this.x = x;
    this.y = y;
}
Point.prototype = {
    "upgradeCS": function(o) {
        this.x += o.x;
        this.y += o.y;
    }
}

var CS = {
    "dikaer": "watch"
};


// 角度转换成弧度
var swtichh = function(n) {
    return π / (180 * n);
};

// 极坐标
var PPoint = function(d, rad) {
    this.dia = d;
    this.rad = rad;
};


var ppoint = new PPoint(3, 2);
