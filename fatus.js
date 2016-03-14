/* global define,define,console */

//require core string re
define("core", [], function() {
    if (!window._fate_magazine) {
        window._fate_magazine = {
            "ordinal": 0
        };
    }
    var core = {
        "empty": function() {},
        "count": function() {
            return window._fate_magazine.ordinal++
        }
    };
    return core;
});
define("lang",[],function(){
	var lang={
		//產生16為的16進制字符串
		"uid":function(){
			var str="";
			for(var i=0;i<2;i++){
				str+=Math.random().toString(16).substring(2);
			}
			return str;
		}
	};
	return lang;
});

//可以依賴zepto或者jquery
define("zeplugin", ["zepto", "UI"], function($, ui) {
    var isZepto = $.zepto ? true : false;

    var proto = {
        //中間鏈的element可能有滾動,所以不準確
        //Handling table border offsets.
        // Fixed positioned elements.
        // Scroll offsets within another element.
        // Borders of overflowed parent elements.
        // Miscalculation of absolutely positioned elements.
        clientRect: function() {
            if (!this.eq(0)) {
                return {};
            }
            var offset = this.eq(0).offset();
            return {
                top: offset.top - $.window.scrollTop(),
                left: offset.left - $.window.scrollLeft()
            };
        },
        isVisible: function() {
            return window.getComputedStyle(this.get(0), '').getPropertyValue("display") == "none";
        },
        isAttached: function() {
            if (!this.eq(0)) {
                return false;
            }
            var ele = this.eq(0);
            return ele.parentNode || ele.nodeType == 9;
        }
    };
    if (isZepto) {
        $.extend($.fn, proto);
    } else {
        $.fn.extend(proto);
    }
    //$.window對象
    $.window = {
        //這裏只支持取值,不支持設置,以後增加
        scrollTop: function() {
            return (window.pageYOffset !== undefined) ? window.pageYOffset : window.scrollY;
        },
        scrollLeft: function() {
            return (window.pageXOffset !== undefined) ? window.pageXOffset : window.scrollX;
        }
    };
    $.isInstance = function(obj) {
        return isZepto ? obj instanceof $.zepto.Z : obj instanceof $;
    };
    return $;
});

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

//UI庫
define("UI", ["core", "zeplugin", "OOP", "machine", "collection"], function(core, $, oop, machine, collection) {
    var bindMachine2Element = function(map, guard, callback) {
        this.machine.setMap(map);
        var that = this;
        this._ele.on("click", function(e) {
            if (!guard.call(this, e)) {
                return null;
            }
            e["machine"] = that.machine;
            var result = that.machine.turn(e.target.id);
            if (!result) {
                return null;
            }
            e["result"] = result;
            callback.call(this, e);
        });
    }
    var UI = {};
    //只能接受HTML Element或者jquery對象作爲參數，不帶參數時，不能報錯
    var Component = function(ele) {
        this._ele = ele && $(ele).eq(0);
    };
    Component.prototype = {
        "isShowing": function() {
            return this._ele.isVisible();
        },
        "getEle": function() {
            return this._ele;
        },
        "isAttached": function() {
            return this._ele.isAttached;
        }
    };
    var WidgetEvent = function(widget) {
        this.obj = widget;
    };
    var Widget = function() {
        //this
    };
    //事件機制用在show hide 等幾個環節上，就是AOP
    Widget.prototype = {
        "show": function() {
            var e = new Event("before_show");
            this._ele.trigger(e);
            this._ele.hasClass("hidden") && this._ele.removeClass("hidden");
            this._ele.show();
            e = new Event("show");
            this._ele.trigger(e);
        },
        "hide": function() {
            var ele = this.getEle();
            var e = new Event("before_hide");
            ele.trigger(e);
            ele.addClass("hidden");
            ele.hide();
            e = new Event("hide");
            ele.trigger(e);
        },
        "isFirstShow": function() {

        },
        //兩種語法on(eventName, data, func);on(eventName, func);
        //isBefore,需要的話，加在最後
        "on": function(eventName, data, func, isBefore) {
            var isDataExist = typeof data != "function";
            if (!isDataExist) {
                isBefore = func;
                func = data;
            }
            eventName = isBefore ? "before_" + eventName : eventName;
            if (isDataExist) {
                return this._ele.on(eventName, data, func);
            }
            return this._ele.on(eventName, func);
        },
        //兩種語法off(event,handler);off(event);
        //isBefore,需要的話，加在最後
        "off": function(eventName, handler, isBefore) {
            var isHandlerExist = typeof handler == "function";
            if (!isDataExist) {
                isBefore = handler;
            }
            eventName = isBefore ? "before_" + eventName : eventName;
            if (isDataExist) {
                return this._ele.off(eventName, func);
            }
            return this._ele.off(eventName);
        },
        //第一個參數是函數，後面是要傳給該函數的參數
        //為了調用decorater時，能傳參數，就不能一次性調用多個decorater
        //decorater跟事件機制搭配使用，前者可以改變API，後者不能
        "decorate": function(name) {
            var args = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;

            function _decorate1(ele, fn, argus) {
                fn.apply(ele, argus);
                ele.data("uiDecorated", ele.data("uiDecorated").trim() + " " + fn.constructor.decoraterID);
            }
            if (typeof name == "string") {
                if (!UI.magazine.decoraters[name]) {
                    throw new Error("there's no decorater named \"" + name + "\" in the magazine")
                }
                var temp = this._ele.data("fat_applied_decoraters");
                if (!temp) {
                    this._ele.data("fat_applied_decoraters", name);
                } else {
                    temp = temp.split(" ");
                    if (collection.contains(temp, name)) {
                        throw new Error("the decorater \"" + name + "\" have been applied to this widget before!");
                    }
                    this._ele.data("fat_applied_decoraters", collection.rosarify(temp));
                }
                UI.magazine.decoraters[name].apply(this, args);
                return this;
            }
            for (var key in name) {
                //这里没有记录装饰器的名字
                typeof name[key] == "function" && name[key].apply(this, args);
            }
            return this;
        }
    };
    Widget = oop.inherit(Component, Widget);
    //組件創建三部曲：按照正常流暢定義子類和prototype，繼承，修改prototype
    var Glass = function(ele) {
        var glass = document.createElement("DIV");
        glass.className = "ui-overlay ui-widget-glass hidden";
        document.body.appendChild(glass);
        this.id = core.count();
        this._ele = $(glass);
        var that = this;
        this._ele.on("click", function() {
            window._fate_magazine["glass_relative_widget"].hide();
        });
    };
    Glass = oop.inherit(Widget, Glass);
    Glass.prototype.className = "com.glass"; //這個屬性不能叫name，因為函數本身有一個name屬性，而且是只讀的


    //單例都方式火藥庫，不用模擬靜態類，然後做工廠類
    UI.magazine = {
        "_globalInstancesOfComponent": {},
        "getInstance": function(Clazz) {
            var name = Clazz.prototype.className;
            if (!this._globalInstancesOfComponent[name]) {
                this._globalInstancesOfComponent[name] = new Clazz; //添加權限控制功能，只能在內部實例化
            }
            return this._globalInstancesOfComponent[name];
        },
        "decoraters": {
            //用玻璃遮罩來顯示
            "scene": function() {
                //此處this指向widget
                var that = this;
                var Component = UI.Glass;
                var glass = UI.magazine.getInstance(Component);
                this.on("show", function() {
                    //此處this指向html element，事件的綁定，組件轉發給jq對象，然後再轉發給html element
                    window._fate_magazine["glass_relative_widget"]=that;
                    that.getEle().parent().append(glass.getEle());
                    glass._ele.css({
                        "top": (that._ele.clientRect()["top"] + 10) + "px",
                        "left": "0px"
                    });
                    glass.show();
                }, false); //遮罩的位置，可能需要依靠顯示內容的樣式，所以設置在其後
                this.on("hide", function() {
                    glass.hide();
                }, true);
            },
            //一元狀態機
            "monisticMachine": function(map, guard, callback) {
                this.machine = new machine.MonisticMachine();
                bindMachine2Element.call(this, map, guard, callback);
            },
            //陰陽狀態機
            "yinyangMachine": function(map, guard, callback) {
                this.machine = new machine.YinyangMachine();
                bindMachine2Element.call(this, map, guard, callback);
            }
        }

    };
    $.extend(UI, {
        "Glass": Glass,
        "Widget": Widget
    });
    return UI;
});


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


