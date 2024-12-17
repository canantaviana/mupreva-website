/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page, forms, document, DocumentFragment, tstring, console, _form */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var actividades = {



    /**
    * VARS
    */
    // row
    row: null,

    // rows_list_container
    rows_list_container: null,

    // export_data_container
    export_data_container: null,

    // search_options
    search_options: {},

    view_mode: 'list',

    // q
    q: null,

    // selected_term_table	: null, // Like 'mints'

    // global filters
    filters: {},
    filter_op: "$and",
    draw_delay: 200, // ms

    // form. instance of form_factory
    form: null,

    // list. instance of form_list
    list: null,

    // search limit
    limit: null,

    // pagination
    pagination: null,

    // prev_filter. Stores search filter to compare with the new one
    prev_filter: false,

    // form_submit_state
    form_submit_state: null,

    // catalog_config. Object stored in browser local storage
    activity_config: null,

    // ar_rows. fix db response in each call
    ar_rows: null,

    // full_data_cache
    full_data_cache: null,



    // fields
    ar_fields: [
        "section_id",
        "imagenes_identificativas",
        "titulo",
        "section_tipo",
    ],

    activity_table: 'immovables',



    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const row = options.row
        const rows_list_container = options.rows_list_container
        const export_data_container = options.export_data_container
        const area_name = options.area_name; // catalog
        const q = options.q

        // fix vars
        self.row = row
        self.rows_list_container = rows_list_container
        self.export_data_container = export_data_container
        self.area_name = area_name
        self.q = q

        // set config
        self.set_config()

        // fix mode
        self.view_mode = (self.activity_config.view_mode ? self.activity_config.view_mode : 'list')

        // limit (read cookie '' for possible previous values)
        const limit = 12

        self.view_mode = 'list'

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

        // form. Created DOM form
        self.render_form({
            container: document.getElementById("items_container")
        })

        // order
        const order = 'titulo asc';

        // exec first search
        if (self.q && self.q.length > 0) {

            // search based on q passed by url (from main home search for example)
            const global_search_form_item = self.form.form_items.global_search
            global_search_form_item.node_input.value = self.q
            global_search_form_item.q = self.q

            self.form_submit({
                order: order,
                limit: limit
            })

        } else {
            self.form_submit({
                order: 'titulo asc',
                limit: limit
            });

        }

        // subscribe events
        // event paginate is triggered by list_factory.pagination nodes << < > >>
        event_manager.subscribe('paginate', paginating)
        function paginating(offset) {
            // update pagination vars
            self.pagination.offset = offset
            // force search again
            self.form_submit()
        }
        event_manager.publish('set_view_mode', self.view_mode)

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
        const activity_config = localStorage.getItem('immovables_config');
        if (activity_config) {
            // use existing one
            self.activity_config = JSON.parse(activity_config)
        } else {
            // create a new one
            const activity_config = {
                view_mode: self.view_mode, // list, timeline
                pagination: self.pagination
            }
            localStorage.setItem('immovables_config', JSON.stringify(activity_config));
            self.activity_config = activity_config
        }

        if (options) {
            for (const key in options) {
                self.activity_config[key] = options[key]
            }
            localStorage.setItem('immovables_config', JSON.stringify(self.activity_config));
        }


        return self.activity_config
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
        // self.proxy.view_mode = view_mode
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
            const imgActive = active.querySelector('img');
            imgActive.src = imgActive.dataset.srcOff
        }
        element.classList.add('active')
        const imgElement = element.querySelector('img');
        imgElement.src = imgElement.dataset.srcOn

        self.pagination.limit = 12
        // launch a new random search
        return self.form_submit();
    },//end switch_view



    form_template: function () {
        return htmlTemplate(`
<form action="#" class="search-form">
    <fieldset>
        <div class="mb-5">
            <div class="columns is-multiline">

                <div class="column is-half-tablet is-one-fifth-widescreen is-4-fullhd">
                    <div class="field">
                        <label class="label is-sr-only" for="cercaPub">${tstring.immovables_seach_label}</label>
                        <div class="control">
                            <input type="search" name="cercaPub" id="global_search" placeholder="${tstring.immovables_seach_label}" value="" class="input">
                        </div>
                    </div>
                </div>
                <div class="column is-half-tablet is-one-quarter-desktop is-one-fifth-widescreen is-2-fullhd">
                    <div class="field">
                        <label class="label is-sr-only" for="localizacion">${tstring.immovables_localizacion}</label>
                        <div class="control">
                            <input type="search" name="localizacion" id="localizacion" placeholder="${tstring.immovables_localizacion}" value="" class="input is-small">
                        </div>
                    </div>
                </div>
                <div class="column is-half-tablet is-one-quarter-desktop is-one-fifth-widescreen is-2-fullhd">
                    <div class="field">
                        <label class="label is-sr-only" for="periodo">${tstring.immovables_periodo}</label>
                        <div class="control">
                            <input type="search" name="periodo" id="periodo" placeholder="${tstring.immovables_periodo}" value="" class="input is-small">
                        </div>
                    </div>
                </div>


                <div class="column is-half-tablet is-one-quarter-desktop is-one-fifth-widescreen is-2-fullhd">
                    <button type="submit" class="button is-fullwidth">${tstring.search_button}</button>
                </div>
            </div>
        </div>
    </fieldset>
    <div class="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap gap-3">
        <h2 id="subtitle"></h2>
    </div>
</form>
        `);
    },

    /**
    * RENDER_FORM
    * Create logic and view of search
    */
    render_form: function (options) {

        const self = this

        return new Promise(function (resolve) {

            const form = self.form_template();
            const currentForm = form[0];
            appendTemplate(options.container, form);



            const fragment = new DocumentFragment()

            // form_factory instance
            self.form = self.form || new form_factory()

            // input global search
            const global_search = self.form.item_factory({
                id: "global_search",
                name: "global_search",
                label: tstring.global_search || "Global search",
                q_column: "global_search",
                eq: "MATCH",
                eq_in: "",
                eq_out: "",
                // q_table	: "catalog",
                class_name: 'global_search',
                node_input: currentForm.querySelector('#global_search'),
                callback: function (form_item) {
                    const node_input = form_item.node_input
                    //no fer res
                }
            })

            const submit_button = currentForm.querySelector('button[type="submit"]');

            submit_button.addEventListener("click", function (e) {
                e.preventDefault()
                self.pagination.offset = 0 // reset pagination always
                self.form_submit()
            })

            // object
            self.form.item_factory({
                id: "localizacion",
                name: "localizacion",
                q_column: "localizacion",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#localizacion'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.activity_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })

            // title
            self.form.item_factory({
                id: "periodo",
                name: "periodo",
                q_column: "periodo",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#periodo'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.activity_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })


            // add node
            self.form.node = currentForm

            resolve(self.form.node)
        })





    },//end render_form



    /**
    * PARSE_AUTOCOMPLETE_RESULT
    * @return array
    */
    parse_autocomplete_result: function (ar_result, term, q_splittable) {

        const self = this

        const ar_ordered_result = (q_splittable === true) ? self.sort_array_by_property(ar_result, "value") : ar_result
        const ar_filtered_result = (term.length != 0) ? self.filter_drop_down_list(ar_ordered_result, term) : ar_ordered_result
        const ar_drow_down_list = ar_filtered_result.slice(0, 30)

        return ar_drow_down_list
    },//end parse_autocomplete_result



    /**
    * CHANGED_TABLE_SELECTOR
    * @return bool
    */
    changed_table_selector: function (e) {

        const self = this

        // tables
        let ar_tables = []
        const catalog_tables_checked = document.querySelectorAll('input[name="catalog_tables"]:checked');

        if (catalog_tables_checked) {
            for (let i = 0; i < catalog_tables_checked.length; i++) {
                ar_tables.push(catalog_tables_checked[i].value)
            }
        }

        // avoid de-select all options
        if (ar_tables < 1) {
            // recheck current checkbox item and return
            e.target.checked = true
            return false
        } else {

            self.set_config({
                ar_tables: ar_tables
            })

            // event changed_table_selector
            event_manager.publish('changed_table_selector', {})

            self.form_submit()
        }

        return true
    },//end changed_table_selector



    /**
    * FORM_SUBMIT
    * Form submit launch search
    */
    form_submit: function (options) {

        const self = this

        return new Promise(function (resolve) {
            // options
            options = typeof options !== 'undefined' ? options : {}

            const order = options.order || 'titulo ASC'
            const limit = options.limit || self.pagination.limit
            const offset = options.offset || self.pagination.offset

            // state check
            const remove_nodes = true
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
            const spinner = common.spinner(rows_list_container);

            // filter. Is built looking at form input values.
            //const filter = self.form.build_filter()
            const filter = (typeof options.filter !== "undefined")
            ? options.filter
            : self.form.build_filter();

            // search rows exec against API
            self.search_rows({
                filter: filter,
                limit: limit,
                offset: offset,
                order: order
            })
                .then((response) => {

                    // fix response in each call
                    self.ar_rows = response.result

                    // update pagination total
                    if (response.total !== undefined) {
                        self.pagination.total = response.total
                    }

                    // render
                    spinner.remove()

                    self.render_data({
                        ar_rows: response.result,
                        target: rows_list_container
                    })
                        .then(function (response) {

                            if (common.is_node(response)) {
                                rows_list_container.appendChild(response)
                            }
                            self.form_submit_state = 'done'
                            event_manager.publish('rendered', {
                                rows_list_container: rows_list_container,
                                view_mode: self.view_mode
                            })
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
        const ar_fields = options.ar_fields || this.ar_fields
        const order = typeof options.order !== 'undefined' ? options.order : "titulo ASC, section_id ASC"
        let limit = options.limit
        let offset = options.offset
        const process_result = options.process_result || null

        // parse_sql_filter
        const group = []
        // const parsed_filter	= page.parse_sql_filter(filter, group)
        const parsed_filter = self.form.parse_sql_filter(filter, group)
        //const parsed_filter = filter
        let sql_filter = parsed_filter
            ? '(' + parsed_filter + ')'
            : null

        // prev_filter fix
        self.prev_filter = sql_filter

        // count
        let count = true

console.log(sql_filter);

        // request
        const request_body = {
            dedalo_get: 'records',
            db_name: page_globals.WEB_DB,
            lang: page_globals.WEB_CURRENT_LANG_CODE,
            // table		: 'objects',
            table: this.activity_table,
            ar_fields: ar_fields,
            sql_filter: sql_filter,
            limit: limit,
            group: (group.length > 0) ? group.join(",") : null,
            count: count,
            offset: offset,
            order: order,
            process_result: process_result
        }
        request_body.resolve_portals_custom = {
            imagenes_identificativas: 'image'
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
    * Render received DB data based on 'view_mode' (list, timeline)
    * @return bool
    */
    render_data: function (options) {

        const self = this

        return new Promise(function (resolve) {

            const ar_rows = options.ar_rows
            const target = options.target

            // case no results
            if (ar_rows.length < 1 && self.q && self.q.length > 0) {

                // clean form q item value
                const global_search_form_item = self.form.form_items.global_search
                global_search_form_item.node_input.value = ''
                global_search_form_item.q = ''

                // reset submit state
                self.form_submit_state = 'done'

                // exec default random search
                self.form_submit({
                    order: 'titulo desc',
                    limit: self.limit
                })
                resolve()
                return
            }


            const pagination = self.pagination
            const container_class = 'columns is-multiline link-dn';
            const list_data = page.parse_list_data(ar_rows) // prepares data to use in list
            self.list = self.list || new list_factory() // creates / get existing instance of list
            self.list.init({
                data: list_data,
                fn_row_builder: self.list_row_builder,
                container_class: container_class,
                pagination: pagination,
                caller: self
            })
            self.list.render_list()
                .then(function (list_node) {
                    var subtitle = document.getElementById('subtitle');
                    subtitle.innerHTML = tstring.immovables_title;

                    resolve(list_node)
                })

        })
    },//end render_data


    /**
    * LIST_ROW_BUILDER
    * Build DOM nodes to insert into list pop-up
    */
    list_row_builder: function (row, view_mode) {

        const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
        var image_url = '/assets/img/placeholder.png';
        if (row.imagenes_identificativas.length > 0) {
            image_url = __WEB_MEDIA_ENGINE_URL__+row.imagenes_identificativas[0].image;
        }
        return htmlTemplate(`
        <li class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen ${row.tpl}">
            <div class="card is-flex is-flex-direction-column full-link">
                <div class="p-5 flow--xs">
                    <h3 class="is-size-5 has-text-weight-semibold">
                        <a href="${url}" target="_blank">${row.titulo}</a>
                    </h3>
                    ${(row.localizacion)?
                    `<p class="is-size-6 has-text-weight-medium">${row.localizacion}</p>`
                    :''}
                </div>
                <img loading="lazy" src="${image_url}" alt="">
            </div>
        </li>
        `)[0];
    },//end list_row_builder



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

}//end catalog
