/*global get_label, page_globals, SHOW_DEBUG */
/*eslint no-undef: "error"*/

import { is_get_safe } from './request_method_policy.mjs'



/**
* DATA_LOADER
*/
export const data_manager = function () {

}//end data_manager



/**
* REQUEST
* Make a fetch request to server api
* @param object options
* @return promise api_response
*/
data_manager.prototype.request = async function (options) {

    // console.log("++++ request options:",options);

    const url = options.url || page_globals.JSON_TRIGGER_URL
    const mode = options.mode || 'cors' // no-cors, cors, *same-origin
    const credentials = options.credentials || 'same-origin' // include, *same-origin, omit
    const redirect = options.redirect || 'follow' // manual, *follow, error
    const referrer = options.referrer || 'no-referrer' // no-referrer, *client
    const body = options.body // body data type must match "Content-Type" header

    // code defaults
    if (!body.code) {
        body.code = page_globals.API_WEB_USER_CODE
    }
    // lang defaults
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

    // This API is entirely read-only (dedalo_get: records/combi/thesaurus_*)
    // and the server already sends long-lived Cache-Control/Expires headers
    // on every response. Those headers only do anything if the request is
    // GET - browsers don't use the HTTP cache for POST regardless of
    // response headers, and a JSON POST body also forces a CORS preflight
    // (OPTIONS) round-trip on every single call. Using GET with the body
    // folded into the query string lets the browser serve identical
    // repeated requests (e.g. switching back to a view/table you already
    // loaded) straight from cache with zero network round-trip, and skips
    // the preflight entirely since a plain GET with no custom headers is a
    // CORS "simple request".
    //
    // Safety net: if a caller explicitly asks for a different method, or
    // the serialized query string would be unusually large (e.g. a complex
    // multi-filter search), fall back to POST to stay comfortably under
    // URL length limits (browsers/servers typically allow several thousand
    // characters; 6000 leaves ample margin).
    const MAX_GET_URL_LENGTH = 6000
    const requested_method = options.method || 'GET'

    // See request_method_policy.mjs for the full rationale and known gaps:
    // some request shapes (ar_fields:['*'], sql_filter/resolve_portals_custom/
    // ar_calls carrying literal quotes) get flagged by the WAF in front of
    // the API and blocked outright when sent as GET. POST keeps the same
    // payload inside the JSON body instead, where it isn't pattern-matched
    // the same way.
    const get_body_is_safe = is_get_safe(body)

    let fetch_url = url
    let fetch_options = {
        mode: mode,
        credentials: credentials,
        redirect: redirect,
        referrer: referrer,
    }

    let use_get = requested_method === 'GET' && get_body_is_safe
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
            // 'default' lets the browser serve a still-fresh cached
            // response without even contacting the server. The old
            // 'no-cache' default would force a revalidation round-trip
            // every time, defeating the point of switching to GET.
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

    const api_response = fetch(fetch_url, fetch_options)
        .then(handle_errors)
        .then(response => {
            // console.log("-> json response 1 ok:",response.body);
            const json_parsed = response.json().then((result) => {
                //console.log("-> json result 2:",result);
                return result
            })
            return json_parsed
        })// parses JSON response into native JavaScript objects
        .catch(error => {
            console.error("!!!!! [page data_manager.request] ERROR:", error)
            return {
                result: false,
                msg: error.message,
                error: error
            }
        });

    return api_response
}//end request



/**
* DOWNLOAD_URL
* @param string url
* @param string filename
* Download url blob data and create a temporal auto-fired link
*/
export function download_url(url, filename) {

    fetch(url)
        .then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", filename);
                a.click();
                a.remove();
            });
        });
}//end download_url
