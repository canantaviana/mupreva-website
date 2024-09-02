/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page, forms, document, DocumentFragment, tstring, console, _form */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var outstanding = {



    /**
    * VARS
    */
    // rows_list_container
    rows_list_container: null,

    // export_data_container
    export_data_container: null,

    // search_options
    search_options: {},

    // view_mode. rows view mode. default is 'list'. Others could be 'map', 'timeline' ..
    view_mode: null,

    // selected_term_table	: null, // Like 'mints'

    // global filters
    filters: {},
    filter_op: "$and",
    draw_delay: 200, // ms

    // form. instance of form_factory
    form: null,

    // list. instance of form_list
    list: null,

    // map. instance of form_map
    map: null,

    // timeline. instance of form_timeline
    timeline: null,

    // search limit
    limit: null,

    // pagination
    pagination: null,

    // prev_filter. Stores search filter to compare with the new one
    prev_filter: false,

    // form_submit_state
    form_submit_state: null,

    // catalog_config. Object stored in browser local storage
    catalog_config: null,

    // ar_rows. fix db response in each call
    ar_rows: null,

    // full_data_cache
    full_data_cache: null,

    // form instance
    form: null,



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const rows_list_container = options.rows_list_container
        const export_data_container = options.export_data_container
        const area_name = options.area_name; // catalog | outstanding

        // fix vars
        self.rows_list_container = rows_list_container
        self.export_data_container = export_data_container
        self.area_name = area_name

        // set config
        self.set_config()

        // fix mode
        self.view_mode = (self.catalog_config.view_mode ? self.catalog_config.view_mode : 'list')

        // limit (read cookie 'catalog_config' for possible previous values)
        // const limit = (self.catalog_config.pagination && self.catalog_config.pagination.limit)
        // 	? self.catalog_config.pagination.limit
        // 	: ((self.view_mode==='timeline' || self.view_mode==='map') ? 0 : 15)

        const limit = 1000

        // offset
        const offset = 0

        // total
        const total = null

        // pagination (only for list mode)
        self.pagination = {
            limit: parseInt(limit),
            offset: offset,
            total: total,
            n_nodes: 5
        }

        // outstanding. self.forced_filter
        self.forced_filter = {
            "$and": [
                {
                    field: 'outstanding',
                    op: '=',
                    sql_filter: null,
                    value: "'si'"
                },
                {
                    field: 'identifying_images',
                    op: '=',
                    sql_filter: 'identifying_images!=\'\'',
                    value: ''
                }
            ]
        }

        // export_data_buttons
        const export_data_buttons = page.render_export_data_buttons()
        self.export_data_container.appendChild(export_data_buttons)

        // order
        const order = (function () {
            switch (self.view_mode) {
                case 'timeline': return 'dating_start, dating';
                case 'map': return null;
                default: return 'RAND()';
            }
        })()

        // form instance
        self.form = new form_factory()

        // exec first default search without params
        self.form_submit({
            order: order,
            limit: limit
        })

        // subscribe events
        // event map_selected_marker
        // event_manager.subscribe('map_selected_marker', selected_marker)
        // function selected_marker(data) {
        // 	console.log(" selected_marker data:", data);
        // }
        // event map_popup_selected_item
        // event_manager.subscribe('map_popup_selected_item', map_popup_selected_item)
        // function map_popup_selected_item(data) {
        // 	const url = page_globals.__WEB_ROOT_WEB__ + '/' + data.tpl + '/' + data.section_id
        // 	window.open(url)
        // }
        // event paginate is triggered by list_factory.pagination nodes << < > >>
        // event_manager.subscribe('paginate', paginating)
        // function paginating(offset) {
        // 	// update pagination vars
        // 	self.pagination.offset = offset
        // 	// force search again
        // 	self.form_submit()
        // }
        // // event data_request_done is triggered when new search is done
        // event_manager.subscribe('data_request_done', data_request_done)
        // function data_request_done(options) {

        // 	// const node = page.render_export_data(options)

        // 	// // clean container
        // 	// while (self.export_data_container.hasChildNodes()) {
        // 	// 	self.export_data_container.removeChild(self.export_data_container.lastChild);
        // 	// }

        // 	// self.export_data_container.appendChild(node)
        // }

        // event publish template_render_end
        event_manager.publish('template_render_end', {})


        return true
    },//end set_up



    /**
    * SET_CONFIG
    * @param options object (optional)
    * @return
    */
    set_config: function (options) {

        const self = this

        // outstanding. Fixed config
        if (self.area_name === 'outstanding') {

            self.catalog_config = {
                view_mode: "list_images",
                pagination: {
                    limit: (15 * 4),
                    offset: 0,
                    total: null,
                    n_nodes: 5
                },
                ar_tables: ["objects", "sets", "pictures", "immovable"]
            }

            return self.catalog_config
        }

        // cookie
        const catalog_config = localStorage.getItem('catalog_config');
        if (catalog_config) {
            // use existing one
            self.catalog_config = JSON.parse(catalog_config)

        } else {
            // create a new one
            const catalog_config = {
                view_mode: self.view_mode, // list, list_images, map, timeline
                pagination: self.pagination
            }
            localStorage.setItem('catalog_config', JSON.stringify(catalog_config));
            self.catalog_config = catalog_config
        }

        if (options) {
            for (const key in options) {
                self.catalog_config[key] = options[key]
            }
            localStorage.setItem('catalog_config', JSON.stringify(self.catalog_config));
        }


        return self.catalog_config
    },//end set_config



    /**
    * SWITCH_VIEW
    * @return promise
    */
    switch_view: function (view_mode, list_mode_group, element) {

        const self = this

        if (self.view_mode === view_mode) {
            return // nothing to change
        }

        const previous_view_mode = JSON.parse(JSON.stringify(self.view_mode))

        // fix current across proxy
        self.view_mode = view_mode

        event_manager.publish('set_view_mode', view_mode)

        // set config (localstorage)
        self.set_config({
            view_mode: view_mode
        })

        // reset active and set current
        const active = list_mode_group.querySelector('.active')
        if (active) {
            active.classList.remove('active')
        }
        element.classList.add('active')

        switch (view_mode) {

            case 'list':
            case 'list_images':
                if (previous_view_mode === 'list' || previous_view_mode === 'list_images') {
                    // re-render parsed data
                    return self.render_rows_again()
                } else {
                    // fix limit again (is removed by map and timeline modes)
                    self.pagination.limit = 15
                    // launch a new random search
                    return self.form_submit({
                        order: 'RAND()'
                    })
                }
                break;
            case 'map':
                self.pagination.limit = 0
                return self.form_submit({})

            case 'timeline':
                self.pagination.limit = 0
                return self.form_submit({
                    order: 'dating_start, dating'
                })
        }


        return true
    },//end switch_view



    /**
    * FORM_SUBMIT
    * Form submit launch search
    */
    form_submit: function (options) {

        const self = this

        return new Promise(function (resolve) {

            // options
            options = typeof options !== 'undefined' ? options : {}

            const order = options.order || 'section_id ASC'
            const limit = options.limit || self.pagination.limit
            const offset = options.offset || self.pagination.offset

            // state check
            const remove_nodes = false
            if (self.form_submit_state === 'searching' && remove_nodes) {
                return new Promise(function () {
                    console.warn("Rejected form_submit. One search is in progress");
                })
            }
            self.form_submit_state = 'searching'

            // clean rows_list_container and add_spinner
            const rows_list_container = self.rows_list_container
            if (remove_nodes) {
                while (rows_list_container.hasChildNodes()) {
                    rows_list_container.removeChild(rows_list_container.lastChild);
                }
            }
            // add spinner
            const spinner = common.create_dom_element({
                element_type: "div",
                class_name: "spinner",
                parent: rows_list_container
            })

            // filter. Is built looking at form input values. forced_filter is used in outstanding list
            const filter = self.forced_filter || self.form.build_filter()

            // search rows exec against API
            self.search_rows({
                filter: filter,
                limit: (self.view_mode === 'map') ? null : limit,
                offset: (self.view_mode === 'map') ? null : offset,
                order: (self.view_mode === 'map') ? null : order
            })
                .then((response) => {

                    // fix response in each call
                    self.ar_rows = response.result

                    // update pagination total
                    if (response.total !== undefined) {
                        self.pagination.total = response.total
                    }

                    // draw
                    spinner.remove()

                    self.render_data({
                        ar_rows: response.result,
                        target: rows_list_container
                    })
                        .then(function (response) {

                            // response is a document Fragment containing pagination and rows
                            if (common.is_node(response)) {

                                // const current_rows_container = rows_list_container.querySelector(".rows_container")
                                // if (current_rows_container) {
                                // 	const new_rows_container = response.querySelector(".rows_container")
                                // 	if (new_rows_container) {

                                // 		// const child_nodes = new_rows_container.childNodes
                                // 		while (new_rows_container.childNodes.length > 0) {
                                // 		    current_rows_container.appendChild(new_rows_container.childNodes[0]);
                                // 		}
                                // 	}
                                // }else{
                                rows_list_container.appendChild(response)
                                // }
                            }
                            self.form_submit_state = 'done'
                            // event_manager.publish('rendered', {
                            // 	rows_list_container	: rows_list_container,
                            // 	view_mode			: self.view_mode
                            // })
                            resolve(rows_list_container) // All work is done. Final resolve !
                        })


                    // fix mode
                    // set config
                    self.set_config({
                        view_mode: self.view_mode
                    })

                    // scroll to head result
                    // if (response.result.length>0) {
                    // 	const div_result = document.querySelector(".result")
                    // 	if (div_result) {
                    // 		// div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                    // 		div_result.scrollIntoView({behavior: "auto", block: "center", inline: "nearest"});
                    // 	}
                    // }
                })
        })
    },//end form_submit



    /**
    * SEARCH_ROWS
    * Call to API and load JSON data results of search
    */
    search_rows: function (options) {

        const self = this

        // options
        const filter = options.filter || null
        const ar_fields = options.ar_fields || ["*"]
        const order = typeof options.order !== 'undefined' ? options.order : "section_id ASC"
        const limit = options.limit || 0
        const offset = options.offset || 0
        const count = options.count || false

        // cache
        // if (self.full_data_cache && (self.view_mode==='timeline' || self.view_mode==='map')) {
        // 	return new Promise(function(resolve){
        // 		const response = self.full_data_cache
        // 		resolve(response)
        // 	})
        // }

        // parse_sql_filter
        const group = []
        const parsed_filter = self.form.parse_sql_filter(filter, group)
        let sql_filter = parsed_filter
            ? '(' + parsed_filter + ')'
            : null

        // tables
        const ar_tables = ['objects', 'sets', 'pictures', 'immovable']

        // request
        const request_body = {
            dedalo_get: 'records',
            db_name: page_globals.WEB_DB,
            lang: page_globals.WEB_CURRENT_LANG_CODE,
            table: ar_tables.join(','),
            ar_fields: ar_fields,
            sql_filter: sql_filter,
            limit: limit,
            count: count,
            offset: offset,
            order: order
        }
        const js_promise = data_manager.request({
            body: request_body
        })
        js_promise.then((response) => {
            event_manager.publish('data_request_done', {
                request_body: request_body,
                result: response.result
            })
        })


        return js_promise
    },//end search_rows



    /**
    * RENDER_DATA
    * Render received DB data based on 'view_mode' (list, map, timeline)
    * @return bool
    */
    render_data: function (options) {

        const self = this

        // options
        const ar_rows = page.parse_list_data(options.ar_rows)
        const target = options.target

        return new Promise(function (resolve) {

            const fragment = new DocumentFragment()

            // css target reset
            target.className = ''; // reset target class
            target.style = ''; // reset target style
            target.classList.add('list_images')

            const rows_container = common.create_dom_element({
                element_type: "div",
                class_name: "rows_container grid are-images-unloaded",
                parent: fragment
            })

            const grid_sizer = common.create_dom_element({
                element_type: "div",
                class_name: "grid-sizer",
                parent: rows_container
            })

            // nodes pagination initial values
            const limit = 12
            let from = 0
            let to = (limit < ar_rows.length) ? limit : ar_rows.length

            // render nodes using list_row_builder
            function render_nodes(_from, _to) {
                const ar_nodes = []

                for (let i = _from; i < _to; i++) {
                    const row = ar_rows[i]
                    const node = self.list_row_builder(row, 'list_images')
                    ar_nodes.push(node)
                }

                return ar_nodes
            }

            // first render
            const nodes = render_nodes(from, to)
            for (let i = 0; i < nodes.length; i++) {
                rows_container.appendChild(nodes[i])
            }
            apply_masonry(nodes)

            // load more button
            const load_more = common.create_dom_element({
                element_type: "button",
                class_name: "load_more",
                inner_html: "load more",
                parent: fragment
            })

            // masonry apply
            var msnry = null
            function apply_masonry(items) {

                const grid = rows_container

                imagesLoaded(grid, function () {

                    if (!msnry) {
                        // init Masonry
                        msnry = new Masonry(grid, {
                            itemSelector: 'none',
                            columnWidth: '.grid-sizer',
                            percentPosition: true,
                            stagger: 30,
                            visibleStyle: { transform: 'translateY(0)', opacity: 1 },
                            hiddenStyle: { transform: 'translateY(100px)', opacity: 0 }
                        })
                        msnry.on('layoutComplete', onLayout);
                        msnry.options.itemSelector = '.grid-item';
                        msnry.layout()
                    }
                    grid.classList.remove('are-images-unloaded');
                    msnry.appended(items);

                })//end imagesLoaded

                let infinity_scroll
                function onLayout(items) {

                    // load hi res images
                    const items_length = items.length
                    for (let i = 0; i < items_length; i++) {

                        const item = items[i]
                        const image = item.element.firstChild

                        if (image.image_url && image.src !== image.image_url) {
                            image.src = image.image_url
                        }

                        item.element.classList.remove('hide_opacity')
                    }

                    // scroll event lo load more items
                    // window.addEventListener("scroll", load_more_items, false)
                    // function load_more_items() {
                    // 	if(common.is_element_in_viewport(load_more)) {
                    // 		window.removeEventListener("scroll", load_more_items, false)

                    // 		load_items()
                    // 		// // update values from/ to
                    // 		// 	from = from + limit
                    // 		// 	to = ( (from+limit)<ar_rows.length) ? (from+limit) : ar_rows.length

                    // 		// const nodes = render_nodes(from, to)
                    // 		// for (let i = 0; i < nodes.length; i++) {
                    // 		// 	rows_container.appendChild(nodes[i])
                    // 		// }
                    // 		// apply_masonry(nodes)
                    // 	}
                    // }

                    // optimized version of scroll
                    infinity_scroll = typeof infinity_scroll !== "undefined"
                        ? infinity_scroll
                        : false
                    if (infinity_scroll === true) {

                        let lastScrollPosition = window.scrollY || 0
                        let tick = false; // Track whether call is currently in process

                        window.addEventListener('scroll', scroll, false);
                        function scroll() {
                            lastScrollPosition = window.scrollY;
                            if (!tick) {
                                window.requestAnimationFrame(function () {
                                    load_more_items(lastScrollPosition);
                                    tick = false;
                                });
                                tick = true;
                            }
                        }

                        function load_more_items() {

                            const observer = new IntersectionObserver(function (entries) {
                                window.removeEventListener("scroll", scroll, false)
                                // if(entries[0].isIntersecting === true) {}
                                const entry = entries[0]
                                if (entry.isIntersecting === true || entry.intersectionRatio > 0) {
                                    load_items()
                                    // observer.unobserve(entry.target);
                                    observer.disconnect();
                                }
                            }, { threshold: [0] });
                            observer.observe(load_more);
                        }
                    }
                    infinity_scroll = true

                }//end onLayout

            }//end apply_masonry


            function load_items() {
                // update values from/ to
                from = from + limit
                to = ((from + limit) < ar_rows.length) ? (from + limit) : ar_rows.length

                const nodes = render_nodes(from, to)
                for (let i = 0; i < nodes.length; i++) {
                    rows_container.appendChild(nodes[i])
                }
                apply_masonry(nodes)
            }


            resolve(fragment)
        })
    },//end render_data



    /**
    * LIST_ROW_BUILDER
    * Build DOM nodes to insert into list pop-up
    */
    list_row_builder: function (row, view_mode) {

        const mode = view_mode // list | list_images (masonry)

        const row_node = common.create_dom_element({
            element_type: 'div',
            class_name: 'row_node grid-item hide_opacity ' + row.tpl
        })

        // render using catalog item_list_row
        const item_fragment = item_list_row.render_item(row, mode, row_node)
        if (item_fragment) {
            row_node.appendChild(item_fragment)
        }

        return row_node
    },//end list_row_builder



    /**
    * TIMELIME_BLOCK_BUILDER
    */
    timelime_block_builder: function (item, max_group_nodes) {

        const self = this

        // sample html
        // <div class="cd-timeline__block">

        //   <div class="cd-timeline__img cd-timeline__img--picture">
        // 	  <img src="assets/img/cd-icon-picture.svg" alt="Picture">
        //   </div> <!-- cd-timeline__img -->

        //   <div class="cd-timeline__content text-component">
        // 	  <h2>Title of section 1</h2>
        // 	  <p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut.</p>

        // 	  <div class="flex justify-between items-center">
        // 	    <span class="cd-timeline__date">Jan 14</span>
        // 	    <a href="#0" class="btn btn--subtle">Read more</a>
        // 	  </div>
        //   </div> <!-- cd-timeline__content -->

        // </div> <!-- cd-timeline__block -->

        const timeline_icon_src = __WEB_TEMPLATE_WEB__ + "/assets/images/cd-icon-picture.svg"
        const group_date = item.date //|| "Undefined date"
        // console.log("group_date:",group_date);

        // NEW WAY (without limit, only group nodes are limited)
        // wrapper
        const block = common.create_dom_element({
            element_type: "div",
            class_name: "cd-timeline__block"
        })

        // icon
        const image_icon = common.create_dom_element({
            element_type: "div",
            class_name: "cd-timeline__img cd-timeline__img--picture",
            parent: block
        })
        // const icon = common.create_dom_element({
        // 	element_type	: "img",
        // 	class_name		: "",
        // 	src				: timeline_icon_src,
        // 	parent			: image_icon
        // })

        // content
        const block_content = common.create_dom_element({
            element_type: "div",
            class_name: "cd-timeline__content text-component",
            parent: block
        })

        // render block items loop data_group
        const limit = max_group_nodes
        let vieved = 0
        const data_group_length = item.data_group.length

        // iterate function
        function iterate(from, to) {

            const fragment = new DocumentFragment()

            for (let i = from; i < to; i++) {

                const title = item.data_group[i].title //|| "Undefined title"
                const summary = item.data_group[i].description //|| "Undefined description"
                const image_src = item.data_group[i].image_src
                const date = item.data_group[i].date

                // item
                const block_item = common.create_dom_element({
                    element_type: "div",
                    class_name: "block_item",
                    parent: fragment
                })

                // img
                const image_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "image_container",
                    parent: block_item
                })
                const img = common.create_dom_element({
                    element_type: "img",
                    class_name: "",
                    src: image_src,
                    parent: image_container
                })
                // add image wrapper background color
                // page.build_image_with_background_color(image_src, image_container)
                // image click event
                img.addEventListener("click", function () {
                    const data = item.data_group[i]
                    // open detail file in another window
                    const url = page_globals.__WEB_ROOT_WEB__ + "/" + data.tpl + "/" + data.section_id
                    const new_window = window.open(url)
                    new_window.focus()
                })

                // text
                const text_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "text_container",
                    parent: block_item
                })
                const title_node = common.create_dom_element({
                    element_type: "h2",
                    text_content: title,
                    parent: text_container//block_item
                })
                const complete_date = common.create_dom_element({
                    element_type: "p",
                    class_name: "color-contrast-high",
                    text_content: date,
                    parent: text_container//block_item//below_container
                })
            }//end for (let i = from; i < to; i++)

            // load more button
            if (to < (data_group_length - 1)) {

                vieved = vieved + (to - from)

                const block_item = common.create_dom_element({
                    element_type: "div",
                    class_name: "block_item",
                    parent: fragment
                })

                const more_node = common.create_dom_element({
                    element_type: "div",
                    class_name: "more_node btn timeline_show_more",
                    parent: block_item
                })
                more_node.offset = to

                more_node.addEventListener("click", function () {
                    const _from = parseInt(this.offset)
                    const _to = data_group_length // view all in one click
                    iterate(_from, _to)

                    this.remove()
                })

                const label = (tstring['load_more'] || "Load more..") + " <small>[" + vieved + " " + tstring.of + " " + data_group_length + "]</small>"
                const more_label = common.create_dom_element({
                    element_type: "span",
                    inner_html: label,
                    parent: more_node
                })
            }

            // append to parent
            block_content.appendChild(fragment)
        }

        // first, iterate elements from zero to limit
        const to = limit < data_group_length ? limit : data_group_length
        iterate(0, to)


        // date and link
        const below_container = common.create_dom_element({
            element_type: "div",
            class_name: "flex justify-between items-center",
            parent: block_content
        })
        const date_span = common.create_dom_element({
            element_type: "span",
            class_name: "cd-timeline__date",
            text_content: group_date,
            parent: below_container
        })


        return block
    },//end timelime_block_builder



}//end catalog
