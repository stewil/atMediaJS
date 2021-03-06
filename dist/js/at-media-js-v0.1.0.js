(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
    module.exports = debounce;
    /**
     * Credit : https://davidwalsh.name/function-debounce
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate){
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow){
                func.apply(context, args);
            }
        };
    }

})();
},{}],2:[function(require,module,exports){
(function () {
    'use strict';

    window['atMedia'] = new AtMedia();


    function AtMedia() {

        /*========================================================================
            PRIVATE VARIABLES
         ========================================================================*/

        var _settings = {
            element:null,
            breakpoints:["default", "xs", "sm", "md", "lg"],
            debounce:50,
            debug:false
        };

        var service,
            body            =   document.querySelector('body'),
            onChangeQueue   =   [];
        /*========================================================================
            PUBLIC METHODS
         ========================================================================*/
        this.create = create;

        /*========================================================================
            LISTENERS / OBSERVERS / INIT
         ========================================================================*/

        /*========================================================================
            PRIVATE METHODS
        ========================================================================*/
        var debounce = require('./components/debounce/debounce.js');

        function create(settings){

            var onResize = debounce(onViewportChange, _settings['debounce']);

            service = this;

            for(var prop in settings){
                _settings[prop] = prop;
            }

            if (!_settings.element || document.contains(_settings.element)) {
                createBreakpointElement();
            }

            window.addEventListener('resize', onResize);

            this.closestInRange         =       closestInRange;
            this.current                =       findCurrent();
            this.currentLargerThan      =       currentLargerThan;
            this.onChange               =       subscribe;
            this.remove                 =       remove;

            function createBreakpointElement(){
                _settings.element = document.querySelector("[data-breakpoints]");
                if(!_settings.element){
                    _settings.element = document.createElement('div');
                    _settings.element.setAttribute('data-breakpoints', '');
                    body.appendChild(_settings.element);
                }
            }
        }

        function remove(){
            window.removeEventListener('resize', onResize);

            service         = null;
            onChangeQueue   = [];
        }

        function onViewportChange(){
            if (findCurrent() !== service.current) {
                service.current = findCurrent();
                notify();
            }
        }

        /**
         * Accepts a Function to be executed on breakpoint change
         * @param fn
         * @returns {Subscriber}
         */
        function subscribe (fn){
            onChangeQueue.push(fn);

            //We execute the function on subscription to ensure the function is returned
            //a value on binding
            fn(service.current);
            return new Subscriber(fn);

            function Subscriber(fn){
                this.remove = function(){
                    if(onChangeQueue.indexOf(fn) > -1){
                        onChangeQueue.splice(onChangeQueue.indexOf(fn), 1);
                    }
                }
            }
        }

        /**
         * Executes all stored subscribers
         */
        function notify(){
            var l = onChangeQueue.length;

            while(l--){
                try{
                    onChangeQueue[l](service.current);
                }catch(err){
                    onChangeQueue.splice(l, 1);
                }
            }
        }

        /**
         * Returns the breakpoint to match the current breakpoint in a range
         * @param sizes
         * @returns {*|string}
         */
        function closestInRange(sizes) {
            var current = findCurrent(),
                found;

            if (sizes[current]) {
                found = current;
            } else {
                var index = _settings.breakpoints.indexOf(current);

                checkForBp : while(index--){
                    for (var size in sizes) {
                        if (size === _settings.breakpoints[index]) {
                            found = size;
                            break checkForBp;
                        }
                    }
                }
            }
            return found || "default";
        }

        /**
         * Returns true/false if the current breakpoint is larger the value supplied
         * @param bp
         * @returns {boolean}
         */
        function currentLargerThan(bp) {
            var idx = _settings.breakpoints.indexOf(findCurrent()) + 1;

            while (idx--) {
                if (bp === _settings.breakpoints[idx]) {
                    return true;
                }
            }
            return false;
        }

        function findCurrent() {
            return (window.getComputedStyle(_settings.element, ':after').getPropertyValue('content').replace(/'|"/g, '') || "default");
        }

    }
})();
},{"./components/debounce/debounce.js":1}]},{},[2]);
