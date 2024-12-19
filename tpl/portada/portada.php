<?php

// page basic vars
$title             = $this->get_element_from_template_map('title', $template_map->{$mode});
$abstract          = $this->get_element_from_template_map('abstract', $template_map->{$mode});
$body              = $this->get_element_from_template_map('body', $template_map->{$mode});
$ar_image          = $this->get_element_from_template_map('image', $template_map->{$mode});


$images = $this->row->other_images;

// body images fix url paths
$body = str_replace('../../../media', __WEB_BASE_URL__ . '/dedalo/media', $body);

// web_path
$web_path = $this->row->web_path;
