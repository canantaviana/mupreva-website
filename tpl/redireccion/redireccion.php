<?php

// generic

// css


// js


// page basic vars
// redirect target: the abstract (a path like '/yacimientos') when set, else the first child page.
// exit after each redirect: a second header('Location') would replace the first one
$abstract = $this->get_element_from_template_map('abstract', $template_map->{$mode});
if ($abstract) {
    header("Location: ".$abstract);
    exit();
}
$menu_tree = $this->get_menu_tree_plain(WEB_MENU_PARENT, []);
$childrens = $this->get_children($this->row->term_id, $menu_tree);
if ($childrens && count($childrens) > 0) {
    $next = $childrens[0];
    $url = $next->web_path;
    header("Location: /".$url);
}
exit();
