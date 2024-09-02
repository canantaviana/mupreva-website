<?php

// news_detail


// css
array_unshift(
    page::$css_ar_url,
    __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick.css',
    __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick-theme.css'
);


// js
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick.min.js';
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/page/js/render_panels' . JS_SUFFIX . '.js';
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/news/js/news' . JS_SUFFIX . '.js';


// page basic vars
$title = $this->get_element_from_template_map('title', $template_map->{$mode});


// set page title
$this->page_title = $title;

// news info
$row_news = array_find($this->data_combi[1]->result, function ($el) {
    return $el->template_name === 'news';
});
// overwrite default page breadcrumb
$this->breadcrumb = [
    (object)[
        'label'    => $row_news->term,
        'path'    => '/' . $row_news->web_path
    ]
];

// area name
$area_name     = $_GET['area_name'];
$ar_parts     = explode('/', $area_name);

// section_id (is inside get var 'area_name' as '/news_detail/36')
$section_id = isset($ar_parts[1])
    ? (int)$ar_parts[1]
    : null;
