// codi modificat a partir de 'node_modules/@10up/component-accordion/dist/index.umd.js', per poder posar encapçalaments (h2, h3) a l'accordion, seguint aquesta estructura: <h2><button></button></h2>
!function (t, e) { "object" == typeof exports && "undefined" != typeof module ? e(exports) : "function" == typeof define && define.amd ? define(["exports"], e) : e((t || self).TenUpAccordion = {}) }(this, function (t) {
    function e(){return (e=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];
    for(var o in n) Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}
    return t}).apply(this,arguments)}
    var n=function(){
        function t(t,n){
            var o=this;
            void 0===n&&(n={}),
            this.evtCallbacks={},
            window.NodeList&&!NodeList.prototype.forEach&&(NodeList.prototype.forEach=function(t,e){
                e=e||window;for(var n=0;n<this.length;n++)t.call(e,this[n],n,this)
            }),
            t&&"string"==typeof t?(this.$accordions=document.querySelectorAll(t),
            this.$accordions?(document.documentElement.classList.add("js"),
            this.settings=e({},{onCreate:null,onOpen:null,onClose:null,onToggle:null},n),
            this.$accordions.forEach(function(t,e){o.setupAccordion(t,e)}),
            this.settings.onCreate&&"function"==typeof this.settings.onCreate&&this.settings.onCreate.call()):
            console.error("10up Accordion: Target not found. A valid target (accordion area) must be used.")):
            console.error("10up Accordion: No target supplied. A valid target (accordion area) must be used.")}

            var n=t.prototype;
            return n.destroy=function(){var t=this;this.removeAllEventListeners(),this.$accordions.forEach(function(e){var n=t.getAccordionLinksAndContent(e),o=n[1];n[0].forEach(function(t){t.removeAttribute("id"),t.removeAttribute("aria-expanded"),t.removeAttribute("aria-controls")}),o.forEach(function(t){t.removeAttribute("id"),t.removeAttribute("aria-hidden"),t.removeAttribute("aria-labelledby")})})},
            n.getAccordionLinksAndContent=function(t){
                var e=t.querySelectorAll(".accordion-header button"),
                n=t.querySelectorAll(".accordion-content");
                return [Array.prototype.slice.call(e).filter(function(e){return e.closest('.accordion-header').parentNode===t}),
                Array.prototype.slice.call(n).filter(function(e){return e.parentNode===t})]},
            n.addEventListener=function(t,e,n){void 0===this.evtCallbacks[e]&&(this.evtCallbacks[e]=[]),this.evtCallbacks[e].push({element:t,callback:n}),t.addEventListener(e,n)},
            n.removeAllEventListeners=function(){var t=this;Object.keys(this.evtCallbacks).forEach(function(e){t.evtCallbacks[e].forEach(function(t){t.element.removeEventListener(e,t.callback)})})},
            n.setupAccordion=function(t,e){
                var n=this,o=this.getAccordionLinksAndContent(t),i=o[0],r=o[1];
                this.addEventListener(t,"keydown",function(e){var o=e.target,r=e.which;o.classList.contains("accordion-header")&&o.parentNode===t&&n.accessKeyBindings(i,o,r,e)}),
                i.forEach(function(t,o){
                    var parentHeader = t.closest('.accordion-header');
                    parentHeader.setAttribute("id","tab"+e+"-"+o),
                    t.setAttribute("aria-expanded","false"),
                    t.setAttribute("aria-controls","panel"+e+"-"+o),
                    n.addEventListener(t,"click",function(t){t.preventDefault(),n.toggleAccordionItem(t)})}),
                    r.forEach(function(t,n){t.setAttribute("id","panel"+e+"-"+n),t.setAttribute("aria-hidden","true"),t.setAttribute("aria-labelledby","tab"+e+"-"+n)})},
            n.openAccordionItem=function(t){var e=t.content;t.link.setAttribute("aria-expanded","true"),e.setAttribute("aria-hidden","false"),this.settings.onOpen&&"function"==typeof this.settings.onOpen&&this.settings.onOpen.call(t)},
            n.closeAccordionItem=function(t){var e=t.content;t.link.setAttribute("aria-expanded","false"),e.setAttribute("aria-hidden","true"),this.settings.onClose&&"function"==typeof this.settings.onClose&&this.settings.onClose.call(t)},
            n.toggleAccordionItem=function(t){
                var e=t.target.closest('.accordion-header').querySelector('button'),
                n=e.closest('.accordion-header').nextElementSibling;
                if (!n) return; // Handle the case where nextElementSibling is null
                var o=n.querySelector(".accordion-label"),i={link:e,content:n,heading:o};
                e.classList.toggle("is-active"),n.classList.toggle("is-active"),o&&(o.setAttribute("tabindex",-1),o.focus()),
                n.classList.contains("is-active")?this.openAccordionItem(i):this.closeAccordionItem(i),
                this.settings.onToggle&&"function"==typeof this.settings.onToggle&&this.settings.onToggle.call(i)},
            n.accessKeyBindings=function(t,e,n,o){var i;switch(t.forEach(function(t,n){e===t&&(i=n)}),n){case 35:i=t.length-1,o.preventDefault();break;case 36:i=0,o.preventDefault();break;case 38:--i<0&&(i=t.length-1),o.preventDefault();break;case 40:++i>t.length-1&&(i=0),o.preventDefault()}t[i].focus()},
            t}();"object"!=typeof window.TenUp&&(window.TenUp={}),window.TenUp.Accordion=n,window.TenUp.accordion=n,t.Accordion=n,t.default=n
});
