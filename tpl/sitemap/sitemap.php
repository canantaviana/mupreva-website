<?php

// mon

// css
page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';


// js


// page basic vars
$title        = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract    = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body        = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image    = $this->get_element_from_template_map('image', $template_map->{$mode});


// body images fix url paths
$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);


// list
$menu_tree = $this->get_menu_tree_plain($term_id = WEB_MENU_PARENT, $exclude = [1, 7]);

$list = array_map(function ($row) {
    $item = new stdClass();
    $item->term_id            = $row->term_id;
    $item->term                = $row->term;
    $item->web_path            = $row->web_path;
    $item->menu                = $row->menu;
    $item->title            = $row->title;
    $item->template_name    = $row->template_name;
    $item->norder            = intval($row->norder);

    return $item;
}, $menu_tree);


// sort list by term
usort($list, function ($a, $b) {
    return strcmp($a->term, $b->term);
});

// exclude_template_name
$exclude_template_name = [
    '',
    'item',
    'sitemap',
    'panels',
    'news_detail',
    'exhibition',
    'exhibition_detail'
];

// exclude_web_path
$exclude_web_path = [
    '',
    'test',
    'download_license'
];
