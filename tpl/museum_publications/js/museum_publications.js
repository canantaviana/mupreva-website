"use strict";



var museum_publications = {



    /**
    * VARS
    */
    container: null,
    grouper: null,
    color_key: 0,
    cache_data: {},



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const container = options.container

        // fix
        self.container = container

        // search
        self.get_museum_publications_data({
            sql_filter: "`belonging` = '[\"rsc229_1\"]' ",
            order: "publication_date DESC"
        })
            .then(function (data) {

                const panels_node = self.render_panels({
                    data: data,
                    key: 0,
                    limit: 30
                })
                self.container.appendChild(panels_node)

                // event publish template_render_end
                event_manager.publish('template_render_end', {})
            })

        return true
    },//end set_up



    /**
    * GET_MUSEUM_PUBLICATIONS_DATA
    * @return promise
    */
    get_museum_publications_data: function (options) {

        const self = this

        // options
        const limit = options.limit || 0
        const offset = options.offset || 0
        const order = options.order || "publication_date DESC"
        const count = options.count || false
        const sql_filter = options.sql_filter || null
        const resolve_portals_custom = options.resolve_portals_custom || null
        const ar_fields = options.ar_fields || [
            'section_id',
            'title',
            'authors',
            'author_main',
            'publication_date',
            'typology',
            'typology_name',
            'editor',
            'image',
            'pdf',
            'abstract'
        ]


        // cache. (!) Note that request has no limit, but the DOM nodes are effectively limited
        const cache_key = page.build_has_code(sql_filter + limit) + ""
        if (self.cache_data && self.cache_data[cache_key]) {
            return Promise.resolve(self.cache_data[cache_key]);
        }

        return new Promise(function (resolve) {

            data_manager.request({
                body: {
                    dedalo_get: 'records',
                    db_name: page_globals.WEB_DB,
                    lang: page_globals.WEB_CURRENT_LANG_CODE,
                    table: 'publications',
                    ar_fields: ar_fields,
                    sql_filter: sql_filter,
                    limit: limit,
                    count: count,
                    offset: offset,
                    order: order,
                    resolve_portals_custom: resolve_portals_custom
                }
            })
                .then(function (response) {

                    const rows = response.result

                    const data = page.parse_museum_publications_data(rows)

                    // cache
                    self.cache_data[cache_key] = data

                    resolve(data)
                })
        })
    },//end get_museum_publications_data



    /**
    * RENDER_PANELS
    * @param object options
    * @return promise
    */
    render_panels: function (options) {

        const self = this

        // options
        const data = options.data
        const limit = (typeof options.limit !== "undefined") ? options.limit : 10
        const key = options.key || 0


        const fragment = new DocumentFragment()

        // panels block
        const panels_block = common.create_dom_element({
            element_type: "div",
            class_name: "grouper_container panels_block",
            parent: fragment
        })

        // iterate rows
        let vieved = 0
        const data_length = data.length
        function iterate(from, to) {

            const fragment_inside = new DocumentFragment()

            for (let i = from; i < to; i++) {

                const row = data[i]
                const typology_id = parseInt(row.typology_id)

                switch (typology_id) {

                    default: // regular panel

                        // render panel
                        const panel_node = render_panels.render_toc_panel({
                            caller: self,
                            row: row,
                            container: null,
                            key: 1,//i,
                            color: null,
                            animate: true,
                            carousel: false,
                            add_button_detail: false,
                            add_link: false,
                            add_views: false,
                            add_body: true,
                            tpl: 'museum_publications',
                            panel_css_selector: 'toc_panel'
                        })
                        fragment_inside.appendChild(panel_node)
                        break;
                }
            }//end for (let i = from; i < to; i++)

            // load more button
            if (to < (data_length - 0)) {

                vieved = vieved + (to - from)

                const block_item = common.create_dom_element({
                    element_type: "div",
                    class_name: "block_item container",
                    parent: fragment_inside
                })

                const more_node = common.create_dom_element({
                    element_type: "div",
                    class_name: "more_node btn timeline_show_more",
                    parent: block_item
                })
                more_node.offset = to

                more_node.addEventListener("click", function () {
                    const _from = parseInt(this.offset)
                    const _to = ((_from + limit) < data_length) ? (_from + limit) : data_length
                    // const _to 	= data_length // view all in one click
                    iterate(_from, _to)

                    this.remove()
                })

                const label = (tstring.load_more || "Load more..") + " <small>[" + vieved + " " + tstring.of + " " + data_length + "]</small>"
                const more_label = common.create_dom_element({
                    element_type: "span",
                    inner_html: label,
                    parent: more_node
                })
            }

            panels_block.appendChild(fragment_inside)
        }//end iterate(from, to)

        // first, iterate elements from zero to limit
        const to = limit < data_length ? limit : data_length
        iterate(0, to)


        return fragment
    },//end render_panels



}//end museum_publications
