(function(window, document) {
    var parallax = {
        init: function(){
            return new Parallax();
        },
        //TODO: add unbind logic
        kill: function(){

        }
    };

    P = "parallax";

    var Parallax = function(){
        var parElements = _getParallaxElements();
        _attachListeners(parElements);
    };

    var _getParallaxElements = function(){
        var elements = document.querySelectorAll(".parallax");

        var parallaxObjs = [];

        for(var index = 0; index < elements.length; ++index){
            var el = elements[index];

            if(el && el.getAttribute(P + "-parent") && el.getAttribute(P + "-start") && el.getAttribute(P + "-end")){
                var parObj = {
                    el: el,
                    parent: el.getAttribute(P + "-parent"), 
                    start: _parseCSS(el.getAttribute(P + "-start")), 
                    end: _parseCSS(el.getAttribute(P + "-end"))
                };
                //starting and ending props much match up TODO: check prop names, not just length
                if(parObj.start.length == parObj.end.length){
                    parallaxObjs.push(parObj);
                }
            }
        }

        return _calcKeyframes(parallaxObjs);
    };

    var _parseCSS = function(cssString){
        var propStrings = cssString.split(";");
        var props = {};
        for(var i in propStrings){
            if(propStrings[i].length > 0){
                var propSplit = propStrings[i].split(":");
                var prop = {};
                props[propSplit[0].trim()] = propSplit[1].trim();
            }
        }
        return props;
    };

    var _calcKeyframes = function(objs){
        var keyframes = function(startProps, endProps, parHeight){
            var frames = {};
            for(var prop in startProps){
                var start = _unitHandler(startProps[prop]), end = _unitHandler(endProps[prop]);
                var keyframe = Math.abs(start.val  - end.val)/parHeight;
                //decreasing
                if(startProps[prop] >= endProps[prop]){
                    frames[prop] = keyframe * -1;
                }
                //increasing
                else {
                    frames[prop] = keyframe;
                }
            }
            return frames;
        };

        for(var i in objs){
            objs[i].parentHeight = $(objs[i].parent).height();
            objs[i].keyframes = keyframes(objs[i].start, objs[i].end, objs[i].parentHeight);
        }
    
        return objs;
    };

    var _attachListeners = function(elements){
        $(window).scroll(function(){
            //TODO look at efficiency 
            for(var i in elements){
                var el = elements[i];
                if(_isElementInViewport($(el.parent))){
                    var progress = $(window).scrollTop() - $(el.parent).offset().top;
                    for(var prop in el.start){
                        // var valUnit = _unitHandler(el.start[prop]);
                        // var calc = String(valUnit.val + parseInt(progress) * el.keyframes[prop]) + valUnit.unit;
                        var calc = _propChange(el.start[prop], {progress: progress, keyframes: el.keyframes[prop]});

                        $(el.el).css(prop, calc);
                    }

                }
            }
        });
    };

    var _unitHandler = function(str){
        var match = str.match(/px|em|%/g);
        var val, unit;
        //no understandable units
        if(!match){
            val = parseInt(str.match(/(-)?(\d)+/g)[0]);
            unit = ""; 
        }
        else {
            unit = match[0];
            val = parseInt(str.substring(0, str.indexOf(unit))); 
        }

        return {
            val: val, 
            unit: unit
        };
    };

    var _propChange = function(str, args){
        return str.replace(/(\d)+/, function(){
            return parseInt(str.match(/(\d)+/)[0]) + parseInt(args.progress) * args.keyframes;
        });
    };

    var _isElementInViewport = function(el) {
        //special bonus for those using jQuery
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect();

        return (
            rect.top <= 0 &&
            rect.bottom >= 0
        );
    };

    $(document).ready(function(){
        parallax.init();
    });

}(window, document));