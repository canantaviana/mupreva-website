<?php

// news



// css
array_unshift(
    page::$css_ar_url,
    __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick.css',
    __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick-theme.css'
);



// js
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/assets/lib/slick/slick.min.js';
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/page/js/render_panels' . JS_SUFFIX . '.js';



// page basic vars
$title             = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract          = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body              = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image          = $this->get_element_from_template_map('image', $template_map->{$mode});


// set page title
$this->page_title = $title;



// area name
$area_name     = $_GET['area_name'];
$ar_parts     = explode('/', $area_name);


$grouper = isset($ar_parts[1])
    ? $ar_parts[1]
    : null;
