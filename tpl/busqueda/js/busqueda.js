"use strict";



var search = {



    /**
    * VARS
    */
    // rows_list_container
    rows_list_container: null,

    // search_options
    search_options: {},

    // keywords
    keywords: null,

    // view_mode. rows view mode. default is 'list'. Others could be 'map', 'timeline' ..
    view_mode: 'list',

    // selected_term_table	: null, // Like 'mints'

    // global filters
    filters: {},
    filter_op: "AND",
    draw_delay: 100, // ms

    // pagination
    pagination: null,

    // form. instance of form_factory
    form: null,

    // list. instance of form_list
    list: null,

    // fields
    /*ar_fields: [
        "author_main",
        "author_others",
        "authors",
        "authors_name",
        "authors_surname",
        "authors_count",
        "authors_data",
        "authors_secondary",
        "authors_alt",
        "dd_relations",
        "descriptors",
        "descriptors_data",
        "editor",
        "magazine",
        "magazine_data",
        "other_people",
        "other_people_data",
        "pdf",
        "physical_description",
        "place",
        "publication_date",
        "section_id",
        "serie",
        "title",
        "title_secondary",
        "transcription",
        "typology",
        "copy",
        "editorial",
        "typology_name",
        "url_data"
    ],*/

    // biblio_config
    biblio_config: null,

    // biblio_table
    biblio_table: 'publications',



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        const params = new URLSearchParams(window.location.search);
        if (params.has('keywords')) {
            self.keywords = params.get('keywords');
        }

        // options
        self.rows_list_container = options.rows_list_container

        // set config
        self.set_config()

        // pagination (only for list mode)
        self.pagination = {
            limit: 16,
            offset: 0,
            total: null
        }
        // first list
        self.initial_search()

        self.search_literal = null

        // subscribe events
        // event_manager.subscribe('pagination_change', pagination_change_action)
        // function pagination_change_action(item) {
        // 	// fix the new offset value
        // 	// self.offset	= item.offset

        // 	// search again
        // 	self.form_submit(null, {
        // 		filter	: false,
        // 		offset	: item.offset,
        // 		total	: self.total
        // 	})
        // }

        // event paginate is triggered by list_factory.pagination nodes << < > >>
        event_manager.subscribe('paginate', paginating)
        function paginating(offset) {
            // update pagination vars
            self.pagination.offset = offset
            // force search again
            self.form_submit()
        }

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

        // cookie
        const biblio_config = localStorage.getItem('biblio_config');
        if (biblio_config) {
            // use existing one
            self.biblio_config = JSON.parse(biblio_config)
        } else {
            // create a new one
            const biblio_config = {
                pagination: self.pagination,
                advanced_search_showed: false
            }
            localStorage.setItem('biblio_config', JSON.stringify(biblio_config));
            self.biblio_config = biblio_config
        }

        if (options) {
            for (const key in options) {
                self.biblio_config[key] = options[key]
            }
            localStorage.setItem('biblio_config', JSON.stringify(self.biblio_config));
        }

        // console.log("--> self.biblio_config [final]:", self.biblio_config);

        return self.biblio_config
    },//end set_config



    /**
    * initial_search
    * Exec initial search to show default rows list
    */
    initial_search: function () {

        const self = this

        self.form_submit(null, {
            filter: false
        })

        return true
    },//end initial_search




    /**
    * FORM_SUBMIT
    * Form submit launch search
    */
    form_submit: function () {

        const self = this

        // options
        const order = null
        const limit = self.pagination.limit
        const offset = self.pagination.offset
        const scroll_result = true

        return new Promise(function (resolve) {

            // state check
            const remove_nodes = true // (self.view_mod==='timeline' || offset !== 0) ? false : true
            if (self.form_submit_state === 'searching' && remove_nodes) {
                return new Promise(function () {
                    console.warn("Rejected form_submit. One search is in progress");
                })
            }
            self.form_submit_state = 'searching'

            // clean rows_list_container and add_spinner
            const rows_list_container = self.rows_list_container // document.querySelector("#rows_list")
            if (remove_nodes) {
                while (rows_list_container.hasChildNodes()) {
                    rows_list_container.removeChild(rows_list_container.lastChild);
                }
            }
            // add spinner
            const spinner = common.spinner(rows_list_container);

            // filter. Is built looking at form input values
            // const filter = (typeof options.filter!=="undefined")
            // 	? options.filter
            // 	: self.form.build_filter()

            // reset pagintaion vars
            // self.pagination.total	= options.total || null
            // self.pagination.offset	= options.offset || 0

            // fields
            const ar_fields = self.ar_fields

            // search rows exec against API
            self.search_rows()
                .then(function (response) {

                    // clean container and add_spinner
                    // const rows_list_container = document.querySelector("#rows_list")
                    // while (rows_list_container.hasChildNodes()) {
                    // 	rows_list_container.removeChild(rows_list_container.lastChild);
                    // }
                    // // page.add_spinner(rows_list_container)

                    // update pagination total
                    if (response.total !== undefined) {
                        self.pagination.total = response.total
                    }

                    // draw
                    setTimeout(() => {
                        spinner.remove()

                        self.render_data({
                            ar_rows: response.result
                        })
                            .then(function (list_node) {
                                const searchTitle = document.createElement('h2');
                                searchTitle.textContent = self.keywords
                                    ? `"${self.keywords}"`
                                    : '';
                                rows_list_container.appendChild(searchTitle);
                                const total = response.total || response.result.length || 0;
                                const resultsCountNode = document.createElement('p');
                                resultsCountNode.className = 'has-text-right';
                                resultsCountNode.textContent = `${total} ${(tstring.entries_found).toLowerCase()}`;
                                rows_list_container.appendChild(resultsCountNode);

                                if (common.is_node(list_node)) {
                                    rows_list_container.appendChild(list_node)
                                }
                                self.form_submit_state = 'done'
                                event_manager.publish('rendered', {
                                    rows_list_container: rows_list_container
                                })
                                resolve(rows_list_container) // All work is done. Final resolve !
                            })
                    }, self.draw_delay)

                })
        })
    },//end form_submit



    /**
    * SEARCH_ROWS
    * Call to API and load json data results of search
    */
    search_rows: function (options) {

        const self = this

        if (!self.keywords) {
            return Promise.resolve({ result: [], total: 0})
        }

        // options
        const table = 'global_search'
        const ar_fields = "*"
        const order = 'section_id asc'
        const limit = 0
        const offset = self.pagination.offset;
        const count = true
        const process_result = null
        const sql_filter = self.keywords
            ? `MATCH (search_data) AGAINST ('${self.keywords}' IN BOOLEAN MODE)`
            : null;

        // request
        const js_promise = data_manager.request({
            body: {
                dedalo_get: 'records',
                db_name: page_globals.WEB_DB,
                table: table,
                ar_fields: ar_fields,
                lang: page_globals.WEB_CURRENT_LANG_CODE,
                sql_filter: sql_filter,
                group: null,
                count: count,
                limit: limit,
                offset: offset,
                order: order,
                process_result: process_result
            }
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
        const ar_rows = options.ar_rows
        console.log({ar_rows})

        return new Promise(function (resolve) {

            const pagination = self.pagination


            const list_data = self.list_data(ar_rows) // prepares data to use in list
            self.list = self.list || new list_factory() // creates / get existing instance of list
            self.list.init({
                /*data: list_data,
                fn_row_builder: self.list_row_builder,
                pagination: pagination,
                container_class: 'pubs-list link-dn',
                caller: self*/
                data: list_data,
                fn_row_builder: self.list_row_builder,
                pagination: pagination,
                container_class: 'pub-text-results flow--l',
                caller: self
            })
            self.list.render_list()
                .then(function (list_node) {
                    resolve(list_node)
                })
            self.default_submit = false
            self.form_submit_state = 'done';


        })
    },//end render_data



    /**
    * LIST_DATA
    * Parse rows data to use in list_factory
    */
    list_data: function (ar_rows) {

        const data = []

        const ar_rows_length = ar_rows.length
        for (let i = 0; i < ar_rows_length; i++) {

            const item = ar_rows[i]

            data.push(item)
        }

        return data
    },// end list_data

    /**
     * LITERAL SEARCH RESULTS
     */

    list_row_builder: function (row) {

        row.tpl = page.section_tipo_to_template(row.ref_section_tipo);

        const parser = new DOMParser();
        const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.ref_section_id;

        const content = parser.parseFromString(`
            <li class="pb-6">
                <div class="columns is-flex-direction-row-reverse">
                    <div class="column flow--2xs">
                        <div class="flow--2xs">
                            <h3 class="is-size-3 has-text-weight-normal">
                                ${row.search_data.substring(0, 200)}...
                            </h3>
                            <p class="is-size-5 has-text-weight-medium">
                            <a href="${url}">
                                ${row.tpl}/${row.ref_section_id}
                            </a>
                            </p>
                        </div>

                    </div>
                </div>
            </li>
        `, "text/html");
        return content.body.firstChild;

    },


    /**
    * FORMAT_DROP_DOWN_LIST
    * Formats drop down list items to show their content depending on the data type
    */
    format_drop_down_list: function (column, value) {

        if (column === "dating") {

            return common.clean_date(value, ',').join(' - ')

        } else {

            if (column === "collection") {
                return common.clean_gaps(value)
            } else {
                return value
            }
        }
    },//end format_drop_down_list



    /**
    * SORT_ARRAY_BY_PROPERTY
    * Sorts an array by a given property
    */
    sort_array_by_property: function (array, property) {

        const ar_ordered = array.sort(function (a, b) {
            return a[property].localeCompare(b[property]);
        });

        return ar_ordered
    }, //end sort_array_by_property



    /**
    * FILTER_DROP_DOWN_LIST
    * Filters drop down list items to show a filtered list depending on the filtering string
    */
    filter_drop_down_list: function (array, filter_string) {
        return array.filter(function (el) {
            const el_normalized = el.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            const filtered = (el.value.toLowerCase().indexOf(filter_string.toLowerCase()) > -1) || (el_normalized.toLowerCase().indexOf(filter_string.toLowerCase()) > -1)
            return filtered
        })
    },//end filter_drop_down_list





    author: function (item) {
        if (!item.authors_name || item.authors_name.length == 0) {
            return '';
        }

        const authors_name = item.authors_name || ""
        const authors_surname = item.authors_surname || ""

        const ar_authors_name = (authors_name && authors_name.length > 0)
            ? authors_name.split(" | ")
            : [""]

        const ar_authors_surname = (authors_surname && authors_surname.length > 0)
            ? authors_surname.split(" | ")
            : [""]

        const ar_full_author_name = []
        const ar_authors_name_length = ar_authors_surname.length
        for (let i = 0; i < ar_authors_name_length; i++) {

            const name = ar_authors_name[i].trim()
            const surname = ar_authors_surname[i].trim()

            const clean_name = (name.slice(-1) === ".")
                ? name
                : (function () {
                    const beats = name.split(" ")
                    const ar_clean = []

                    // iterate all names like 'Jose María'
                    for (let i = 0; i < beats.length; i++) {

                        const first = beats[i].slice(0, 1)

                        ar_clean.push(first.toUpperCase() + ".")
                    }

                    return ar_clean.join(" ")
                })()


            const full_author_name = surname + ", " + clean_name
            ar_full_author_name.push(full_author_name)
        }

        const y = tstring.and || "y"
        const len = ar_full_author_name.length
        const last = ar_full_author_name.slice(-1)
        ar_full_author_name.pop()
        const final_authors = (len > 1)
            ? " " + ar_full_author_name.join(", ") + " " + y + " " + last
            : " " + last

        return final_authors;
    },//end author




}//end biblio
