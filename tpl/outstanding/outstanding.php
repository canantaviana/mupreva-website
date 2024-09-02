<?php

// outstanding


// css


// js
page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/assets/lib/masonry/masonry.pkgd.min.js';
page::$js_ar_url[]  = __WEB_TEMPLATE_WEB__ . '/assets/lib/masonry/imagesloaded.pkgd.min.js';
page::$js_ar_url[]    = __WEB_TEMPLATE_WEB__ . '/catalog/js/item_list_row' . JS_SUFFIX . '.js';



// page basic vars
$title             = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract          = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body              = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image          = $this->get_element_from_template_map('image', $template_map->{$mode});


// area_name
$area_name = $this->area_name;


// page_title fix
$this->page_title = $this->row->term;
