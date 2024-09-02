<?php

// research

// css
page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/highlight/styles/default.css';
page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css';

page::$css_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui.css';
page::$css_ar_url[] = 'https://fonts.googleapis.com/css?family=Open+Sans:400,700|Source+Code+Pro:300,600|Titillium+Web:400,600,700';



// js
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui-bundle.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/research/ui/swagger-ui-standalone-preset.js';
page::$js_ar_url[] = __WEB_TEMPLATE_WEB__ . '/assets/lib/highlight/highlight.pack.js';



// page basic vars
$title             = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract          = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body              = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image          = $this->get_element_from_template_map('image', $template_map->{$mode});


// body images fix url paths
$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);


$check_https = function () {
    if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == 443) {
        return true;
    }
    return false;
};
$protocol  = true === $check_https() ? 'https' : 'http';


// full url of JSON file to load (used to validate the JSON file from swagger site)
$source_file_url = $protocol . '://' . $_SERVER['HTTP_HOST'] . __WEB_TEMPLATE_WEB__ . '/research/ui/json/json.php';
