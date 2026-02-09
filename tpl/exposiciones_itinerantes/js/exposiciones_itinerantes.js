/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page, forms, document, DocumentFragment, tstring, console, _form */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";

var actividades = {

    // rows_list_container
    rows_list_container: null,

    /**
     * SET_UP
     */
    set_up: function (options) {
        const self = this;

        // options
        const rows_list_container = options.rows_list_container;

        // fix vars

        self.rows_list_container = rows_list_container;


        var content =
            templateModules.bloque_exposiciones_actuales(3);
        appendTemplate(self.rows_list_container, content);
    
        templateModules.bloque_exposiciones_anuales(self.rows_list_container, 3);
        viewInit();
        return true;
    }, //end set_up


}; //end catalog
