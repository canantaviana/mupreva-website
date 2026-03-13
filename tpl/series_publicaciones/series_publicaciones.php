<?php

// bibio



// css
	// Prepend this style to the beginning of 'page::$css_ar_url' array to decrease its prevalence
		array_unshift(page::$css_ar_url,
			__WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.css'
		);


// js
	page::$js_ar_url[]	= __WEB_TEMPLATE_WEB__ . '/assets/lib/jquery-ui/jquery-ui.min.js';


// page basic vars
	$title 			= $this->get_element_from_template_map('title', $template_map->{$mode});
	$abstract  		= $this->get_element_from_template_map('abstract', $template_map->{$mode});
	$body  			= $this->get_element_from_template_map('body', $template_map->{$mode});
	$ar_image  		= $this->get_element_from_template_map('image', $template_map->{$mode});


    $pdf = [];
    if ($this->row->pdf_resolved && $this->row->pdf_title) {
        $pdf_resolved = json_decode($this->row->pdf_resolved, true);
        $pdf_title = json_decode($this->row->pdf_title, true);
        if (count($pdf_resolved) > 0 && count($pdf_title) > 0 && count($pdf_resolved) == count($pdf_title)) {
            foreach ($pdf_resolved as $key => $pdf_url) {
                $pdf[] = [
                    'pdf'   => __WEB_MEDIA_ENGINE_URL__.$pdf_url,
                    'image'   => str_replace('.pdf', '.jpg', __WEB_MEDIA_ENGINE_URL__.$pdf_url),
                    'title' => $pdf_title[$key]
                ];
            }
        }
    }



// page_title fix
	$this->page_title = $this->row->term;

    // area name
$area_name    = $_GET['area_name'];
$ar_parts    = explode('/', $area_name);

// term_id (is inside get var 'area_name' as '/thesaurus/technique1_92')
$serie = end($ar_parts);
