<?php
// is_publishable
$db_config_file = dirname(dirname(dirname(dirname(__FILE__)))) . '/dedalo/lib/dedalo/config/config4_db.php';
include $db_config_file;


function is_publishable($table, $section_id) {

	$conn = new mysqli(	MYSQL_DEDALO_HOSTNAME_CONN,
						MYSQL_DEDALO_USERNAME_CONN,
						MYSQL_DEDALO_PASSWORD_CONN,
						MYSQL_DEDALO_DATABASE_CONN,
						MYSQL_DEDALO_DB_PORT_CONN,
						MYSQL_DEDALO_SOCKET_CONN);

	// Check connection
		if (mysqli_connect_errno()) {
			error_log( "Failed to connect to MySQL: " . mysqli_connect_error() );
			return false;
		}

	$query	= 'SELECT section_id FROM '.$table.' WHERE section_id = '.$section_id.' LIMIT 1;';
	$result	= mysqli_query($conn, $query);
	if (!$result) {
		error_log('Invalid result from query '.$query);
		return false;
	}

	$row_cnt = mysqli_num_rows($result);

	mysqli_close($conn);

	$response = ($row_cnt>0) ? true : false;

	return $response;
}
