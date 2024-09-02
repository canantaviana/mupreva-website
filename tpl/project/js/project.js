"use strict";



var project = {



    /**
    * VARS
    */
    video_player: null,

    ts_tables: [
        {
            label: tstring.ts_thematic || 'Thematic',
            value: 'ts_thematic'
        },
        {
            label: tstring.ts_chronological || 'Chronological',
            value: 'ts_chronological'
        },
        {
            label: tstring.ts_material || 'Material',
            value: 'ts_material'
        },
        {
            label: tstring.ts_technique || 'Technique',
            value: 'ts_technique'
        },
        {
            label: tstring.ts_onomastic || 'Onomastic',
            value: 'ts_onomastic'
        }
    ],

    selected_ts_table: 0,

    ts_data: [],



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const row = options.row
        const row_container = options.row_container
        const children_container = options.children_container

        // fix values
        self.row = row

        // row render
        if (row_container && row) {

            const parsed_row = page.parse_ts_web(row)[0]
            self.render_row(parsed_row)
                .then(function (node) {

                    row_container.appendChild(node)

                    // draw_graph
                    const container = row_container.querySelector('#sunburst_container')
                    draw_graph(container)
                })
        }

        // children render
        if (children_container && row.children && row.children.length > 0) {

            // get children info
            page.get_records({
                table: 'ts_web',
                sql_filter: 'parents LIKE \'%"' + row.term_id + '"%\' && template_name=\'item\'',
                parser: page.parse_ts_web
            })
                .then(function (rows) {

                    self.render_children_items(rows) // rows are already parsed
                        .then(function (node) {

                            if (node) {
                                children_container.appendChild(node)
                            }
                        })
                })
        }

        // event publish template_render_end
        event_manager.publish('template_render_end', {})


        return true
    },//end set_up



    /**
    * GET_TS_DATA
    * Load all thesaurus data and format it ready to use in d3 sunburst
    * Is called by draw_graph from d3 runtime (set in project.phtml)
    * @return promise
    */
    get_ts_data: function () {

        const self = this

        return new Promise(function (resolve) {

            const table_to_search = self.ts_tables[self.selected_ts_table].value

            // cache data
            const cache = self.ts_data.find(el => el.table === table_to_search)
            if (cache) {
                resolve(cache.data)
                return
            }

            const thesaurus_data = thesaurus.load_tree_data({
                force_load: true,
                filter: null,
                table: table_to_search // ts_chronological,ts_material,ts_technique,ts_thematic,ts_onomastic
            })
                .then(function (response) {

                    const data_ready = self.format_ts_data_for_d3(response)

                    // cache result
                    self.ts_data.push({
                        table: table_to_search,
                        data: data_ready
                    })

                    resolve(data_ready)
                })
        })
    },//end get_ts_data



    /**
    * FORMAT_TS_DATA_FOR_D3
    * @return object item_base
    */
    format_ts_data_for_d3: function (data) {

        const data_clean = page.parse_tree_data(data, null)

        const base_data = data_clean.map(el => {

            const parent = el.parent
                ? (() => {
                    const res = (typeof el.parent === 'string' || el.parent instanceof String) ? JSON.parse(el.parent) : el.parent
                    return (res && res[0]) ? res[0] : null
                })()
                : null

            const children = el.children
                ? (() => {
                    const res = (typeof el.children === 'string' || el.children instanceof String) ? JSON.parse(el.children) : el.children
                    if (res && res[0]) {
                        return res.map(function (item) {
                            const term_id = item.section_tipo + "_" + item.section_id
                            return term_id
                        })
                    }
                    return null
                })()
                : null

            const value = el.relations && el.relations.length > 0
                ? el.relations.length
                : 1

            return {
                term_id: el.term_id,
                term: el.term,
                children: children,
                parent: parent,
                value: value
            }
        })

        // sample
        // {
        //   "name": "flare",
        //   "children": [
        //     {
        //       "name": "analytics",
        //       "children": [
        //         {
        //           "name": "cluster",
        //           "children": [
        //             {
        //               "name": "AgglomerativeCluster",
        //               "value": 3938
        //             },
        //             {
        //               "name": "CommunityStructure",
        //               "value": 3812
        //             }
        //           ]
        //         },
        //         {
        //           "name": "optimization",
        //           "children": [
        //             {
        //               "name": "AspectRatioBanker",
        //               "value": 7074
        //             }
        //           ]
        //         }
        //       ]
        //     }
        //   ]
        // }

        function build_item(row, value) {

            if (!row.children || row.children.length < 1) {

                const current_value = row.value > 0 ? row.value : 1

                return {
                    name: {
                        label: row.term || row.term_id,
                        term_id: row.term_id
                    },
                    value: current_value,
                }
            } else {
                const children = (function () {
                    const ar_children = []
                    for (let i = 0; i < row.children.length; i++) {
                        const ch_row = base_data.find(el => el.term_id === row.children[i])
                        if (ch_row) {
                            const ch_len = ch_row.children && ch_row.children.length > 0 ? ch_row.children.length : 1
                            ar_children.push(build_item(ch_row, ch_len))
                        }
                    }
                    return ar_children
                })()
                return {
                    name: {
                        label: row.term || row.term_id,
                        term_id: row.term_id
                    },
                    children: children
                }
            }
        }

        function get_roots(base_data) {
            const roots = []
            for (let i = 0; i < base_data.length; i++) {

                if (base_data[i].parent.indexOf('hierarchy') !== -1) {
                    roots.push(base_data[i])
                }
            }
            return roots
        }
        const roots = get_roots(base_data)

        const item_base = roots && roots.length > 1
            ? {
                name: {
                    label: "flare",
                    term_id: null
                },
                children: roots.map(function (el) {
                    return build_item(el)
                })
            }
            : build_item(roots[0])


        return item_base
    },//end format_ts_data_for_d3



    /**
    * RENDER_ROW
    * @return promise : DOM object (document fragment)
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

            // sunburst_container
            const sunburst_container = common.create_dom_element({
                element_type: "div",
                id: 'sunburst_container',
                class_name: "sunburst_container",
                parent: fragment
            })

            // ts_selector
            const ts_selector = common.create_dom_element({
                element_type: "div",
                class_name: "ts_selector",
                parent: fragment
            })
            for (let i = 0; i < self.ts_tables.length; i++) {

                const label = self.ts_tables[i].label
                const value = self.ts_tables[i].value

                const ts_link = common.create_dom_element({
                    element_type: "a",
                    class_name: "ts_link",
                    inner_html: label,
                    parent: ts_selector
                })
                ts_link.addEventListener("click", function (e) {
                    e.preventDefault()

                    self.selected_ts_table = self.ts_tables.findIndex(el => el.value === value) || 0

                    // active. reset and set active link
                    ts_selector.querySelectorAll('.ts_link').forEach(function (item) {
                        item.classList.remove('active');
                    });
                    this.classList.add('active')

                    // draw_graph
                    const container = row_container.querySelector('#sunburst_container')
                    // clean container
                    while (container.hasChildNodes()) {
                        container.removeChild(container.lastChild);
                    }
                    draw_graph(container)
                })
                if (i == 0) {
                    ts_link.classList.add('active')
                }
            }

            // body
            if (row.body && row.body.length > 0) {
                const body = common.create_dom_element({
                    element_type: "section",
                    class_name: "content",
                    inner_html: row.body,
                    parent: fragment
                })
            }

            // media_block
            const media_block = page.render_ts_web_media_block(row, self)
            if (media_block) {
                fragment.appendChild(media_block)
            }


            resolve(fragment)
        })
    },//end render_row



    /**
    * RENDER_CHILDREN_ITEMS
    * @return promise : DocumentFragment node
    */
    render_children_items: function (rows) {

        const self = this

        return new Promise(function (resolve) {

            const ar_promises = []
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]

                ar_promises.push(self.render_item(row))
            }

            Promise.all(ar_promises).then((values) => {

                const fragment = new DocumentFragment()

                for (let i = 0; i < values.length; i++) {
                    const node = values[i]
                    if (node) {
                        // row container
                        const row_container = common.create_dom_element({
                            element_type: "div",
                            class_name: "row_container"
                        })
                        row_container.appendChild(node)

                        fragment.appendChild(row_container)
                    }
                }

                resolve(fragment)
            });
        })
    },//end render_children_items



    /**
    * RENDER_ITEM
    * This renderer is equal than render_row, except that elements are grouped in 2 blocks:
    * block_image and block_text
    * @return promise : DOM object (document fragment)
    */
    render_item: function (row) {

        const self = this

        return new Promise(function (resolve) {

            const fragment = new DocumentFragment()

            // block_image
            const block_image = common.create_dom_element({
                element_type: "div",
                class_name: "block_image",
                parent: fragment
            })

            // identify_image
            const image_url = row.identify_image
                ? row.identify_image + "?v=1"
                : page.default_image

            const identify_image = common.create_dom_element({
                element_type: "img",
                class_name: "identify_image",
                src: image_url,
                parent: block_image
            })
            identify_image.loading = "lazy"

            // block_text
            const block_text = common.create_dom_element({
                element_type: "div",
                class_name: "block_text",
                parent: fragment
            })

            // term
            const term = common.create_dom_element({
                element_type: "h3",
                class_name: "title",
                inner_html: row.term,
                parent: block_text
            })

            // title
            const title = common.create_dom_element({
                element_type: "h4",
                class_name: "title",
                inner_html: row.title,
                parent: block_text
            })

            // abstract
            if (row.abstract && row.abstract.length > 0) {
                const abstract = common.create_dom_element({
                    element_type: "div",
                    class_name: "abstract",
                    inner_html: row.abstract,
                    parent: block_text
                })
            }

            // body
            if (row.body && row.body.length > 0) {
                const body = common.create_dom_element({
                    element_type: "section",
                    class_name: "content",
                    inner_html: row.body,
                    parent: block_text
                })
            }

            // media_block
            const media_block = page.render_ts_web_media_block(row, self)
            if (media_block) {
                fragment.appendChild(media_block)
            }


            resolve(fragment)
        })
    },//end render_item



}//end project
