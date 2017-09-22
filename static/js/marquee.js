   $(function() {
        $(".ticker").csTicker({interval: 45, speed: 3});
        $("#csTicker").csTicker({speed: 1});
    });


( function($) {
 
    $.fn.csTicker = function(options) {
 
        if (typeof (options) == 'undefined') {
            options = {};
        }
 
        var settings = $.extend( {}, $.fn.csTicker.defaults, options);
 
        var $ticker = $(this);
 
        settings.tickerID = $ticker[0].id;
 
        $.fn.csTicker.settings[settings.tickerID] = {};
 
        var $wrap = null;
 
        if (! $ticker.parent().eq(0).hasClass('wrap')) {
            $wrap = $ticker.wrap("<div class='wrap'></div>");
        }
 
        var $tickerContainer = null;
 
        if (! $ticker.parent().parent().eq(0).hasClass('container')) {
            $tickerContainer = $ticker.parent().wrap(
                    "<div class='container' id='stockbar'></div>");
        }
 
        var node = $ticker[0].firstChild;
        var next;
 		
        while(node) {
            next = node.nextSibling;
            console.log(node.NodeType);
          
            if(node.NodeType == 3) {
                $ticker[0].removeChild(node);
            }
            node = next;
          console.log(node);
        }
 
        var shiftLeftAt = $ticker.children().eq(0).outerWidth(true);
 
        $.fn.csTicker.settings[settings.tickerID].shiftLeftAt = shiftLeftAt;
        $.fn.csTicker.settings[settings.tickerID].left = 0;
        $.fn.csTicker.settings[settings.tickerID].runid = null;
 
        $ticker.width(2 * screen.availWidth);
 	
        function startTicker() {
            stopTicker();
 
            var params = $.fn.csTicker.settings[settings.tickerID];
            params.left -= settings.speed;
            if(params.left <= params.shiftLeftAt * -1) {
                params.left = 0;
                $ticker.append($ticker.children().eq(0));
                params.shiftLeftAt = $ticker.children().eq(0).outerWidth(true);
            }
 
 			var leftPos = (params.left < 0 ) ? (-1 * params.left) : params.left;
            $tickerContainer.scrollLeft(leftPos);
            params.runId = setTimeout(arguments.callee, settings.interval);
 
            $.fn.csTicker.settings[settings.tickerID] = params;
        }
 
        function stopTicker() {
            var params = $.fn.csTicker.settings[settings.tickerID];
            if (params.runId)
                clearTimeout(params.runId);
 
            params.runId = null;
 
            $.fn.csTicker.settings[settings.tickerID] = params;
        }
 
        function updateTicker() {
 
            stopTicker();
            startTicker();
        }

 		if (settings.pauseOnHover) {
	        $ticker.hover(stopTicker,startTicker);
	    }
 
        startTicker();
    };

	
    $.fn.csTicker.settings = {};
 
    $.fn.csTicker.defaults = {
        tickerID :null,
        url :null,
        speed :1,
        pauseOnHover: true,
        interval :20
    };
})(jQuery);