//有限狀態機
//狀態的轉換,可能是阻塞式的,這種情況下,狀態機必須提供事件機制
define("machine", ["collection"], function(collection) {

    //一元狀態機
    var MonisticMachine = function(map) {
        this._vsmap = map; //view state mapping
        this._isOperating = false;
    };
    MonisticMachine.prototype = {
        "setMap": function(map) {
            this._vsmap = map;
        },
        "turn": function(view) { //switch是保留字
            if (this._isOperating || !this.canTurn(view)) {
                return false;
            }
            this._isOperating = true;
            var last = this._state;
            this._state = this._getState(view);
            return (this._isOperating = false) || {
                "current": view,
                "last": this._getId(last) //這個值可能是undefined的,需要特殊處理
            };
        },
        "_getState": function(view) {
            return this._vsmap[view];
        },
        "_getId": function(state) {
            return collection.invert(this._vsmap)[state];
        },
        "getState": function() { //有必要的話,可以加一個lastState
            return this._state;
        },
        "canTurn": function(view) {
            var newState = this._getState(view);
            if (newState == this._state) {
                return false;
            }
            return true;
        }
    };
    //陰陽狀態機
    var YinyangMachine = function(map) {
        this._vsmap = map; //view state mapping
        this._isOperating = false;
    };
    YinyangMachine.prototype = {
        "setMap": function(map) {
            this._vsmap = map;
        },
        "turn": function(view) { //switch是保留字
            if (this._isOperating || !this.canTurn(view)) {
                return false;
            }
            this._isOperating = true;
            var last = this._state;
            this._state = this._getState(view);
            return (this._isOperating = false) || {
                "current": this._getId(this._state),
                "last": this._getId(last) //這個值可能是undefined的,需要特殊處理
            };
        },
        "_getState": function(view) {
            return this._vsmap[view] == this._state ? 0 : this._vsmap[view];
        },
        "_getId": function(state) {
            return collection.invert(this._vsmap)[state];
        },
        "getState": function() { //有必要的話,可以加一個lastState
            return this._state;
        },
        "canTurn": function(view) {
            var newState = this._getState(view);
            if (!newState && newState != 0) {
                return false;
            }
            return true;
        }
    };
    //多元狀態機
    var machines = {
        "MonisticMachine": MonisticMachine,
        "YinyangMachine": YinyangMachine
    };
    return machines;
});
