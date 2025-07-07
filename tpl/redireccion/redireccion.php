<?php

// generic

// css


// js


// page basic vars
$abstract = $this->get_element_from_template_map('abstract', $template_map->{$mode});
if ($abstract) {
    header("Location: ".$abstract);
}
$menu_tree = $this->get_menu_tree_plain(WEB_MENU_PARENT, []);
$childrens = $this->get_children($this->row->term_id, $menu_tree);
if ($childrens && count($childrens) > 0) {
    $next = $childrens[0];
    $url = $next->web_path;
    header("Location: /".$url);
}
exit();
