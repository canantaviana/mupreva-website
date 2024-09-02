"use strict";



var biblio = {



    /**
    * VARS
    */
    // rows_list_container
    rows_list_container: null,

    // search_options
    search_options: {},

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

        // options
        self.rows_list_container = options.rows_list_container

        // set config
        self.set_config()

        // pagination (only for list mode)
        self.pagination = {
            limit: 30,
            offset: 0,
            total: null
        }

        // form. Created DOM form and add to items_container
        /*self.render_form()
            .then(function (form_node) {
                const form_container = document.getElementById("items_container")
                form_container.appendChild(form_node)
            })*/
        self.render_form({
            container: document.getElementById("items_container")
        })

        // first list
        self.initial_search()

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

        self.filters = {}

        self.form_submit(null, {
            filter: false
        })

        return true
    },//end initial_search


    form_template: function () {
        return htmlTemplate(`
<form action="" class="search-form search-form--pub">
    <fieldset>
        <legend class="pt-5 px-6">${tstring.documents_explore}</legend>
        <div class="py-5 px-6 mb-5 has-background-grey-light">
            <div class="columns is-variable is-5">
                <div class="column">
                    <div class="columns">
                        <div class="column">
                            <div class="field">
                                <label class="label is-sr-only" for="global_search">${tstring.documents_seach_placeholder}</label>
                                <div class="control">
                                    <input type="search" name="cercaPub" id="global_search" placeholder="${tstring.documents_seach_placeholder}" value="" class="input">
                                </div>
                            </div>
                        </div>
                        <div class="column is-narrow">
                            <button type="submit" class="button">${tstring.search_button}</button>
                        </div>
                    </div>
                    <details>
                        <summary>${tstring.advanced_search}</summary>
                        <div class="columns is-multiline">
                            <div class="column is-half-tablet is-one-third-desktop">
                                <div class="field">
                                    <label class="label is-sr-only" for="authors">${tstring.documents_author_label}</label>
                                    <div class="control">
                                        <input type="search" name="cercaAutor" id="authors" placeholder="${tstring.documents_author_label}" value="" class="input">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-half-tablet is-one-third-desktop">
                                <div class="field">
                                    <label class="label is-sr-only" for="title">${tstring.documents_title_label}</label>
                                    <div class="control">
                                        <input type="search" name="cercaTitol" id="title" placeholder="${tstring.documents_title_label}" value="" class="input">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-half-tablet is-one-third-desktop">
                                <div class="field">
                                    <label class="label is-sr-only" for="year">${tstring.documents_year_label}</label>
                                    <div class="control">
                                        <input type="search" name="cercaAny" id="year" placeholder="${tstring.documents_year_label}" value="" class="input">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-half-tablet is-one-third-desktop">
                                <div class="field">
                                    <label class="label is-sr-only" for="text">${tstring.documents_text_label}</label>
                                    <div class="control">
                                        <input type="search" name="cercaText" id="text" placeholder="${tstring.documents_text_label}" value="" class="input">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-half-tablet is-one-third-desktop">
                                <div class="field">
                                    <label class="label is-sr-only" for="type">${tstring.documents_type_label}</label>
                                    <div class="control">
                                        <input type="search" name="cercaTipus" id="type" placeholder="${tstring.documents_type_label}" value="" class="input">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-half-tablet is-one-third-desktop">
                                <div class="field">
                                    <label class="label is-sr-only" for="serie">${tstring.documents_serie_label}</label>
                                    <div class="control">
                                        <input type="search" name="cercaSerie" id="serie" placeholder="${tstring.documents_serie_label}" value="" class="input">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
                <div class="column is-3-tablet is-2-desktop has-text-centered">
                    <span class="simple-tooltip-container"><button type="button" class="js-tooltip button button--arse" data-tooltip-prefix-class="simple-tooltip" data-tooltip-content-id="arse" data-tooltip-title="ArSe" data-tooltip-close-text="${tstring.close}" id="label_tooltiph7actu5160">
                        ${tstring.documents_popup_title}
                    </button></span>
                    <div id="arse" class="is-hidden">
                        <div class="columns mt-5">
                            <div class="column is-narrow">
                                <img src="/assets/img/logo-arse.png" alt="${tstring.documents_popup_alt}" width="71" height="85">
                            </div>
                            <div class="column flow">
                                ${tstring.documents_popup_content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="checkbox-group">
            <ul class="is-flex is-flex-wrap-wrap gap-4" id="pertenencia_filter">
                <li>
                    <input class="is-checkradio" type="checkbox" checked id="checkbox_museum" required name="pertenencia" value="Propias">
                    <label for="checkbox_museum">${tstring.documents_filter_museum}</label>
                </li>
                <li>
                    <input class="is-checkradio" type="checkbox" checked id="checkbox_extern" required name="pertenencia" value="Externas">
                    <label for="checkbox_extern">${tstring.documents_filter_extern}</label>
                </li>
            </ul>
        </div>
    </fieldset>
</form>
        `);
    },

    /**
    * RENDER_FORM
    * Build DOM form nodes (inputs and buttons)
    * Create logic and view of search
    */
    render_form: function (options) {

        const self = this

        return new Promise(function (resolve) {

            const form = self.form_template();
            const currentForm = form[0];
            appendTemplate(options.container, form);

            // form_factory instance
            self.form = self.form || new form_factory()

            // input global search
            self.form.item_factory({
                id: "global_search",
                name: "global_search",
                q_column: "global_search",
                eq: "MATCH",
                eq_in: "",
                eq_out: "",
                q_table: "publications",
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
                self.pagination.offset = 0
                self.form_submit(null, {
                    filter: self.form.build_filter()
                })
            })


            // title
            self.form.item_factory({
                id: "titulo",
                name: "titulo",
                q_column: "titulo",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#title'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.biblio_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })

            // name
            self.form.item_factory({
                id: "autor",
                name: "autor",
                q_column: "autor",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#authors'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.biblio_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })

            // publication_date (date format)
            self.form.item_factory({
                id: "fecha_publicacion",
                name: "fecha_publicacion",
                q_column: "fecha_publicacion",
                eq: "=",
                eq_in: "",
                eq_out: "",
                node_input: currentForm.querySelector('#year'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.biblio_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })

            self.form.item_factory({
                id: "descripcion",
                name: "descripcion",
                q_column: "descripcion",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#text'),
                callback: function (form_item) {
                    /*self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.biblio_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })*/
                }
            })

            self.form.item_factory({
                id: "type",
                name: "type",
                q_column: "type",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#type'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.biblio_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })

            self.form.item_factory({
                id: "serie",
                name: "serie",
                q_column: "serie",
                eq: "LIKE",
                eq_in: "%",
                eq_out: "%",
                node_input: currentForm.querySelector('#serie'),
                callback: function (form_item) {
                    self.form.activate_autocomplete({
                        form_item: form_item,
                        table: self.biblio_table,
                        limit: 60,
                        parse_result: function (ar_result, term) {
                            return self.parse_autocomplete_result(ar_result, term, false)
                        }
                    })
                }
            })

            self.form.item_factory({
                id: "pertenencia",
                name: "pertenencia",
                q_column: "pertenencia",
                //eq: "=",
                eq_in: "",
                eq_out: "",
                node_input: currentForm.querySelector('#pertenencia_filter'),
                callback: function (form_item) {
                    const node_input = form_item.node_input;
                    const checkboxs = node_input.querySelectorAll('input[name="pertenencia"]');
                    checkboxs.forEach(function(elem){
                        function pertenenciaHandler() {
                            const checked = node_input.querySelectorAll('input[name="pertenencia"]:checked');
                            var value = [];
                            var sql_filter = [];
                            checked.forEach(function(checkbox){
                                value.push(checkbox.value);
                                sql_filter.push('pertenencia = \''+checkbox.value+'\'');
                            })
                            form_item.sql_filter = '';
                            if (sql_filter.length > 0) {
                                form_item.sql_filter = '('+sql_filter.join(' or ')+')';
                            }
                            form_item.q = value
                        }
                        pertenenciaHandler();
                        elem.addEventListener("change", function (event) {
                            event.preventDefault();
                            pertenenciaHandler();
                        })
                    });
                }
            })

            // fix form node
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
    * FORM_SUBMIT
    * Form submit launch search
    */
    form_submit: function (form_obj, options = {}) {

        const self = this

        // options
        const order = options.order || null
        const limit = options.limit || self.pagination.limit
        const offset = options.offset || self.pagination.offset
        const scroll_result = typeof options.scroll_result === "boolean" ? options.scroll_result : true
        const form_items = options.form_items || self.form.form_items
        const filter = (typeof options.filter !== "undefined")
            ? options.filter
            : self.form.build_filter({
                form_items: self.form.form_items
            });

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
            self.search_rows({
                filter: filter,
                limit: limit,
                offset: offset,
                order: order,
                ar_fields: ar_fields
                // process_result	: {
                // 	fn 		: 'process_result::add_parents_and_children_recursive',
                // 	columns : [{name : "parents"}]
                // }
            })
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
                                rows_list_container.appendChild(list_node)
                                self.form_submit_state = 'done'
                                event_manager.publish('rendered', {
                                    rows_list_container: rows_list_container
                                })
                                resolve(rows_list_container) // All work is done. Final resolve !
                            })
                    }, self.draw_delay)

                    // scrool to head result
                    // if (response.result.length>0) {
                    // 	const div_result = document.querySelector(".result")
                    // 	if (div_result) {
                    // 		div_result.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                    // 	}
                    // }
                })
        })
    },//end form_submit



    /**
    * SEARCH_ROWS
    * Call to API and load json data results of search
    */
    search_rows: function (options) {

        const self = this

        // options
        const table = options.table || self.biblio_table
        const filter = options.filter || null
        const ar_fields = options.ar_fields || ["*"]
        // const order			= options.order || "COALESCE(authors_surname, 'zz') ASC, publication_date ASC"
        const order = options.order || "ISNULL(autor), autor ASC, fecha_publicacion ASC"
        const limit = options.limit || self.pagination.limit
        const offset = options.offset || self.pagination.offset;
        const count = typeof options.count !== "undefined" ? options.count : true
        const process_result = options.process_result || null

        // // parse_sql_filter
        // 	const group = []
        // 	const parse_sql_filter = function(filter){

        // 		if (filter) {

        // 			const op		= Object.keys(filter)[0]
        // 			const ar_query	= filter[op]

        // 			const ar_filter = []
        // 			const ar_query_length = ar_query.length
        // 			for (let i = 0; i < ar_query_length; i++) {

        // 				const item = ar_query[i]

        // 				const item_op = Object.keys(item)[0]
        // 				if(item_op==="AND" || item_op==="OR") {

        // 					const current_filter_line = "(" + parse_sql_filter(item) + ")"
        // 					ar_filter.push(current_filter_line)
        // 					continue;
        // 				}

        // 				// item_field
        // 					const item_field = (item.field==="publication_date")
        // 						? "YEAR(" + item.field + ")"
        // 						: item.field

        // 				// filter_line
        // 					const filter_line = (item.field.indexOf("AS")!==-1 || item.field==="publication_date")
        // 						? "" +item_field+""  +" "+ item.op +" "+ item.value + (" AND "+item_field+"!=''")
        // 						: "`"+item_field+"`" +" "+ item.op +" "+ item.value + (" AND `"+item_field+"`!=''")

        // 				ar_filter.push(filter_line)

        // 				// group
        // 					if (item.group) {
        // 						group.push(item.group)
        // 					}
        // 			}
        // 			return ar_filter.join(" "+op+" ")
        // 		}

        // 		return null
        // 	}

        // // parsed_filters
        // 	const sql_filter = page.parse_sql_filter(filter, group)
        const group = []
        const sql_filter = self.form.parse_sql_filter(filter, group)

        // debug
        if (SHOW_DEBUG === true) {
            // console.log("--- search_rows parsed sql_filter:")
            // console.log(sql_filter)
        }

        // request
        const js_promise = data_manager.request({
            body: {
                dedalo_get: 'records',
                db_name: page_globals.WEB_DB,
                table: table,
                ar_fields: ar_fields,
                lang: page_globals.WEB_CURRENT_LANG_CODE,
                sql_filter: sql_filter,
                group: (group.length > 0) ? group.join(",") : null,
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

        return new Promise(function (resolve) {

            const pagination = self.pagination

            const list_data = self.list_data(ar_rows) // prepares data to use in list
            self.list = self.list || new list_factory() // creates / get existing instance of list
            self.list.init({
                data: list_data,
                fn_row_builder: self.list_row_builder,
                pagination: pagination,
                container_class: 'pubs-list link-dn',
                caller: self
            })
            self.list.render_list()
                .then(function (list_node) {
                    resolve(list_node)
                })
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
    * LIST_ROW_BUILDER
    * Build DOM nodes to insert into list pop-up
    */
    list_row_builder: function (row) {
        row.tpl = page.section_tipo_to_template(row.section_tipo);

        const parser = new DOMParser();
        const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
        var info = [];
        if (row.autor) {
            info.push(row.autor);
        }
        if (row.fecha_publicacion) {
            info.push(row.fecha_publicacion);
        }

        var image_url = '/assets/img/placeholder.png';
        if (row.imagen_identificativa !== null) {
            image_url = __WEB_MEDIA_ENGINE_URL__+row.imagen_identificativa;
        }
        const year = row.fecha_publicacion;
        const content = parser.parseFromString(`
            <li class="is-flex is-flex-direction-column full-link gap-2 ${row.tpl}">
                <h3 class="is-size-6">
                    <a href="${url}" target="_blank">${row.titulo}</a>
                </h3>
                <div class="pubs-list__pict is-flex is-flex-direction-column is-justify-content-center is-align-items-center flex-order mb-4">
                    <img loading="lazy" src="${image_url}" alt="">
                </div>
                ${(info.length > 0)?`
                <p class="is-size-7">
                    ${info.join('<br>')}
                </p>
                `:''}
            </li>
        `, "text/html");
        return content.body.firstChild;


        /*const self = this

        const row_node = row_fields.draw_item(item)

        return row_node*/
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
