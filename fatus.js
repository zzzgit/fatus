/* global define,define,console */

//常用函數
var fatus = {};
fatus.extend = function(dest, source) {
    for(var key in source){
        if(source.hasOwnProperty(key)){
            dest[key]=source[key];
        }        
    }
};
var deleteItem=function(arr,item){
    if(!arr || !Array.isArray(arr)){
        return false;
    }
    var index=arr.indexOf(item);
    arr.splice(index,1);
}
//無冗餘集合
var nonRedundantArray = function() {
    this._data = {};
};
nonRedundantArray.prototype = {
    "push": function(module) {
        this._data[module.name]=module;
    },
    "remove": function(moduleName) {
        delete this._data[moduleName];
    },
    "has": function(moduleName) {
        return !!this._data[moduleName];
    },

};


//生命週期
var Module = function(name) {
    this._state = "initializing";
    this._depends = [];
    this._requiredBy = null;
    this._name=name;
};
Module.prototype = function() {

};
Module.ensureLoaded = function(callback) {

};
//全局變量
var repositoryKap = {};     // 甲級倉庫
var repositoryJut={};       // 乙級倉庫
var shadows = new nonRedundantArray(); //這個變量名要改,存放狀態
var misson=new nonRedundantArray();     //一組加載任務,有使用者簡歷
var script_prefix = "fatus_script_";
var baseUrl;
// 初始化
var scripts = document.getElementsByTagName("SCRIPT");
for (var i = 0, len = scripts.length; i < len; i++) {
    var item = scripts[i];
    if (!item.dataset["main"]) {
        continue;
    }
    baseUrl = item.dataset["main"];
    break;
    // 後面還要考慮沒有設置main屬性的情況
}
//支持多種參數
var define = function(name, depends, moduleConstructor) {
    if (arguments.length == 0) {
        throw new Error("參數不正確");
    }
    if (arguments.length == 1) {
        moduleConstructor = name;
        if (typeof moduleConstructor != "function") {
            return moduleConstructor;
        }
    }
    if (arguments.length == 2) {
        moduleConstructor = depends;
        depends = name;
        name = "defaultName"; // 根據文件名生成模塊名
    }
    var constructorWrapper = function(dpds) { //構造,並且觸發事件
        var module = moduleConstructor.apply(null, Array.prototype.slice.call(arguments)); //因爲上面傳入的參數是多個單個模塊,而非數組
        module.depends = depends;
        module.name = name;
        if(repositoryJut[name]){
            if(typeof module == "function"){
                throw new Error("循環依賴，不支持function類型的模塊");
            }
            fatus.extend(repositoryJut[name],module);
            repositoryKap[name]=repositoryJut[name];    //只能重新定向到乙庫，而不能刪除乙庫中的內容
        }
        repositoryKap[name] = module;
        controller.trigger(name);
        shadows.setComplete(name);
    }
    if (depends.length) {
        require0(depends, constructorWrapper);
    } else {
        constructorWrapper([]);
    }
};
var require = function(modules, callback) {
    if (!Array.isArray(modules)) {
        modules = [modules];
    }
    var ddkdk=window.setInterval(function(){
        if(controller.areLoaded(modules)){
            window.clearTimeout(dkdk);
            window.clearInterval(ddkdk);
        }
    },100);
    var dkdk=window.setTimeout(function(){
        misson.remove(dkdk);
        throw new Error("超市");
    },2*1000);
    misson.push(dkdk);
    require0(modules,callback,dkdk);
};
var require0=function(modules, callback,missonId){    //於上面的分開,避免混淆,框架試用裝的回調跟框架本身的回調,還有最外層的超市的控制
    var hook = controller.sink(modules, callback,missonId);  //鉤子,兩個作用,所有模塊加載完畢,需要調用的回調,這組超市,需要
    modules.forEach(function(item, index, modls) {
        requireSingle(item, hook);
    });
};
var requireSingle = function(moduleName, hook) {
    controller.bind(moduleName, hook);
    // 處於等待狀態的模塊,也觸發這個事件,並不會影響上一層
    if (controller.isLoaded(moduleName) || controller.isWaiting(moduleName)) {
        controller.trigger(moduleName);
        return null;
    }
    shadows.push(new Module("moduleName"));
    // 找到路徑，加載路徑，輪詢找變量，超時
    var url = baseUrl + moduleName + ".js";
    var script_e = document.createElement("SCRIPT");
    script_e.type = "text/javascript";
    script_e.id = script_prefix + moduleName;
    script_e.src = url;
    document.body.appendChild(script_e);
    // 綁定回調函數之後,什麼都不用管了,後面的處理,都交給controller
};
var bbc = 567;
var controller = {
    "_eventBus": {}, // 單個模塊加載完成後的事件
    "_callbackWrappers": {}, // 一組模塊加載完成後的事件
    "bind": function(moduleName, hook) {
        if (!this._eventBus[moduleName]) {
            this._eventBus[moduleName] = [];
        }
        this._eventBus[moduleName].push(hook); // 只綁定鉤子,不直接綁定函數
    },
    "trigger": function(moduleName) {
        var hook = this._eventBus[moduleName].pop();
        this._callbackWrappers[hook]();

    },
    "isLoaded": function(name) {
        return !!repositoryKap[name];
    },
    "areLoaded": function(names) {
        for(var i =0,len=names.length;i<len;i++){
            var item=names[i];
            if(!this.isLoaded(item)){
                return false;
            }
        }
        return true;
    },
    "isWaiting": function(name) {
        return shadows.getState(name)=="waiting";
    },
    "sink": function(modls, callback,missonId) {
        var uid = bbc++; //String(modls)也可以作爲uid
        var that = this;
        var callbackWrapper = function(item) {
            if(!misson.has(missonId)){  //已經超時,不做處理..................................兩個任務,一個超市,一個不超市,要互不影響
                return null;
            }
            var shouldCallback = true;
            modls.forEach(function(moduleName, index) {
                var isWaiting = that.isWaiting(moduleName);
                var isRequiredByUpstream = that._eventBus[moduleName].length > 1;
                if(isWaiting && isRequiredByUpstream){
                    //throw new Error("循環依賴");
                    repositoryJut[moduleName]={};
                }
                if (!(controller.isLoaded(moduleName) /*|| (isWaiting && isRequiredByUpstream)*/)) {
                    shouldCallback = false;
                    return false;
                }
            });
            if (shouldCallback) {
                callback.apply(null, modls.map(function(item, index) {
                    return repositoryKap[item]?repositoryKap[item]:repositoryJut[item];
                }));
                that._callbackWrappers[uid] = undefined;
            }
        };
        this._callbackWrappers[uid] = callbackWrapper;
        return uid;
    },
    "delete": function(hook) {
        this._callbackWrappers[hook] = undefined;
    }
}
var load = function(name) {


}
