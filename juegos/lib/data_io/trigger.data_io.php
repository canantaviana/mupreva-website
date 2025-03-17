<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

/*
    Recibe un dato en formato par como

    'pregunta': pregunta,
    'respuesta_numero': respuesta_numero

    y lo alacena en la base de datos para llevar u registro estadístico de preguntas / respuestas seleccionadas por los usuarios

    array(2) {
      ["pregunta"]=> "2"
      ["respuesta_numero"]=> "4"
    }
*/



# set vars
$vars = array('mode','current_data', 'pregunta', 'game_id'); foreach($vars as $name) $$name = setVar($name);

define('QSM_ROOT', dirname( dirname( dirname(__FILE__) ) ));
$filename = QSM_ROOT.'/write/qsm_stats_' . $game_id . '.data';
if (!file_exists($filename)) {
    file_put_contents($filename, array());
}

/**
* GUARDAR_RESPUESTA
*/
if ($mode=='guardar_respuesta') {

    if (empty($current_data)) {
        trigger_error("Error. empty current_data para 'guardar_respuesta' ");
        exit("Error. empty current_data");
    }

    $pregunta 			= $current_data['pregunta'];
    $respuesta_numero 	= $current_data['respuesta_numero'];
    $ar_stored_data 	= array();

    #
    # 1 . Recuperamos los datos almacenados
    $file_data 			= file_get_contents($filename);
    $ar_stored_data 	= (array)json_decode($file_data, true);	# json as array

    #
    # 2 . Añadimos el dato actual a l array de datos
    if (!isset($ar_stored_data[$pregunta])) {
        $ar_stored_data[$pregunta] = array(); # Pregunta nueva
    }
    array_push($ar_stored_data[$pregunta], intval($respuesta_numero) );

    #
    # 3 . Guardamos el resultado formateado en JSON
    $ar_stored_data_json = json_encode($ar_stored_data);
    file_put_contents($filename, $ar_stored_data_json);


    # Devolvemos el resultado sólo como debug para opcionalmente mostrar en consola de js
    print_r($ar_stored_data);
    exit("ok");

}#end guardar_respuesta




/**
* OBTENER_RESPUESTA
*/
if ($mode=='obtener_respuesta') {

    if (empty($pregunta)) {
        trigger_error("Error. empty pregunta para 'obtener_respuesta' ");
        exit("Error. empty pregunta");
    }

    #
    # 1 . Recuperamos los datos almacenados
    $file_data 		= file_get_contents($filename);
    $ar_stored_data = (array)json_decode($file_data, true);	# json as array

    # Para los casos en que no hay resultados almacenados todavía, devolveremos un array con el valor 0 tipo [0]
    if (!isset($ar_stored_data[$pregunta])) {
        $ar_stored_data[$pregunta] = array(0);
    }

    # Test values
    #$ar_stored_data[$pregunta] = array(1,2,3,4,4);

    # JSON encode
    $ar_stored_data_json = json_encode($ar_stored_data[$pregunta]);

    # Es un string en formato json. Lo devolvemos directamente como string y lo parsearemos en js
    exit($ar_stored_data_json);

}#end obtener_respuesta











# SET REQUEST VAR
function setVar($name,$default=false) {
    $$name = $default;
    if(isset($_REQUEST["$name"])) {
        $$name = $_REQUEST["$name"];
    }else if(isset($GLOBALS["$name"])) {
        $$name = $GLOBALS["$name"];
    }
    if($$name)
    return $$name ;
}
function dump($val) {
    print_r($val,true);
}

?>
