<?php

// panels


// css
array_unshift(
    page::$css_ar_url,
    __WEB_TEMPLATE_WEB__ . '/assets/lib/vertical-timeline-master/assets/css/style.css',
    __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.css',
    __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/MarkerCluster.css',
    __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick.css',
    __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick-theme.css'
);


// js
page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/assets/lib/masonry/masonry.pkgd.min.js';
page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/assets/lib/masonry/imagesloaded.pkgd.min.js';

page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/leaflet.js';
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/assets/lib/leaflet/markercluster/leaflet.markercluster.js';
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick.min.js';

page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/exhibition/js/exhibition' . JS_SUFFIX . '.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/render_panels' . JS_SUFFIX . '.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalog/js/catalog' . JS_SUFFIX . '.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/catalog/js/item_list_row' . JS_SUFFIX . '.js';


// page basic vars
$title             = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract          = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body              = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image          = $this->get_element_from_template_map('image', $template_map->{$mode});


// body images fix url paths
$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);

// set page title
$this->page_title = $this->row->term;

// exhibitions info
$row_exhibitions = array_find($this->data_combi[1]->result, function ($el) {
    return $el->template_name === 'exhibitions';
});
// overwrite default page breadcrumb
$this->breadcrumb = [
    (object)[
        'label'    => $row_exhibitions->term,
        'path'    => '/' . $row_exhibitions->web_path
    ]
];

// area name
$area_name     = $_GET['area_name'];
$ar_parts     = explode('/', $area_name);

$code = isset($ar_parts[1])
    ? $ar_parts[1]
    : null;

$subparts = $code !== null
    ? explode('.', $code)
    : [];

$exhibition_section_id    = $subparts[0] ?? null; // exhibition section_id
$toc_panel_section_id    = $subparts[1] ?? null; // panel section_id
$toc_panel_key            = $subparts[2] ?? null; // key key