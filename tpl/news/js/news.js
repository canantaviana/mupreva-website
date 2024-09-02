"use strict";



var news = {



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
        const filter_node = options.filter_node
        const grouper = options.grouper

        // fix
        self.container = container
        self.grouper = grouper

        // search
        // groupers (years)
        const sql_filter = (grouper && grouper.length > 1)
            ? "typology_id='[\"9\"]' AND title='" + grouper + "'"
            : "typology_id='[\"9\"]'"

        self.get_groupers_data({
            sql_filter: sql_filter
        })
            .then(function (groupers_rows) {

                // add grouper selector
                const group_selector = render_panels.render_group_selector(groupers_rows)
                filter_node.appendChild(group_selector)

                // render_content
                function render_content(groupers_rows, limit) {

                    const ar_promises = []

                    // iterate groupers
                    for (let i = 0; i < groupers_rows.length; i++) {

                        const row = groupers_rows[i]
                        const children = row.children

                        if (!children || children.length < 1) continue;

                        const ar_children_section_id = children.map(function (el) {
                            return el.section_id
                        })

                        const current_promise = new Promise(function (resolve) {

                            self.get_news_data({
                                sql_filter: 'section_id IN (' + ar_children_section_id.join(",") + ')',
                                order: "date_start DESC"
                            })
                                .then(function (news_data) {
                                    resolve({
                                        grouper: row,
                                        news_data: news_data
                                    })
                                })
                        })

                        ar_promises.push(current_promise)
                    }//end for (let i = 0; i < groupers_rows.length; i++)

                    // now render all panels
                    const fragment = new DocumentFragment()
                    Promise.all(ar_promises).then(function (values) {

                        const values_length = values.length
                        for (let i = 0; i < values.length; i++) {
                            const panels_node = self.render_panels({
                                data: values[i],
                                key: i,
                                limit: limit
                            })
                            fragment.appendChild(panels_node)
                        }

                        self.container.appendChild(fragment)
                    });

                    return fragment
                }//end render_content(groupers_rows, limit)

                // initial render unfiltered with n nodes view
                const n_nodes = 5
                const content = render_content(groupers_rows, n_nodes)
                self.container.appendChild(content)

                // events
                event_manager.subscribe('group_selector_changed', group_selector_changed)
                function group_selector_changed(options) {

                    const value = options.value

                    // filtered
                    const filtered_groupers = (value && value !== '*')
                        ? groupers_rows.filter(el => el.title === value)
                        : groupers_rows

                    const limit = filtered_groupers.length === 1
                        ? 50
                        : 5

                    const content = render_content(filtered_groupers, limit)
                    // clean
                    while (self.container.hasChildNodes()) {
                        self.container.removeChild(self.container.lastChild);
                    }
                    self.container.appendChild(content)
                }

                // event publish template_render_end
                event_manager.publish('template_render_end', {})
            });


        return true
    },//end set_up



    /**
    * GET_GROUPERS_DATA
    * Typology 9 (years normally)
    * @return promise
    */
    get_groupers_data: function (options) {

        const self = this

        // options
        const limit = options.limit || 1000
        const offset = options.offset || 0
        const sql_filter = options.sql_filter || "typology_id='[\"9\"]'"

        return new Promise(function (resolve) {

            const body = {
                dedalo_get: 'records',
                db_name: page_globals.WEB_DB,
                lang: page_globals.WEB_CURRENT_LANG_CODE,
                table: 'news',
                ar_fields: ['*'],
                sql_filter: sql_filter,
                limit: limit,
                count: false,
                offset: offset,
                order: "date_start DESC, norder DESC"
            }
            // console.log("get_groupers_data body:",body);

            data_manager.request({
                body: body
            })
                .then(function (reponse) {

                    const data = page.parse_news_data(reponse.result)

                    resolve(data)
                })
        })
    },//end get_groupers_data




    /**
    * GET_NEWS_DATA
    * @return promise
    */
    get_news_data: function (options) {

        const self = this

        // options
        const limit = options.limit || 0
        const offset = options.offset || 0
        const order = options.order || "norder ASC"
        const count = options.count || false
        const sql_filter = options.sql_filter || null
        const ar_fields = options.ar_fields || ['*']
        const resolve_portals_custom = options.resolve_portals_custom || null


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
                    table: 'news',
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

                    // test data
                    page.add_test_rows(rows, 10)

                    const data = page.parse_news_data(rows)

                    // cache
                    self.cache_data[cache_key] = data

                    resolve(data)
                })
        })
    },//end get_news_data



    /**
    * RENDER_PANELS
    * @param object options
    * @return promise
    */
    render_panels: function (options) {

        const self = this

        // options
        const grouper = options.data.grouper
        const news_data = options.data.news_data
        const limit = typeof options.limit !== "undefined" ? options.limit : 5

        const colors = page.colors

        const fragment = new DocumentFragment()

        // panels block
        const panels_block = common.create_dom_element({
            element_type: "div",
            class_name: "panels_block g-" + grouper.title,
            parent: fragment
        })

        // grouper
        const grouper_node = render_panels.render_news_grouper({
            caller: self,
            row: grouper,
            key: 0,
            color: page.colors[1],
            animate: true,
            panel_css_selector: 'grouper'
        })
        panels_block.appendChild(grouper_node)

        // iterate rows
        let vieved = 0
        const news_data_length = news_data.length
        function iterate(from, to) {

            const fragment_inside = new DocumentFragment()

            for (let i = from; i < to; i++) {

                const row = news_data[i]
                const typology_id = parseInt(row.typology_id)

                switch (typology_id) {

                    case 9: // grouper (year)

                        // // color alternate
                        // const color	= colors[self.color_key]
                        // self.color_key++
                        // if (self.color_key>=colors.length) {
                        // 	self.color_key = 0 // start again
                        // }

                        // // render panel
                        // const panel_node_grouper = render_panels.render_news_grouper({
                        // 	caller				: self,
                        // 	row					: row,
                        // 	key					: i,
                        // 	color				: color,
                        // 	text_summary		: false,
                        // 	add_link			: false,
                        // 	animate				: true,
                        // 	panel_css_selector	: 'grouper'
                        // })
                        // fragment.appendChild(panel_node_grouper)
                        break;

                    default: // regular row

                        // sub_container
                        const sub_container = common.create_dom_element({
                            element_type: "div",
                            class_name: row.color
                        })

                        const panel_node = render_panels.render_toc_panel({
                            caller: self,
                            row: row,
                            key: i,
                            color: null,
                            animate: true,
                            add_link: false,
                            add_views: true,
                            tpl: 'news_detail',
                            panel_css_selector: 'toc_panel'
                        })
                        sub_container.appendChild(panel_node)
                        fragment_inside.appendChild(sub_container)
                        break;
                }
            }//end for (let i = from; i < to; i++)

            // load more button
            if (to < (news_data_length - 1)) {

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
                    const _to = news_data_length // view all in one click
                    iterate(_from, _to)

                    this.remove()
                })

                const label = (tstring['load_more'] || "Load more..") + " <small>[" + vieved + " " + tstring.of + " " + news_data_length + "]</small>"
                const more_label = common.create_dom_element({
                    element_type: "span",
                    inner_html: label,
                    parent: more_node
                })
            }

            panels_block.appendChild(fragment_inside)
        }//end iterate(from, to)

        // first, iterate elements from zero to limit
        const to = (limit < news_data_length) ? limit : news_data_length
        iterate(0, to)


        return fragment
    },//end render_panels



}//end news
