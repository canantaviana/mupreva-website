/**
 * REQUEST_METHOD_POLICY tests
 * Plain Node, no framework/deps required: `node web_app/utils/request_method_policy.test.mjs`
 * Exits non-zero on any failure.
 */
import assert from 'node:assert/strict'
import { is_get_safe } from './request_method_policy.mjs'

let passed = 0
let failed = 0

function check(name, actual, expected) {
    try {
        assert.strictEqual(actual, expected)
        passed++
        console.log(`ok   - ${name}`)
    } catch (e) {
        failed++
        console.error(`FAIL - ${name} (expected ${expected}, got ${actual})`)
    }
}

// --- already-covered shapes (must keep working after the refactor) ---

check(
    'ar_fields: ["*"] forces POST',
    is_get_safe({ table: 'objects', ar_fields: ['*'], sql_filter: 'section_id=8339' }),
    false
)

check(
    'ar_fields === "*" (string form) forces POST',
    is_get_safe({ table: 'objects', ar_fields: '*' }),
    false
)

check(
    'ar_fields as a normal field list stays GET-safe',
    is_get_safe({ table: 'objects', ar_fields: ['section_id', 'titulo'] }),
    true
)

check(
    'sql_filter containing a literal double-quote forces POST (getRelatedElements shape)',
    is_get_safe({ table: 'objects', sql_filter: `periodo_data LIKE '%"dc1_12"%' and imagenes_identificativas is not null` }),
    false
)

check(
    'yacimientos.js\'s always-on hardcoded quoted sql_filter still forces POST',
    is_get_safe({ table: 'immovables', sql_filter: `(tipologia_data like "%\\"2\\"%")` }),
    false
)

check(
    'simple numeric section_id sql_filter (no quotes) stays GET-safe',
    is_get_safe({ table: 'objects', sql_filter: 'section_id=8339' }),
    true
)

check(
    'geolocalizacion IS NOT NULL sql_filter (no quotes) stays GET-safe',
    is_get_safe({ table: 'objects', sql_filter: 'geolocalizacion IS NOT NULL' }),
    true
)

// --- new coverage: resolve_portals_custom ---

check(
    'resolve_portals_custom as a pre-stringified JSON string forces POST (portada.js children block shape)',
    is_get_safe({
        table: 'ts_web_mupreva',
        sql_filter: `parents LIKE '%"123"%'`,
        resolve_portals_custom: '{"image": "image"}'
    }),
    false
)

check(
    'resolve_portals_custom as a populated plain object forces POST (yacimientos.js/catalogo.js shape)',
    is_get_safe({ table: 'immovables', resolve_portals_custom: { imagenes_identificativas: 'image' } }),
    false
)

check(
    'resolve_portals_custom as an empty string is unaffected (page.get_records default)',
    is_get_safe({ table: 'activities', sql_filter: 'time_frame is not null', resolve_portals_custom: '' }),
    true
)

check(
    'resolve_portals_custom as an empty object is unaffected',
    is_get_safe({ table: 'activities', resolve_portals_custom: {} }),
    true
)

check(
    'resolve_portals_custom absent entirely is unaffected',
    is_get_safe({ table: 'objects', ar_fields: ['section_id'] }),
    true
)

// --- new coverage: ar_calls / combi (the getSliderPortada bug) ---

check(
    'ar_calls (combi) forces POST even with no top-level sql_filter - this is the getSliderPortada bug',
    is_get_safe({
        dedalo_get: 'combi',
        db_name: 'web_tangible_heritage',
        ar_calls: JSON.stringify([
            { id: 'actividades', options: { dedalo_get: 'records', table: 'activities', sql_filter: 'identifying_image IS NOT NULL AND outstanding="1"' } },
            { id: 'exposiciones', options: { dedalo_get: 'records', table: 'exhibitions', sql_filter: 'identifying_image IS NOT NULL AND outstanding="1"' } }
        ])
    }),
    false
)

check(
    'ar_calls absent is unaffected (ordinary records call)',
    is_get_safe({ dedalo_get: 'records', table: 'objects' }),
    true
)

// --- documented, deliberately NOT fixed in this pass ---

check(
    'KNOWN GAP (not fixed here): sql_filter with SQL function calls/angle brackets but no double-quote ' +
    'still reports GET-safe, even though this exact shape (getActividadesDestacados) is confirmed blocked ' +
    'by the WAF in production/localhost console logs. Tracked separately - see request_method_policy.mjs header.',
    is_get_safe({
        table: 'activities',
        sql_filter: "time_frame is not null and NOW() < STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s')"
    }),
    true
)

// --- malformed/edge inputs ---

check('null body does not throw, defaults to GET-safe', is_get_safe(null), true)
check('body with no recognized keys at all stays GET-safe', is_get_safe({}), true)

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
