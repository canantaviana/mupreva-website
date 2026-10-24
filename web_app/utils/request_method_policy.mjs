/**
 * REQUEST_METHOD_POLICY
 * Pure, testable decision of whether a data_manager.request() body is safe
 * to send as GET (query string) or must be sent as POST (JSON body).
 *
 * Background: dedalo.mupreva.org sits behind a WAF that blocks GET requests
 * whose query string contains certain patterns - confirmed directly for a
 * literal '*' wildcard in ar_fields (reproduced a vendor block page by
 * navigating straight to the URL) and for literal '"' characters in
 * sql_filter (reproduced via console testing against real API responses).
 * resolve_portals_custom and ar_calls are added here because, structurally,
 * they always produce the same quote-bearing shape once serialized into a
 * GET query string - see data_manager.js for how that serialization works.
 *
 * Known gap NOT covered here (deliberately out of scope for this change -
 * see request_method_policy.test.mjs for a documenting regression test):
 * sql_filter built from SQL function calls / comparison operators without
 * any double-quote character (e.g. "NOW() < STR_TO_DATE(...)" in
 * api.js's getActividadesDestacados) still reads as risky to the same WAF,
 * confirmed via production/localhost console logs, but isn't pattern-
 * matched by this policy. This needs separate investigation into the WAF's
 * actual ruleset before guessing at another narrow character check.
 *
 * @param object body - the same object passed as `options.body` to
 *   data_manager.request (table/sql_filter/ar_fields/resolve_portals_custom/
 *   ar_calls/etc., un-serialized).
 * @return boolean true if GET is safe to attempt (still subject to the
 *   caller's own URL-length fallback), false if POST must be used.
 */
export function is_get_safe(body) {
    if (!body || typeof body !== 'object') {
        return true;
    }

    // ar_fields: ['*'] (full-record detail fetches) - a raw '*' wildcard
    // in the query string reads as a SQL SELECT-* / glob pattern.
    const has_wildcard_fields = Array.isArray(body.ar_fields)
        ? body.ar_fields.indexOf('*') !== -1
        : body.ar_fields === '*';

    // sql_filter containing a literal double-quote - Dedalo's
    // "field LIKE '%\"value\"%'" JSON-array-contains-value filters read as
    // a quote-escape attempt.
    const has_risky_filter = typeof body.sql_filter === 'string'
        && body.sql_filter.indexOf('"') !== -1;

    // resolve_portals_custom, when populated, is always quote-bearing:
    // either already a pre-stringified JSON string (e.g. '{"image":"image"}')
    // or a plain object that data_manager.request's own GET-builder
    // JSON.stringify()s before appending to the query string - both land
    // raw '"' characters in the URL regardless of what sql_filter contains.
    const rpc = body.resolve_portals_custom;
    const has_populated_portals = typeof rpc === 'string'
        ? rpc.trim().length > 0
        : !!(rpc && typeof rpc === 'object' && Object.keys(rpc).length > 0);

    // ar_calls (dedalo_get: 'combi') is always a JSON.stringify()'d array of
    // sub-call definitions - structurally guaranteed to contain quotes. Any
    // sql_filter/resolve_portals_custom nested inside those sub-calls is
    // invisible to the two checks above, since it never becomes a top-level
    // body key - this is exactly how getSliderPortada's combi call (which
    // nests `sql_filter: "...outstanding=\"1\""` inside ar_calls) bypassed
    // the original has_risky_filter check entirely.
    const has_combi_calls = typeof body.ar_calls === 'string'
        && body.ar_calls.trim().length > 0;

    return !(has_wildcard_fields || has_risky_filter || has_populated_portals || has_combi_calls);
}//end is_get_safe
