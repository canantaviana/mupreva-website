"use strict";



var exhibition_detail = {



    /**
    * VARS
    */
    container: null,
    color_key: 0,



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const container = options.container
        const section_id = options.section_id

        // fix
        self.container = container

        // load data
        data_manager.request({
            body: {
                dedalo_get: 'records',
                table: 'exhibitions',
                ar_fields: ['*'],
                sql_filter: 'section_id=' + section_id,
                limit: 1,
                count: false,
                resolve_portals_custom: {
                    images: 'pictures',
                    objects: 'objects',
                    immovable: 'immovable',
                    audiovisuals: 'audiovisual',
                    documents_pdf: 'documents',
                    other_images: 'image'
                }
            }
        })
            .then(function (response) {

                const rows = page.parse_exhibitions_data(response.result)

                const row = typeof rows[0] !== "undefined"
                    ? rows[0]
                    : null

                // empty case
                if (!row) {

                    common.create_dom_element({
                        element_type: "div",
                        class_name: "error_not_found",
                        inner_html: tstring.row_error || "Sorry, this record doesn't exist [" + section_id + "]",
                        parent: container
                    })

                    console.error("Error on get record:", rows);
                    return false
                }

                // render
                const panel_node = render_panels.render_detail({
                    caller: self,
                    row: row, // note that row is already parsed
                    container: null,
                    key: null,
                    color: null,
                    animate: true,
                    add_link: false,
                    panel_css_selector: 'exhibition_detail'
                })
                container.appendChild(panel_node)

                // event publish template_render_end
                event_manager.publish('template_render_end', {
                    breadcrumb: [{
                        label: row.title,
                        path: window.location.href
                    }]
                })
            })



        return true
    },//end set_up



}//end exhibition_detail
