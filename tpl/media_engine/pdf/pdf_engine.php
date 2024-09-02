<?php
// Turn off output buffering
	ini_set('output_buffering', 'off');


// Get file and send as image hiding real image path
	$id = isset($_GET['id']) ? $_GET['id'] : null;

	if (empty($id)) {
		header("HTTP/1.0 404 Not Found");
		echo "Image not found: (valid id is mandatory)";
		exit();
	}

	$ar_parts	= explode('/', $id);
	$section_id	= $ar_parts[0];
	$quality	= isset($ar_parts[1]) ? $ar_parts[1] : 'standar';

	switch (true) {
		case strpos($section_id, '-rsc209')!==false:
			// pdf rsc209 cases. /standar/rsc209_rsc205_670.pdf
			$section_id	= explode('-', $section_id)[0];
			$base_path	= dirname(__FILE__) . '/' . $quality;
			$file_name	= 'rsc209_rsc205_'.  $section_id . '.pdf';
			break;

		default:
			// default cases
			$max_items_folder	= 1000;
			$aditional_path		= '/'.$max_items_folder * (floor($section_id / $max_items_folder));

			$base_path	= dirname(__FILE__) . '/' . $quality . $aditional_path;
			$file_name	= 'rsc37_rsc176_'.  $section_id . '.pdf'; // rsc37_rsc1760_1
			break;
	}

	$file = $base_path .'/'. $file_name;

	// Set zone time
		date_default_timezone_set('Europe/Madrid');

	// Headers
		header("Access-Control-Allow-Origin: *");
		$allow_headers = [
			// 'Access-Control-Allow-Headers',
			// 'Origin,Accept',
			// 'X-Requested-With',
			'Content-Type',
			// 'Access-Control-Request-Method',
			// 'Access-Control-Request-Headers'
		];
		header("Access-Control-Allow-Headers: ". implode(', ', $allow_headers));
		header("Cache-Control: private, max-age=10800, pre-check=10800");
		header("Pragma: private");
		header("Expires: " . date(DATE_RFC822,strtotime(" 120 day")));
		header('Content-Type: application/pdf');


	// Check file exists
		if (!file_exists($file)) {

			// File not found in dir
			header("HTTP/1.0 404 Not Found");
			// Direct read default file
			// $file = dirname(dirname(__FILE__)) . '/assets/images/default.jpg';
			// header('Content-Length: ' . filesize($file));
			// readfile($file);
			exit();
		}



	// Direct read file
		header('Content-Length: ' . filesize($file));
		header('Connection: close');
		readfile($file);
