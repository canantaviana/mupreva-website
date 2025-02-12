<?php

/**
 * CATALOG
 *
 */
class catalog
{



    /**
     * SEARCH_CATALOG
     * @return array $ar_result
     */
    public static function search_catalog($request_options)
    {

        $options = new stdClass();
        $options->ar_query     = [];
        $options->limit     = 10;
        // pagination
        $options->offset     = 0;
        $options->count     = true;
        $options->operator     = 'or';
        $options->total     = false;
        $options->order     = 'section_id ASC';
        foreach ($request_options as $key => $value) {
            if (property_exists($options, $key)) $options->$key = $value;
        }

        # Filter
        $filter = null;

        if ($options->ar_query) {

            // operator
            $operator = ($options->operator === 'AND')
                ? 'AND'
                : 'OR';

            $ar_filter = [];
            foreach ($options->ar_query as $key => $value_obj) {

                switch ($value_obj->name) {

                    case 'section_id':
                        $ar_filter[] = '`' . $value_obj->name . '` = ' . (int)$value_obj->value;
                        break;

                    default:
                        // escape
                        $value          = self::escape_value($value_obj->value);
                        $ar_filter[] = '`' . $value_obj->name . "` LIKE '%" . $value . "%'";
                        break;
                }
            }
            $filter = implode(' ' . $operator . ' ', $ar_filter);
        }
        if (SHOW_DEBUG === true) {
            debug_log(__METHOD__ . " filter " . to_string($filter), 'DEBUG');
        }

        $ar_fields = ['*'];

        # Search
        $rows_options = new stdClass();
        $rows_options->dedalo_get                = 'records';
        $rows_options->table                    = 'coins';
        $rows_options->ar_fields                = $ar_fields;
        $rows_options->lang                        = WEB_CURRENT_LANG_CODE;
        $rows_options->limit                    = 1000; //(int)$options->limit;
        $rows_options->offset                    = $options->offset;
        $rows_options->count                    = empty($options->total) ? true : false; // $options->count;
        $rows_options->order                    = $options->order;
        $rows_options->sql_filter                = $filter;
        $rows_options->resolve_portals_custom    = isset($portals_custom) ? $portals_custom : false;

        # HTTP request in php to the API
        $web_data = json_web_data::get_data($rows_options);

        $ar_result = $web_data;


        return $ar_result;
    } //end search_catalog



    /**
     * ESCAPE_VALUE
     * @return
     */
    public static function escape_value($value)
    {

        $value = trim($value);
        $value = str_replace("'", "''", $value);


        return $value;
    } //end escape_value



    /**
     * GET_ROW_DATA
     * @return
     */
    public static function get_row_data($section_id)
    {

        $ar_calls = [];

        // catalog table search
        $ar_fields = ['*'];

        $portals_custom = [
            // 'bibliography_data' => 'bibliographic_references', // publications
            // 'bibliography_data.items_data' => 'publications'
        ];

        $filter = 'section_id=' . (int)$section_id;

        # Search
        $rows_options = new stdClass();
        $rows_options->dedalo_get                = 'records';
        $rows_options->table                    = 'catalog';
        $rows_options->ar_fields                = $ar_fields;
        $rows_options->lang                        = WEB_CURRENT_LANG_CODE;
        $rows_options->limit                    = 1;
        $rows_options->offset                    = 0;
        $rows_options->count                    = false;
        $rows_options->sql_filter                = $filter;
        $rows_options->resolve_portals_custom    = $portals_custom;

        $call = new stdClass();
        $call->id         = 'mint';
        $call->options     = $rows_options;
        $ar_calls[] = $call;

        // call to api
        $options = new stdClass();
        $options->dedalo_get     = 'combi';
        $options->ar_calls         = $ar_calls;
        # HTTP request in php to the API
        $response = json_web_data::get_data($options);


        return $response;
    } //end get_row_data



}//end class catalog
