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