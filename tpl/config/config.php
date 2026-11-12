<?php
# config Dédalo API client (web_app)



// used to build absolute calls to elements
define('__WEB_BASE_PATH__', dirname(dirname(dirname(__FILE__))));



// dedalo 4 private conf file
$environment = 'dev'; // dev , pre , prod
if (!in_array($environment, ['dev', 'pre', 'prod'], true)) {
    die('Invalid $environment in config.php: ' . $environment);
}



// custom development working vars (api client)
define('WEB_ENTITY', 'mupreva');
define('WEB_ENTITY_LABEL', 'Museu de Prehistòria de València');

define(
    'WEB_DB',
    [
        'dev'  => 'web_tangible_heritage',
        'pre'  => 'web_tangible_heritage',
        'prod' => 'web_tangible_heritage',
    ][$environment]
);

// site config

// __web_base_url__ . absolute url base to target web. Used to build absolute calls to elements
define(
    '__WEB_BASE_URL__',
    [
        'dev'  => 'https://web2024.mupreva.antaviana.net',
        'pre'  => 'https://pre.map.museum',
        'prod' => 'https://map.museum',
    ][$environment]
);

// media base url
define(
    '__WEB_MEDIA_BASE_URL__',
    [
        'dev'  => 'https://web2024.mupreva.antaviana.net',
        'pre'  => 'https://pre.map.museum',
        'prod' => 'https://map.museum',
    ][$environment]
);

// __WEB_ROOT_WEB__
$base = ''; // (!) name of the website folder like '/web'. If files are in first level leave blank
define('__WEB_ROOT_WEB__', $base);

// web_app_dir
define('WEB_APP_DIR', 'web_app');

// web_dispatch_dir
define('WEB_DISPATCH_DIR', 'web');

// __web_template_web_
define('__WEB_TEMPLATE_PATH__',    __WEB_BASE_PATH__ . '/tpl');
define('__WEB_TEMPLATE_WEB__',    __WEB_ROOT_WEB__  . '/tpl');
define('__WEB_HOME_URL__',    __WEB_ROOT_WEB__);

define(
    '__WEB_MEDIA_ENGINE_URL__',
    [
        //'dev'  => 'https://pre-dedalo.mupreva.org',
        'dev' => 'https://dedalo.map.museum',
        //'pre'  => 'https://pre-dedalo.mupreva.org',
        'pre' => 'https://dedalo.map.museum',
        'prod' => 'https://dedalo.map.museum',
    ][$environment]
);

// matomo (analytics). Tracker base url (protocol-relative, trailing slash) and site id
define(
    'MATOMO_URL',
    [
        'dev'  => '//pre-matomo.dival.es/',
        'pre'  => '//pre-matomo.dival.es/',
        'prod' => '//matomo.dival.es/',
    ][$environment]
);
define(
    'MATOMO_SITE_ID',
    [
        'dev'  => '1',
        'pre'  => '1',
        'prod' => '1', // TODO: confirmar siteId de producció
    ][$environment]
);

// version
include(__WEB_TEMPLATE_PATH__ . '/version.inc');


// api config

// json_trigger_url data source url
define(
    'JSON_TRIGGER_URL',
    [
        //'dev'  => 'https://pre-dedalo.map.museum/dedalo6-pre/publication/server_api/v1/json/',
        'dev'  => 'https://dedalo.map.museum/dedalo6/publication/server_api/v1/json/',
        //'pre'  => 'https://pre-dedalo.map.museum/dedalo6-pre/publication/server_api/v1/json/',
        'pre'  => 'https://dedalo.map.museum/dedalo6/publication/server_api/v1/json/',
        'prod' => 'https://dedalo.map.museum/dedalo6/publication/server_api/v1/json/',
    ][$environment]
);

// dedalo_edit_url. Dédalo back-office record page, linked from detail pages when logged in to Dédalo
define(
    'DEDALO_EDIT_URL',
    [
        //'dev'  => 'https://pre-dedalo.mupreva.org/dedalo6-pre/core/page/',
        'dev'  => 'https://dedalo.map.museum/dedalo6/core/page/',
        //'pre'  => 'https://pre-dedalo.mupreva.org/dedalo6-pre/core/page/',
        'pre'  => 'https://dedalo.map.museum/dedalo6/core/page/',
        'prod' => 'https://dedalo.map.museum/dedalo6/core/page/',
    ][$environment]
);


// api_cache. File cache for json_web_data responses (read-only content API,
// so caching is safe). Avoids re-fetching near-static data (menu, templates...)
// on every single page load. Set API_CACHE_ENABLED to false to disable.
define('API_CACHE_ENABLED', true);
define('API_CACHE_TTL', 300); // seconds
define('API_CACHE_DIR', __WEB_BASE_PATH__ . '/' . WEB_APP_DIR . '/cache/api');

// api curl timeouts (seconds). Prevents a slow/unreachable remote API from
// hanging a page request indefinitely.
define('API_CURL_CONNECT_TIMEOUT', 5);
define('API_CURL_TIMEOUT', 15);

// json_web_data collector. PHP version HTTP request manager (via CURL)
include(__WEB_BASE_PATH__ . '/' . WEB_APP_DIR . '/api/class.json_web_data.php');

