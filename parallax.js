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

            // if(el.getAttribute("background-cover")){
            //     $(el).backstretch(el.getAttribute("background-cover"));
            // }

            if(el && el.getAttribute(P + "-parent") && el.getAttribute(P + "-start") && el.getAttribute(P + "-end")){
                var parObj = {
                    el: el,
                    parent: el.getAttribute(P + "-parent"), 
                    start: _parseCSS(el.getAttribute(P + "-start")), 
                    end: _parseCSS(el.getAttribute(P + "-end"))
                };
                console.log("parObj", parObj);
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
                //tuple
                if(startProps[prop].split(" ").length > 1){
                    console.log("we have a tuple");
                    var start = _tupleHandler(startProps[prop]), end = _tupleHandler(endProps[prop]);
                    console.log("start, end", start, end);
                    var keyframe = [Math.abs(start[0] - end[0])/parHeight, Math.abs(start[1] - end[1])/parHeight];
                    console.log("keyframe", keyframe);
                    //set animation direction
                    if(parseInt(start[0]) > parseInt(end[0])){
                        keyframe[0] *= -1;
                    }
                    if(parseInt(start[1]) > parseInt(end[1])){
                        keyframe[1] *= -1;
                    }

                    frames[prop] = keyframe;
                }
                else {
                    var start = _unitHandler(startProps[prop]), end = _unitHandler(endProps[prop]);
                    var keyframe = Math.abs(start.val  - end.val)/parHeight;
                    //decreasing
                    //TODO: does this still work with new unit handling
                    if(startProps[prop] >= endProps[prop]){
                        frames[prop] = keyframe * -1;
                    }
                    //increasing
                    else {
                        frames[prop] = keyframe;
                    }
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
                        var calc;
                        if(Array.isArray(el.keyframes[prop])){
                            calc = _propChangeTuple(el.start[prop], {progress: progress, keyframes: el.keyframes[prop]});
                            console.log("calc", calc);
                        }
                        else {
                            calc = _propChange(el.start[prop], {progress: progress, keyframes: el.keyframes[prop]});
                        }
                        
                        console.log(prop, calc);
                        $(el.el).css(prop, calc);
                    }

                }
            }
        });
    };

    var _tupleHandler = function(str){
        var vals = str.match(/(-)?(\d)+/g);
        return [vals[0], vals[1]];
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
        return str.replace(/(-)?(\d)+/, function(){
            return parseInt(str.match(/(-)?(\d)+/)[0]) + parseInt(args.progress) * args.keyframes;
        });
    };
    var _propChangeTuple = function(str, args){
        // return 
        var repl = str.replace(/(-)?(\d)+(%|px|em) (-)?(\d)+(%|px|em)/, function(){
            var m1 = _unitHandler(str.match(/(-)?(\d)+(%|px|em)/g)[0]);
            var m2 = _unitHandler(str.match(/(-)?(\d)+(%|px|em)/g)[1]);
            
            var v1 = String(m1.val + parseInt(args.progress) * args.keyframes[0]) + m1.unit;
            var v2 = String(m2.val + parseInt(args.progress) * args.keyframes[1]) + m2.unit;

            return String(v1) + " " + String(v2);
        });

        console.log("repl", repl);
        return repl;
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

/*! Backstretch - v2.0.4 - 2013-06-19
* http://srobbin.com/jquery-plugins/backstretch/
* Copyright (c) 2013 Scott Robbin; Licensed MIT */
(function(a,d,p){a.fn.backstretch=function(c,b){(c===p||0===c.length)&&a.error("No images were supplied for Backstretch");0===a(d).scrollTop()&&d.scrollTo(0,0);return this.each(function(){var d=a(this),g=d.data("backstretch");if(g){if("string"==typeof c&&"function"==typeof g[c]){g[c](b);return}b=a.extend(g.options,b);g.destroy(!0)}g=new q(this,c,b);d.data("backstretch",g)})};a.backstretch=function(c,b){return a("body").backstretch(c,b).data("backstretch")};a.expr[":"].backstretch=function(c){return a(c).data("backstretch")!==p};a.fn.backstretch.defaults={centeredX:!0,centeredY:!0,duration:5E3,fade:0};var r={left:0,top:0,overflow:"hidden",margin:0,padding:0,height:"100%",width:"100%",zIndex:-999999},s={position:"absolute",display:"none",margin:0,padding:0,border:"none",width:"auto",height:"auto",maxHeight:"none",maxWidth:"none",zIndex:-999999},q=function(c,b,e){this.options=a.extend({},a.fn.backstretch.defaults,e||{});this.images=a.isArray(b)?b:[b];a.each(this.images,function(){a("<img />")[0].src=this});this.isBody=c===document.body;this.$container=a(c);this.$root=this.isBody?l?a(d):a(document):this.$container;c=this.$container.children(".backstretch").first();this.$wrap=c.length?c:a('<div class="backstretch"></div>').css(r).appendTo(this.$container);this.isBody||(c=this.$container.css("position"),b=this.$container.css("zIndex"),this.$container.css({position:"static"===c?"relative":c,zIndex:"auto"===b?0:b,background:"none"}),this.$wrap.css({zIndex:-999998}));this.$wrap.css({position:this.isBody&&l?"fixed":"absolute"});this.index=0;this.show(this.index);a(d).on("resize.backstretch",a.proxy(this.resize,this)).on("orientationchange.backstretch",a.proxy(function(){this.isBody&&0===d.pageYOffset&&(d.scrollTo(0,1),this.resize())},this))};q.prototype={resize:function(){try{var a={left:0,top:0},b=this.isBody?this.$root.width():this.$root.innerWidth(),e=b,g=this.isBody?d.innerHeight?d.innerHeight:this.$root.height():this.$root.innerHeight(),j=e/this.$img.data("ratio"),f;j>=g?(f=(j-g)/2,this.options.centeredY&&(a.top="-"+f+"px")):(j=g,e=j*this.$img.data("ratio"),f=(e-b)/2,this.options.centeredX&&(a.left="-"+f+"px"));this.$wrap.css({width:b,height:g}).find("img:not(.deleteable)").css({width:e,height:j}).css(a)}catch(h){}return this},show:function(c){if(!(Math.abs(c)>this.images.length-1)){var b=this,e=b.$wrap.find("img").addClass("deleteable"),d={relatedTarget:b.$container[0]};b.$container.trigger(a.Event("backstretch.before",d),[b,c]);this.index=c;clearInterval(b.interval);b.$img=a("<img />").css(s).bind("load",function(f){var h=this.width||a(f.target).width();f=this.height||a(f.target).height();a(this).data("ratio",h/f);a(this).fadeIn(b.options.speed||b.options.fade,function(){e.remove();b.paused||b.cycle();a(["after","show"]).each(function(){b.$container.trigger(a.Event("backstretch."+this,d),[b,c])})});b.resize()}).appendTo(b.$wrap);b.$img.attr("src",b.images[c]);return b}},next:function(){return this.show(this.index<this.images.length-1?this.index+1:0)},prev:function(){return this.show(0===this.index?this.images.length-1:this.index-1)},pause:function(){this.paused=!0;return this},resume:function(){this.paused=!1;this.next();return this},cycle:function(){1<this.images.length&&(clearInterval(this.interval),this.interval=setInterval(a.proxy(function(){this.paused||this.next()},this),this.options.duration));return this},destroy:function(c){a(d).off("resize.backstretch orientationchange.backstretch");clearInterval(this.interval);c||this.$wrap.remove();this.$container.removeData("backstretch")}};var l,f=navigator.userAgent,m=navigator.platform,e=f.match(/AppleWebKit\/([0-9]+)/),e=!!e&&e[1],h=f.match(/Fennec\/([0-9]+)/),h=!!h&&h[1],n=f.match(/Opera Mobi\/([0-9]+)/),t=!!n&&n[1],k=f.match(/MSIE ([0-9]+)/),k=!!k&&k[1];l=!((-1<m.indexOf("iPhone")||-1<m.indexOf("iPad")||-1<m.indexOf("iPod"))&&e&&534>e||d.operamini&&"[object OperaMini]"==={}.toString.call(d.operamini)||n&&7458>t||-1<f.indexOf("Android")&&e&&533>e||h&&6>h||"palmGetResource"in d&&e&&534>e||-1<f.indexOf("MeeGo")&&-1<f.indexOf("NokiaBrowser/8.5.0")||k&&6>=k)})(jQuery,window);