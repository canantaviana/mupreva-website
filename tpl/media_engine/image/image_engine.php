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
	$quality	= isset($ar_parts[1]) ? $ar_parts[1] : '1.5MB';

	$quality_path = ($quality==='home_big')
		? 'original'
		: $quality;

	switch (true) {
		case strpos($section_id, '-rsc228')!==false:
			// image rsc228 cases. 1.5MB/rsc228_rsc205_670.jpg
			$section_id	= explode('-', $section_id)[0];
			$base_path	= dirname(__FILE__) . '/' . $quality_path;
			$file_name	= 'rsc228_rsc205_'.  $section_id . '.jpg';
			break;

		default:
			// image rsc170 cases
			$max_items_folder	= 1000;
			$aditional_path		= '/'.$max_items_folder * (floor($section_id / $max_items_folder));

			$base_path	= dirname(__FILE__) . '/' . $quality_path . $aditional_path;
			$file_name	= 'rsc29_rsc170_'.  $section_id . '.jpg';
			break;
	}

	$file = $base_path .'/'. $file_name;

	// check if it is a published image
		if ($quality!=='thumb') {

			include dirname(dirname(__FILE__)) . '/is_publishable.php';

			$valid = is_publishable('image', $section_id);

			if ($valid!==true) {
				header("HTTP/1.0 403 Forbidden");
				echo "Image not allowed";
				exit();
			}
		}


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
			$file = dirname(dirname(dirname(__FILE__))) . '/assets/images/default.jpg';
			header('Content-Length: ' . filesize($file));
			readfile($file);
			exit();
		}


	if ($quality==='thumb') {

		// Direct read file
			header('Content-Length: ' . filesize($file));
			readfile($file);

	}else if ($quality==='home_big') { // quality home big

		$f_otuput = dirname(__FILE__) .'/temporal/file_home_big_'.$section_id.'.jpg';
		if (!file_exists($f_otuput)) {

			// resize and watermark
				$f_watermark		= dirname(__FILE__) .'/watermarks/home_big/watermark.png';
				$f_input			= $file;
				$command_watermark	= "convert $f_input -resize 1480x1480 $f_otuput && composite -gravity SouthEast $f_watermark $f_otuput $f_otuput";
				$output_watermark	= shell_exec($command_watermark);
		}

		header('Content-Length: ' . filesize($f_otuput));
		readfile($f_otuput);

	}else if ($quality==='original'){

		// image dimensions
			list($i_width, $i_height) = getimagesize($file);

			$i_square = $i_width * $i_height;

			// modern pictures of objects are around 45 millions of pixels
			// old archive pictures are around 5 millions of pixels

		// select watermark
			switch (true) {
				case ($i_square<30000000):
					// old images
					$f_watermark = dirname(__FILE__) .'/watermarks/'. $quality_path . '/watermark_original_small.png';
					break;

				default:
					// objects modern photos
					$f_watermark = dirname(__FILE__) .'/watermarks/'. $quality_path . '/watermark.png';
					break;
			}

		// watermark add
			$f_input			= $file;
			$f_otuput			= dirname(__FILE__) .'/temporal/file.jpg';
			$command_watermark	= "composite -gravity SouthEast $f_watermark $f_input -"; // $f_otuput; 2>&1
			$output_watermark	= shell_exec($command_watermark);

		// out
			echo $output_watermark;

	}else{

		// watermark
			$f_watermark		= dirname(__FILE__) .'/watermarks/'. $quality_path . '/watermark.png';
			$f_input			= $file;
			$f_otuput			= dirname(__FILE__) .'/temporal/file.jpg';
			$command_watermark	= "composite -gravity SouthEast $f_watermark $f_input -"; // $f_otuput; 2>&1
			$output_watermark	= shell_exec($command_watermark);

		// out
			echo $output_watermark;
	}
