/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



var panels = {


    /**
    * VARS
    */
    container: null,
    exhibition_section_id: null,
    toc_panel_section_id: null,

    allow_elements: {
        main_exhibition: true,
        toc_panel: true,
        all_panels: true,
        panel_standard: true,
        panel_gallery: true,
        panel_timeline: true,
        panel_map: true
    },



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const container_exhibition_info = options.container_exhibition_info
        const container_exhibition_toc_item = options.container_exhibition_toc_item
        const container_exhibition_toc_item_panels = options.container_exhibition_toc_item_panels
        const exhibition_section_id = options.exhibition_section_id
        const toc_panel_section_id = options.toc_panel_section_id
        const toc_panel_key = options.toc_panel_key

        // check valid section_id
        if (exhibition_section_id < 1) {
            console.error("Invalid mandatory exhibition_section_id/toc_panel_section_id:", exhibition_section_id, toc_panel_section_id);
            return false
        }

        // fix values
        self.exhibition_section_id = exhibition_section_id
        self.toc_panel_section_id = toc_panel_section_id

        const ar_promises = []

        // exhibition main info panel
        if (self.allow_elements.main_exhibition) {

            const exhibition_data_promise = new Promise(function (resolve) {

                exhibition.get_exhibition_data({
                    section_id: exhibition_section_id
                })
                    .then(function (response) {

                        const exhibitions_data = page.parse_exhibitions_data(response.result)
                        const row = exhibitions_data[0]
                        const exhibition_row = row
                        const color = row.color

                        // fix color
                        const main_info = document.getElementById('main_info')
                        main_info.classList.add(color)

                        // render_panel
                        const node = render_panels.render_grouper({
                            caller: self,
                            row: row,
                            key: 0,
                            text_body: false,
                            animate: false,
                            add_image: false
                        })
                        container_exhibition_info.appendChild(node)

                        resolve(exhibition_row)
                    })
            })
            ar_promises.push(exhibition_data_promise)
        }

        // toc panel info
        if (self.allow_elements.toc_panel) {

            const toc_panel_data_promise = new Promise(function (resolve) {

                self.get_toc_panel_data({
                    section_id: self.toc_panel_section_id
                })
                    .then(function (response) {

                        const exhibitions_data = page.parse_exhibitions_data(response.result)

                        // render_expo_contents
                        const panel_node = render_panels.render_expo_contents({
                            caller: self,
                            row: exhibitions_data[0],
                            key: 0,
                            panel_number: toc_panel_key,
                            add_link: false,
                            animate: false,
                            panel_css_selector: 'toc_panel'
                        })
                        container_exhibition_toc_item.appendChild(panel_node)


                        // trigger create_all_panels
                        self.toc_panel_section_id = response.result[0].section_id
                        if (self.allow_elements.all_panels) {
                            if (self.toc_panel_section_id > 0 && typeof create_all_panels === 'function')
                                create_all_panels()
                        }

                        resolve(exhibitions_data)
                    })
            })
            ar_promises.push(toc_panel_data_promise)
        }

        // breadcrumb trigger
        Promise.all(ar_promises).then((values) => {
            try {

                const exhibition_row = values[0]
                const exhibitions_data = values[1]

                // event publish template_render_end
                event_manager.publish('template_render_end', {
                    breadcrumb: [
                        {
                            label: exhibition_row.title,
                            path: (() => {
                                const beats = window.location.href.split('/panels/')
                                const ar_id = beats[1].split('-')
                                return BASE_LINKS + 'exhibition/' + ar_id[0]
                            })()
                        },
                        {
                            label: exhibitions_data[0].title,
                            path: window.location.href
                        }]
                })
            } catch (error) {
                console.error("Error on get ar_promises values (breadcrumb):", error);
            }
        });

        // all panels list (standard, standard left, map, gallery, list, timeline)
        function create_all_panels() {
            self.get_all_panels_data({
                section_id: self.toc_panel_section_id
            })
                .then(function (response) {

                    const panels_data = page.parse_exhibitions_data(response.result)

                    self.render_all_panels({
                        data: panels_data,
                        container: container_exhibition_toc_item_panels
                    })
                })
        }


        // subscribe events
        // event map_selected_marker
        event_manager.subscribe('map_selected_marker', selected_marker)
        function selected_marker(data) {
            console.log(" selected_marker data:", data.item.data);
        }
        // event map_popup_selected_item
        event_manager.subscribe('map_popup_selected_item', map_popup_selected_item)
        function map_popup_selected_item(data) {
            const url = page_globals.__WEB_ROOT_WEB__ + '/' + data.tpl + '/' + data.section_id
            window.open(url)
        }


        return true
    },//end set_up



    /**
    * GET_toc_PANEL_DATA
    * @return promise
    */
    get_toc_panel_data: function (options) {

        const self = this

        // options
        const section_id = options.section_id || null

        // others
        const sql_filter = section_id > 0
            ? "section_id=" + section_id
            : "father LIKE '%\"section_id\":\"" + self.exhibition_section_id + "\"%'"

        return data_manager.request({
            body: {
                dedalo_get: 'records',
                db_name: page_globals.WEB_DB,
                lang: page_globals.WEB_CURRENT_LANG_CODE,
                table: 'exhibitions',
                ar_fields: ['*'],
                sql_filter: sql_filter,
                limit: 1,
                count: false,
                offset: 0,
                order: 'norder ASC',
                resolve_portals_custom: {
                    images: 'pictures',
                    objects: 'objects',
                    immovable: 'immovable'
                }
            }
        })
    },//end get_toc_panel_data



    /**
    * GET_ALL_PANELS_DATA
    * @return promise
    */
    get_all_panels_data: function (options) {

        const self = this

        // options
        const section_id = options.section_id || null

        // filter
        const sql_filter = "father LIKE '%\"section_id\":\"" + section_id + "\"%' "

        return data_manager.request({
            body: {
                dedalo_get: 'records',
                db_name: page_globals.WEB_DB,
                lang: page_globals.WEB_CURRENT_LANG_CODE,
                table: 'exhibitions',
                ar_fields: ['*'],
                sql_filter: sql_filter,
                limit: 0,
                count: false,
                offset: 0,
                resolve_portals_custom: {
                    images: 'pictures',
                    objects: 'objects',
                    immovable: 'immovable',
                    other_images: 'image',
                    audiovisuals: 'audiovisual',
                    documents_pdf: 'documents'
                },
                order: 'norder ASC'
            }
        })
    },//end get_all_panels_data



    /**
    * RENDER_all_panels
    * Clean container and iterate all rows, creating a panel for each one
    * @param object options
    * @return promise
    */
    render_all_panels: function (options) {

        const self = this

        // options
        const exhibitions_data = options.data
        const container = options.container

        return new Promise(function (resolve) {

            // clean container
            while (container.hasChildNodes()) {
                container.removeChild(container.lastChild);
            }

            // iterate rows
            for (let i = 0; i < exhibitions_data.length; i++) {

                const row = exhibitions_data[i]

                const typology_id = parseInt(row.typology_id)
                switch (typology_id) {

                    case 3: // standard
                    case 4: // standard left
                        if (self.allow_elements.panel_standard) {
                            const panel_node = render_panels.panel_standard({
                                caller: self,
                                row: row,
                                key: i,
                                orientation: (typology_id === 4) ? 'left' : 'right'
                            })
                            container.appendChild(panel_node)
                        }
                        break;

                    case 5: // map
                        if (self.allow_elements.panel_map) {
                            const panel_node = render_panels.panel_map({
                                caller: self,
                                row: row,
                                key: i,
                                container: container
                            })
                            container.appendChild(panel_node)
                        }
                        break;

                    case 6: // gallery (masonry)
                    case 7: // gallery with info (list)
                        if (self.allow_elements.panel_gallery) {
                            const panel_node = render_panels.panel_gallery({
                                caller: self,
                                row: row,
                                key: i,
                                container: container,
                                type: (typology_id === 6) ? 'list_images' : 'list'
                            })
                            container.appendChild(panel_node)
                        }
                        break;

                    case 8: // timeline
                        if (self.allow_elements.panel_timeline) {
                            const panel_node = render_panels.panel_timeline({
                                caller: self,
                                row: row,
                                key: i,
                                container: container
                            })
                            container.appendChild(panel_node)
                        }
                        break;

                    default:
                        console.warn("Ignored invalid typology:", row.typology_id)
                }
            }

            resolve(container)
        })
    },//end render_all_panels



    /**
    * LIST_ROW_BUILDER
    * Build DOM nodes to insert into list
    */
    list_row_builder: function (row, view_mode) {

        const mode = view_mode // list | list_images (masonry)

        const row_node = common.create_dom_element({
            element_type: "div",
            class_name: "row_node grid-item " + row.table,
        })

        const item_fragment = item_list_row.render_item(row, mode, row_node)

        row_node.appendChild(item_fragment)

        return row_node
    },//end list_row_builder



}//end panels
