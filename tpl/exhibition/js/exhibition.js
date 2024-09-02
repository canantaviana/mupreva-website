"use strict";



var exhibition = {


    /**
    * VARS
    */
    container: null,
    section_id: null,



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const container_exhibition_info = options.container_exhibition_info
        const container_exhibition_toc = options.container_exhibition_toc
        const section_id = options.section_id

        // fix vars
        self.section_id = parseInt(options.section_id)

        // check valid section_id
        if (section_id < 1) {
            console.error("Invalid mandatory section_id:", section_id);
            return false
        }

        // exhibition main info panel
        self.get_exhibition_data({
            section_id: section_id
        })
            .then(function (response) {

                const exhibitions_data = page.parse_exhibitions_data(response.result)
                const row = exhibitions_data[0]

                // render_panel
                const panel_node = render_panels.render_expo_presentation({
                    caller: self,
                    row: row,
                    key: 0,
                    text_body: true,
                    animate: false,
                    panel_css_selector: 'exhibition_top' + (row.color ? '' : ' sub_container')
                })
                // sub_container
                const sub_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "sub_container " + row.color
                })
                sub_container.appendChild(panel_node)
                container_exhibition_info.appendChild(sub_container)


                // event publish template_render_end
                event_manager.publish('template_render_end', {
                    breadcrumb: [{
                        label: row.title,
                        path: window.location.href
                    }]
                })
            })

        // exhibition TOC list
        self.get_exhibition_toc_data({
            section_id: section_id
        })
            .then(function (response) {
                // console.log("--> get_exhibition_data response:",response);
                const exhibitions_data = page.parse_exhibitions_data(response.result)
                const exhibitions_data_length = exhibitions_data.length

                const fragment = new DocumentFragment()
                for (let i = 0; i < exhibitions_data_length; i++) {

                    const row = exhibitions_data[i]
                    const add_link = (!row.children || row.children.length < 1) ? false : true

                    const panel_node = render_panels.render_expo_contents({
                        caller: self,
                        row: row,
                        key: i,
                        panel_number: i,
                        animate: true,
                        add_link: add_link,
                        add_views: true,
                        panel_css_selector: 'toc_panel'
                    })
                    fragment.appendChild(panel_node)
                }
                container_exhibition_toc.appendChild(fragment)
            })

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
    * GET_EXHIBITION_DATA
    * @return promise
    */
    get_exhibition_data: function (options) {

        const self = this

        // options
        const section_id = options.section_id || null

        // sql_filter
        const sql_filter = "section_id=" + section_id

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
                order: null
            }
        })
    },//end get_exhibition_data



    /**
    * GET_EXHIBITION_TOC_DATA
    * @return promise
    */
    get_exhibition_toc_data: function (options) {

        const self = this

        // options
        const section_id = options.section_id || null

        // others
        const sql_filter = "typology_id='[\"2\"]' AND father LIKE '%\"section_id\":\"" + section_id + "\"%' " // contenidos

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
                    immovable: 'immovable'
                },
                order: 'norder ASC'
            }
        })
    },//end get_exhibition_toc_data



    /**
    * SWITCH_VIEW
    * @return promise
    */
    switch_view: function (view_mode, container, list_mode_group, element, row) {

        const self = this

        return new Promise(function (resolve) {

            // view_mode
            self.view_mode = view_mode

            // reset active and set current
            const active = list_mode_group.querySelector('.active')
            if (active) {
                active.classList.remove('active')
            }
            element.classList.add('active')

            // container
            // css target reset
            container.className = ''; // reset container class
            container.style = ''; // reset container style
            container.classList.add('views_container', self.view_mode)

            container.style.opacity = 0.4

            function finish(result) {

                // append node optional
                if (common.is_node(result)) {

                    // clean container
                    while (container.hasChildNodes()) {
                        container.removeChild(container.lastChild);
                    }

                    container.appendChild(result)
                }

                // publish rendered event (see init events)
                event_manager.publish('rendered', {
                    rows_list_container: container,
                    view_mode: view_mode
                })

                // restore container opacity
                container.style.opacity = 1

                resolve(result)
            }


            // load data and render
            switch (view_mode) {

                case 'list':
                case 'list_images':
                    const list_data = row.list_data
                    self.list = self.list || new list_factory() // creates / get existing instance of list
                    self.list.init({
                        target: container,
                        data: list_data,
                        fn_row_builder: self.list_row_builder,
                        pagination: false, // false to disable, null to defaults
                        caller: self
                    })
                    self.list.render_list()
                        .then(function (list_node) {
                            finish(list_node)
                        })
                    break;
                case 'map':
                    // clean container
                    while (container.hasChildNodes()) {
                        container.removeChild(container.lastChild);
                    }
                    // reset container attached map if exists
                    // const leaflet_map_container = L.DomUtil.get(container.id);
                    // if(leaflet_map_container!==null){
                    // 	leaflet_map_container._leaflet_id = null;
                    // }
                    container._leaflet_id = null;

                    const map_data = row.map_data
                    const map = new map_factory() // creates instance of map_factory
                    map.init({
                        source_maps: page.maps_config.source_maps,
                        map_position: null,
                        map_container: container,
                        popup_builder: page.map_popup_builder,
                        popup_options: page.maps_config.popup_options
                    })
                        .then(function (leaflet_map) {
                            // parse data points
                            map.parse_data_to_map(map_data)
                                .then(function (map_node) {
                                    finish(true)
                                })
                        })
                    break;
                case 'timeline':
                    // clean container
                    while (container.hasChildNodes()) {
                        container.removeChild(container.lastChild);
                    }
                    const timeline_data = row.timeline_data
                    const timeline = new timeline_factory() // creates / get existing instance of timeline
                    timeline.init({
                        target: container,
                        block_builder: catalog.timelime_block_builder,
                    })
                        .then(function () {
                            timeline.render_timeline({
                                data: timeline_data,
                                pagination: self.pagination
                            })
                                .then(function (timeline_node) {
                                    // resolve(timeline_node)
                                    finish(true)
                                })
                        })
                    break;
            }

        })
    },//end switch_view



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



}//end exhibition
