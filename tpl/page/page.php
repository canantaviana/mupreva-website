<?php
// page controller


// base_links
$base_links = common::get_base_links();
define('BASE_LINKS', $base_links);

// css
page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/css/app.css';
//page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/css/page.css';


// js
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/app.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.dropotron.min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.scrolly.min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/jquery.scrollex.min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/lz-string/lz-string.min.js';

page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/browser.min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/breakpoints.min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/util.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/js/main.js';
//app-min
//page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/app-min.js';
page::$js_ar_url[] = __WEB_ROOT_WEB__ . '/' . WEB_APP_DIR . '/common/js/common.js';
page::$js_ar_url[] = __WEB_ROOT_WEB__ . '/' . WEB_APP_DIR . '/factory/form_factory.js';
page::$js_ar_url[] = __WEB_ROOT_WEB__ . '/' . WEB_APP_DIR . '/factory/list_factory.js';
page::$js_ar_url[] = __WEB_ROOT_WEB__ . '/' . WEB_APP_DIR . '/factory/map_factory.js';
page::$js_ar_url[] = __WEB_ROOT_WEB__ . '/' . WEB_APP_DIR . '/factory/tree_factory.js';
page::$js_ar_url[] = __WEB_ROOT_WEB__ . '/' . WEB_APP_DIR . '/factory/timeline_factory.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/app_utils-min.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/page.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/render_page.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/data.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/data_export.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/video_player.js';

page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/page/js/modules.js';
// fi app-min

// breadcrumb
$this->breadcrumb = $this->get_breadcrumb();
/*$this->breadcrumb = empty($this->breadcrumb)
    ? (!empty($this->row)
        ? [
            (object)[
                'label'    => $this->row->term,
                'path'    => '/' . $this->row->web_path
            ]
        ]
        : null)
    : $this->breadcrumb;*/

// menu tree
$menu_tree = $this->get_menu_tree_plain(WEB_MENU_PARENT, []);

// ul drawer
$ul_drawer = function ($term_id, $html) {
    if ($term_id === WEB_MENU_PARENT) {
        $html = PHP_EOL . '<ul class="has-text-weight-medium" id="main-nav">' . $html . '</ul>' . PHP_EOL;
    } else {
        $html = PHP_EOL . '<ul class="">' . $html . '</ul>' . PHP_EOL;
    }

    return $html;
};

// li drawer
$li_drawer = function ($menu_element, $embed_html = '') {

    $web_path = $menu_element->web_path === 'main_home' ? '' : $menu_element->web_path;

    $html  = '';
    $html .= PHP_EOL . ' <li class="'.((!empty($embed_html))?'has-submenu':'').'" role="' . $menu_element->web_path . '">';

    $url = __WEB_ROOT_WEB__ . '/' . $web_path;
    $active = (isset($menu_element->active) && $menu_element->active !== 'no')
        ? true
        : false;

    if ($active === true) {
        $html .= '<a href="' . $url . '" class="has-text-white">' . $menu_element->term . '</a>';
    } else {
        $html .= '<a href="#" class="has-text-white">' . $menu_element->term . '</a>';
    }

    $html .= $embed_html;
    $html .= '</li>';

    return $html;
};

// menu_tree_html
$this->menu_tree_html = page::render_menu_tree_plain(WEB_MENU_PARENT, $menu_tree, $li_drawer, $ul_drawer, 'children', 2);

$this->menu_footer = array_filter($menu_tree, function($item){
    return in_array($item->web_path, WEB_MENU_FOOTER);
});

//menu apartat
// ul drawer
$ul_title_drawer = function ($term_id, $html) {
    $html = PHP_EOL . '<ul class="is-flex is-flex-wrap-wrap is-align-items-baseline link-dn has-text-weight-medium">' . $html . '</ul>' . PHP_EOL;
    return $html;
};

// li drawer
$li_title_drawer = function ($menu_element, $embed_html = '') {

    $web_path = $menu_element->web_path === 'main_home' ? '' : $menu_element->web_path;

    $html  = '';
    $html .= PHP_EOL . ' <li role="' . $menu_element->web_path . '">';

    $url = __WEB_ROOT_WEB__ . '/' . $web_path;
    $active = (isset($menu_element->active) && $menu_element->active !== 'no')
        ? true
        : false;

    if ($active === true) {
        $html .= '<a href="' . $url . '">' . $menu_element->term . '</a>';
    } else {
        $html .= '<a href="#">' . $menu_element->term . '</a>';
    }
    $html .= '</li>';

    return $html;
};
// menu_tree_html
if ($this->breadcrumb && count($this->breadcrumb) > 2) {
    $this->menu_title_html = page::render_menu_tree_plain($this->breadcrumb[2]->term_id, $menu_tree, $li_title_drawer, $ul_title_drawer);
}





// custom_strings
/*$this->custom_strings = [];
$this->custom_strings['nota_legal'] = array_find($menu_tree, function ($item) {
    return $item->web_path === 'legal';
})->title;
$this->custom_strings['cookies'] = array_find($menu_tree, function ($item) {
    return $item->web_path === 'cookies';
})->title;
$this->custom_strings['help'] = array_find($menu_tree, function ($item) {
    return $item->web_path === 'help';
})->title ?? null;
$this->custom_strings['sitemap'] = array_find($menu_tree, function ($item) {
    return $item->web_path === 'sitemap';
})->title;*/

// footer_html
$this->footer_html = '';

// content_html
$content_options = new stdClass();
$content_options->template_map         = $template_map; // Defined in method page->render_page_html
$content_options->mode                 = $mode; // Defined in method page->render_page_html
$content_options->add_common_css     = false;
$content_options->add_template_css     = true;
$content_options->resolve_values     = true;

$content_html = $this->get_template_html($content_options);

// page title
$page_title = $this->get_page_title();

// build links css/js
$css_links     = $this->get_header_links('css');
$js_links     = $this->get_header_links('js', ['js_async' => 'defer']);

// area name
$area_name     = $_GET['area_name'];
$ar_parts     = explode('/', $area_name);
