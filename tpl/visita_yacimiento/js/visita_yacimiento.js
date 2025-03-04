"use strict";



var generic = {

    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const row = options.row
        const children_container = options.children_container

        // fix values
        self.row = row


        // get children info
        api.getVisitasYacimiento()
            .then(function (rows) {
                rows.forEach(function(row){
                    const content = htmlTemplate(`<div id="route${row.section_id}" class="flow--l"></div>`);
                    appendTemplate(children_container, content);

                    api.getVisitaYacimiento(row.section_id)
                        .then(function (info) {
                        var visita = templateModules.visitaYacimiento(info);
                        appendTemplate(document.getElementById("route"+row.section_id), visita)
                        enableDialogs(document.getElementById("route"+row.section_id));
                        new TenUp.tabs('#route'+row.section_id+' .tabs-2', {
                        });
                    });

                });
            viewInit();
        })

        // event publish template_render_end
        event_manager.publish('template_render_end', {})


        return true
    },//end set_up

}//end generic