// api_web_user_code
# Verification user code (must be identical in config of client and server)
//define('API_WEB_USER_CODE', 'lsi8wM5s$4KueñwkoPwgs'); //mupreva
define('API_WEB_USER_CODE', 'lsi8wM5s$4KueñwkoPwgs'); //quart

// common core functions
include(__WEB_BASE_PATH__ . '/' . WEB_APP_DIR . '/common/class.page.php');
include(__WEB_BASE_PATH__ . '/' . WEB_APP_DIR . '/common/class.common.php');
include(__WEB_BASE_PATH__ . '/' . WEB_APP_DIR . '/common/class.lang.php');

// web_current_lang_code. If received lang use it, else use default lg-ell (Greek)
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('web_' . WEB_ENTITY);
    // session cookie security flags (only sent over https, not readable from js, not sent on cross-site requests)
    session_set_cookie_params([
        'path'     => '/',
        'secure'   => true,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// web_ar_langs. Available web langs
define('WEB_AR_LANGS', json_encode([
    // code: visible abbreviation; lang: BCP 47 tag for lang/hreflang attributes
    "lg-spa" => ['name' => 'Castellano', 'code' => 'es', 'lang' => 'es'],
    "lg-vlca" => ['name' => 'Valencià', 'code' => 'va', 'lang' => 'ca'],
    //"lg-glg" => "Galego",
    "lg-eng" => ['name' => 'English', 'code' => 'en', 'lang' => 'en'],
    "lg-fra" => ['name' => 'Français', 'code' => 'fr', 'lang' => 'fr']
]));

// lang cascade set
define('WEB_DEFAULT_LANG_CODE', 'lg-vlca');
if (isset($_GET['lang'])) {
    $lang = $_GET['lang'];
    $_SESSION['web']['lang'] = $lang;
} elseif (isset($_SESSION['web']['lang'])) {
    $lang = $_SESSION['web']['lang'];
} else {
    $lang = WEB_DEFAULT_LANG_CODE;
}
if (!is_string($lang)) {
    $lang = WEB_DEFAULT_LANG_CODE;
} elseif (strpos($lang, 'lg-') === false) {
    $lang = lang2iso3($lang);
}
// only accept available langs (lang is used in file paths and html output)
if (!array_key_exists($lang, json_decode(WEB_AR_LANGS, true))) {
    $lang = WEB_DEFAULT_LANG_CODE;
    $_SESSION['web']['lang'] = $lang;
}

// web_current_lang_code
define('WEB_CURRENT_LANG_CODE', $lang);

// web_lang_base_path
define('WEB_LANG_BASE_PATH', __WEB_TEMPLATE_PATH__ . '/lang/');



// debug . Show / hide debug messages
// Tied to $environment: never run with debug on in prod (extra error
// reporting/logging overhead and information disclosure on a live site).
$SHOW_DEBUG = ($environment !== 'prod');
if ($SHOW_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
define('SHOW_DEBUG', $SHOW_DEBUG);



// web config
define('WEB_MENU_TABLE', 'ts_web_mupreva');
define('WEB_MENU_SECTION_TIPO', 'www1');
define('WEB_MENU_PARENT', 'www1_106');
define('WEB_FOOT_MENU', 'www1_217');
define('WEB_FOOT_PARENT', 'www1_196');
define('WEB_FOOT_COLUMNS', 'www1_218');
define('WEB_FOOT_LOGOS', 'www1_227');

/*define('WEB_MENU_FOOTER', [
    'contact',
    'accessibility',
    'legal',
    'cookies',
    'credits'
]);*/





# Web template file json
define('WEB_TEMPLATE_MAP', __WEB_BASE_PATH__ . '/config/template_maps/' . WEB_ENTITY);
define('WEB_TEMPLATE_MAP_DEFAULT_SOURCE', 'db');

# web_path_map . run name map for url's path like redirect 'mon' to 'catalogo'
define('WEB_PATH_MAP', []);



// libraries
define('BUILD_BREADCRUMB', false);



// table to temple
define('TABLE_TO_TEMPLATE', json_encode([]));



// fields map
define('WEB_FIELDS_MAP', json_encode([
    'section_id'            => 'section_id',
    'term_id'                => 'term_id',
    'term'                    => 'term',
    'web_path'                => 'web_path',
    'parent'                => 'parent',
    'parents'                => 'parents',
    'children'                => 'children',
    'menu'                    => 'menu',
    'active'                => 'active',
    'template_name'            => 'template_name',
    'title'                    => 'title', // before standard (compatibility)
    'abstract'                => 'abstract',
    'body'                    => 'body',
    'norder'                => 'norder',
    'image'                    => 'image',
    // others
    'identify_image'        => 'identify_image',
    'other_images_resolved'    => 'other_images_resolved',
    'other_images'    => 'other_images',
    //'audiovisual_resolved'    => 'audiovisual_resolved',
    'pdf_resolved'            => 'pdf_resolved',
    'pdf_title'                => 'pdf_title'
]));



// suffix
define('CSS_SUFFIX', '');
define('JS_SUFFIX', ''); // -min



// IS_PRODUCTION. used like 'mib_web'
$path_suffix = substr($base, -3);
$IS_PRODUCTION = ($path_suffix === 'web') ? true : false;
define('IS_PRODUCTION', $IS_PRODUCTION);
