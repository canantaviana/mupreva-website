<?php

// generic

// css


// js


// page basic vars
$abstract = $this->get_element_from_template_map('abstract', $template_map->{$mode});
if ($abstract) {
    if (strpos($abstract, 'http') === 0) {
        header("Location: ".$abstract);
        exit();
    } else {
        header("Location: /".$abstract);
        exit();
    }
}
$menu_tree = $this->get_menu_tree_plain(WEB_MENU_PARENT, []);
$childrens = $this->get_children($this->row->term_id, $menu_tree);
if ($childrens && count($childrens) > 0) {
    $next = $childrens[0];
    $url = $next->web_path;
    if (strpos($url, 'http') === 0) {
        header("Location: ".$url);
        exit();
    } else {
        header("Location: /".$url);
        exit();
    }
}
exit();
