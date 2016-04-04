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