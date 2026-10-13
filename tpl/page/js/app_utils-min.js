!function () {
"use strict";

function data_manager() {}

data_manager.prototype.request = async function (options) {

    const url = options.url || page_globals.JSON_TRIGGER_URL
    const mode = options.mode || 'cors'
    const credentials = options.credentials || 'same-origin'
    const redirect = options.redirect || 'follow'
    const referrer = options.referrer || 'no-referrer'
    const body = options.body

    if (!body.code) {
        body.code = page_globals.API_WEB_USER_CODE
    }
    if (!body.lang) {
        body.lang = page_globals.WEB_CURRENT_LANG_CODE
    }

    const handle_errors = function (response) {
        if (!response.ok) {
            console.warn("-> handle_errors response:", response);
            throw Error(response.statusText);
        }
        return response;
    }

    // This API is entirely read-only and sends long-lived Cache-Control /
    // Expires headers on every response. Those only do anything if the
    // request is GET - browsers never use the HTTP cache for POST
    // regardless of response headers, and a JSON POST body also forces a
    // CORS preflight (OPTIONS) round-trip on every call. GET with the body
    // folded into the query string lets identical repeated requests be
    // served straight from the browser cache with zero network round-trip,
    // and skips the preflight since a plain GET with no custom headers is
    // a CORS "simple request". Falls back to POST if the serialized query
    // string would be unusually large (e.g. a complex multi-filter
    // search), to stay comfortably under URL length limits.
    const MAX_GET_URL_LENGTH = 6000
    const requested_method = options.method || 'GET'

    let fetch_url = url
    let fetch_options = {
        mode: mode,
        credentials: credentials,
        redirect: redirect,
        referrer: referrer,
    }

    let use_get = requested_method === 'GET'
    if (use_get) {
        const params = new URLSearchParams()
        for (const key in body) {
            const value = body[key]
            if (value === undefined || value === null) continue
            const serialized = (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
                ? String(value)
                : JSON.stringify(value)
            params.append(key, serialized)
        }
        const candidate_url = url + '?' + params.toString()
        if (candidate_url.length <= MAX_GET_URL_LENGTH) {
            fetch_url = candidate_url
            fetch_options.method = 'GET'
            fetch_options.cache = options.cache || 'default'
        } else {
            use_get = false
        }
    }

    if (!use_get) {
        fetch_options.method = requested_method === 'GET' ? 'POST' : requested_method
        fetch_options.headers = options.headers || { 'Content-Type': 'application/json' }
        fetch_options.cache = options.cache || 'no-cache'
        fetch_options.body = JSON.stringify(body)
    }

    return fetch(fetch_url, fetch_options)
        .then(handle_errors)
        .then(response => response.json().then((result) => result))
        .catch(error => {
            console.error("!!!!! [page data_manager.request] ERROR:", error)
            return {
                result: false,
                msg: error.message,
                error: error
            }
        });
}

window.data_manager = new data_manager();

window.event_manager = new function () {
    this.events = [];
    this.last_token = -1;
    this.subscribe = function (event_name, callback) {
        const token = "event_" + String(++this.last_token);
        const item = { event_name: event_name, token: token, callback: callback };
        this.events.push(item);
        return token;
    };
    this.unsubscribe = function (token) {
        return this.events.map((function (item, index, arr) {
            if (item.token === token) { arr.splice(index, 1); }
        }));
    };
    this.publish = function (event_name, data = {}) {
        const matches = this.events.filter((function (item) { return item.event_name === event_name; }));
        if (matches) {
            return matches.map((function (item) { return item.callback(data); }));
        }
        return false;
    };
    this.get_events = function () {
        return this.events;
    };
    this.fire_event = function (element, event_name) {
        var doc;
        if (element.ownerDocument) {
            doc = element.ownerDocument;
        } else if (element.nodeType === 9) {
            doc = element;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + element.id);
        }
        if (element.dispatchEvent) {
            var event_class = "";
            switch (event_name) {
                case "click":
                case "mousedown":
                case "mouseup":
                    event_class = "MouseEvents";
                    break;
                case "focus":
                case "change":
                case "blur":
                case "select":
                    event_class = "HTMLEvents";
                    break;
                default:
                    throw "fireEvent: Couldn't find an event class for event '" + event_name + "'.";
            }
            var bubbles = event_name != "change";
            var evt = doc.createEvent(event_class);
            evt.initEvent(event_name, bubbles, true);
            evt.synthetic = true;
            element.dispatchEvent(evt, true);
        } else if (element.fireEvent) {
            var evt2 = doc.createEventObject();
            evt2.synthetic = true;
            element.fireEvent("on" + event_name, evt2);
        }
    };
    this.when_in_dom = function (node, callback) {
        const observer = new MutationObserver((function (mutations) {
            if (document.contains(node)) {
                observer.disconnect();
                callback(this);
            }
        }));
        observer.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
        return observer;
    };
}();

}();
