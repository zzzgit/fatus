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
                    window._fate_magazine["glass_relative_widget"] = that;
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