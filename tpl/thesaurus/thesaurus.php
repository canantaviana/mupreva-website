<?php

// thesaurus

// css
page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';
//page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/thesaurus/css/thesaurus.css';


// js
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';

// page basic vars
$title        = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract    = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body        = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image    = $this->get_element_from_template_map('image', $template_map->{$mode});

// body images fix url paths
$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);

// page_title fix
//$this->page_title = $this->row->term;

// area name
$area_name    = $_GET['area_name'];
$ar_parts    = explode('/', $area_name);

// term_id (is inside get var 'area_name' as '/thesaurus/technique1_92')
$term_id = isset($ar_parts[1])
    ? $ar_parts[1]
    : null;

// thesaurus_options
$thesaurus_options = (object)[
    'table'        => ['ts_object', 'ts_chronological', 'ts_thematic', 'ts_material', 'ts_technique'],
    'root_term'    => ['object1_1', 'dc1_83', 'ts1_1', 'material1_89', 'technique1_1'],
    'term_id'    => $term_id // options request term_id add
];
