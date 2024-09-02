"use strict";



var research = {



    /**
    * VARS
    */



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const row = options.row
        const container = options.container
        const swager_container = options.swager_container
        const source_file_url = options.source_file_url

        // parse data
        const parsed_row = page.parse_ts_web(row)[0]

        // render
        self.render_row(parsed_row)
            .then(function (node) {

                container.appendChild(node)

                swager_container.classList.remove('hide')

                // event publish template_render_end
                event_manager.publish('template_render_end', {})
            })

        // swagger ui
        self.render_api_docu_ui({
            source_file_url: source_file_url
        })


        return true
    },//end set_up



    /**
    * RENDER_API_DOCU_UI
    * @return
    */
    render_api_docu_ui: function (options) {

        const source_file_url = options.source_file_url

        // Build a system
        const ui = SwaggerUIBundle({
            url: source_file_url, // test JSON file url (use absolute url here !)
            dom_id: '#swagger-ui',
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
        })

        window.ui = ui


        return ui
    },//end render_api_docu_ui



    /**
    * RENDER_ROW
    * @return DOM object (document fragment)
    */
    render_row: function (row) {

        const self = this

        return new Promise(function (resolve) {

            const fragment = new DocumentFragment()

            // title
            const title = common.create_dom_element({
                element_type: "h2",
                class_name: "title",
                inner_html: row.title,
                parent: fragment
            })

            // abstract
            if (row.abstract && row.abstract.length > 0) {
                const abstract = common.create_dom_element({
                    element_type: "p",
                    class_name: "abstract",
                    inner_html: row.abstract,
                    parent: fragment
                })
            }

            // identify_image
            if (row.identify_image && row.identify_image.length > 0) {

                const image_url = row.identify_image
                const identify_image = common.create_dom_element({
                    element_type: "img",
                    class_name: "identify_image",
                    src: image_url,
                    parent: fragment
                })
            }


            // dedalo link
            const dedalo_link = common.create_dom_element({
                element_type: "input",
                type: "button",
                class_name: "entrada_dedalo btn btn-light btn-block primary",
                value: tstring.entrada_al_sistema_catalogacion || 'Entrada al sistema de catalogación',
                parent: fragment
            })
            dedalo_link.addEventListener("click", function () {
                const new_window = window.open('/dedalo/', 'Dédalo', []);
                new_window.focus()
            })


            // body
            if (row.body && row.body.length > 0) {
                const body = common.create_dom_element({
                    element_type: "section",
                    class_name: "content",
                    inner_html: row.body,
                    parent: fragment
                })

                hljs.initHighlightingOnLoad();
            }


            resolve(fragment)
        })
    },//end render_row



}//end research
