<?php

// generic

// css


// js


// page basic vars
$abstract = $this->get_element_from_template_map('abstract', $template_map->{$mode});
if ($abstract) {
    header("Location: ".$abstract);
}
exit();
