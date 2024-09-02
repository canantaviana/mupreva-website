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
	$quality	= isset($ar_parts[1]) ? $ar_parts[1] : 'default';

	$base_path	= dirname(__FILE__) . '/posterframe';
	$file_name	= 'rsc35_rsc167_'.  $section_id . '.jpg';
	$file		= $base_path .'/'. $file_name;

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
		header('Content-Type: image/jpeg');


	// Check file exists
		if (!file_exists($file)) {
			// File not found in dir
			header("HTTP/1.0 404 Not Found");
			// Direct read default file
			$file = dirname(dirname(__FILE__)) . '/assets/images/default.jpg';
			header('Content-Length: ' . filesize($file));
			readfile($file);
			exit();
		}

	// $add_watermark = $quality==='default' ? true : false;
	$add_watermark = false;

	if ($add_watermark!==true) {

		// Direct read file
			header('Content-Length: ' . filesize($file));
			readfile($file);
	}else{

		// watermark
			$f_watermark		= dirname(__FILE__) .'/watermarks/default/watermark.png';
			$f_input			= $file;
			$f_otuput			= dirname(__FILE__) .'/temporal/file.jpg';
			$command_watermark	= "composite -gravity SouthEast $f_watermark $f_input -"; // $f_otuput; 2>&1
			$output_watermark	= shell_exec($command_watermark);

		// out
			echo $output_watermark;
	}
