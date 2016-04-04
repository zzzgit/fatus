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