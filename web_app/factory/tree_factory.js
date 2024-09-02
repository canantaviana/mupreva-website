/*global tstring, page_globals, __WEB_TEMPLATE_WEB__, Promise, BackgroundColorTheif, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



function tree_factory() {

    // vars
    // target. DOM element where timeline section is placed
    this.target = null

    // data. Database parsed rows data to create the map
    this.data = null

    // root_term. root nodes for tree
    this.root_term = null

    // caller. Instance that call here (usually thesaurus.js)
    this.caller



    /**
    * INIT
    */
    this.init = function (options) {

        const self = this

        // options
        const target = options.target
        const data = options.data
        const caller = options.caller
        const root_term = options.root_term
        const set_hilite = options.set_hilite || false

        // fix vars

        // target. DOM element where map is placed
        self.target = target

        // data. Pre-parsed data from rows. Contains items with properties 'lat', 'lon', and 'data' like [{lat: lat, lon: lon, data: []}]
        self.data = data

        // caller
        self.caller = caller

        // root_term
        self.root_term = root_term

        // set_hilite
        self.set_hilite = set_hilite

        // hilite_relations_limit. When limit is reached, no more relations are opened automatically
        self.hilite_relations_limit = 15
        self.hilite_relations_showed = 0 // incremented each time a relation is showed automatically until maximum allowed

        // hilite_indexation_limit. When limit is reached, no more indexation are opened automatically
        self.hilite_indexation_limit = 15
        self.hilite_indexation_showed = 0 // incremented each time a indexation is showed automatically until maximum allowed

        // tree_state
        const session_tree_state = sessionStorage.getItem("tree_state")
        if (session_tree_state && !self.set_hilite) {

            self.tree_state = JSON.parse(session_tree_state)

            const data_length = self.data.length
            for (let i = 0; i < data_length; i++) {
                // set state
                const current_session_item = self.tree_state.find(item => item.id === self.data[i].term_id)
                if (current_session_item) {
                    self.data[i].state = current_session_item.state
                }
            }

        } else {

            self.tree_state = []
            const data_length = self.data.length
            for (let i = 0; i < data_length; i++) {

                // open root terms by default
                if (root_term.indexOf(self.data[i].term_id) !== -1) {
                    self.data[i].status = 'opened';
                }

                const current_state = self.data[i].status || "closed"

                // set state default for all
                self.data[i].state = current_state

                // add
                self.tree_state.push({
                    id: self.data[i].term_id,
                    state: current_state
                })
            }
            sessionStorage.setItem('tree_state', JSON.stringify(self.tree_state));
        }

        // status
        self.status = "initied"


        return true
    }//end init



    /**
    * RENDER
    */
    this.render = function () {

        const self = this

        const target = self.target
        const data = self.data
        const root_term = self.root_term

        const js_promise = new Promise(function (resolve) {

            const fragment = new DocumentFragment();

            // tree_wrapper. Create the tree wrapper and insert into parent node 'self.target')
            const tree_wrapper = common.create_dom_element({
                element_type: "div",
                class_name: "tree_wrapper",
                parent: fragment
            })

            // render tree nodes
            const tree_nodes = []

            // build DOM nodes
            const data_length = data.length
            for (let i = 0; i < data_length; i++) {

                const row = data[i]

                if (row.descriptor !== 'yes') {
                    console.warn("Skipped build_tree_node of term ND :", row.term_id, row.term);
                    continue;
                }

                tree_nodes.push(
                    self.build_tree_node(row)
                )
            }

            // hierarchize nodes
            const tree_nodes_length = tree_nodes.length
            for (let i = 0; i < tree_nodes_length; i++) {

                const tree_node = tree_nodes[i]
                const term_id = tree_node.term_id

                if (root_term.indexOf(term_id) !== -1) {

                    // root tree_node
                    tree_wrapper.appendChild(tree_node)

                } else {

                    // others
                    const parent = tree_node.parent
                        ? tree_node.parent[0]
                        : null

                    if (!parent) {
                        console.log("skip non parent defined tree_node:", tree_node);
                        continue
                    }

                    const parent_tree_node = tree_nodes.find(item => item.term_id === parent)
                    if (parent_tree_node && parent_tree_node.branch) {
                        parent_tree_node.branch.appendChild(tree_node)
                    }
                }
            }


            resolve(fragment)

        })
            .then(function (response) {

                // append finished fragment to target DOM
                target.appendChild(response)

                // scroll to hilite
                if (self.set_hilite === true) {
                    common.when_in_dom(target, function () {
                        // find first hilited term
                        const tree_node = target.querySelector(".term.hilite")
                        // scroll document to hilited term (first founded at DOM)
                        if (tree_node) {
                            tree_node.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" })
                        }
                    })
                }

                return response
            })


        return js_promise
    }//end render



    /**
    * BUILD_TREE_NODE
    * @return DOM node tree_node
    */
    this.build_tree_node = function (row) {

        const self = this

        // node wrapper
        const tree_node = common.create_dom_element({
            element_type: "div",
            class_name: "tree_node",
            id: row.term_id
        })

        tree_node.term_id = row.term_id
        tree_node.parent = row.parent


        // term
        const term_value = row.term
        const to_hilite = (row.hilite && row.hilite === true)
        const term_css = to_hilite === true ? " hilite" : ""
        common.create_dom_element({
            element_type: "span",
            class_name: "term" + term_css,
            inner_html: term_value,
            parent: tree_node
        })

        // nd
        if (row.nd && row.nd.length > 0) {
            common.create_dom_element({
                element_type: "span",
                class_name: "nd",
                inner_html: "[" + row.nd.join(", ") + "]",
                parent: tree_node
            })
        }

        // buttons
        // button scope_note
        if (row.scope_note && row.scope_note.length > 0) {
            const btn_scope_note = common.create_dom_element({
                element_type: "span",
                class_name: "btn_scope_note",
                parent: tree_node
            })
            btn_scope_note.addEventListener("mousedown", function () {
                if (this.classList.contains("open")) {
                    scope_note.classList.add("hide")
                    this.classList.remove("open")
                } else {
                    scope_note.classList.remove("hide")
                    this.classList.add("open")
                }
            })
        }

        // button relations
        let btn_relations
        if (row.relations && row.relations.length > 0) {
            btn_relations = common.create_dom_element({
                element_type: "span",
                class_name: "btn_relations",
                // inner_html	: "Relations",
                parent: tree_node
            })
            btn_relations.addEventListener("mousedown", function () {
                if (this.classList.contains("open")) {
                    relations_container.classList.add("hide")
                    this.classList.remove("open")
                } else {
                    relations_container.classList.remove("hide")
                    this.classList.add("open")
                }
            })
        }

        // button indexation
        let btn_indexation
        if (row.indexation && row.indexation.length > 0) {
            btn_indexation = common.create_dom_element({
                element_type: "span",
                class_name: "btn_indexation",
                // inner_html	: "indexation",
                parent: tree_node
            })
            btn_indexation.addEventListener("mousedown", function () {
                if (this.classList.contains("open")) {
                    indexation_container.classList.add("hide")
                    this.classList.remove("open")
                } else {
                    indexation_container.classList.remove("hide")
                    this.classList.add("open")
                }
            })
        }

        // button children
        if (row.children && row.children.length > 0) {

            const open_style = row.state === "opened" ? " open" : ""

            const arrow = common.create_dom_element({
                element_type: "span",
                class_name: "arrow" + open_style,
                parent: tree_node
            })
            arrow.addEventListener("mousedown", function () {
                let new_state
                if (this.classList.contains("open")) {
                    branch.classList.add("hide")
                    this.classList.remove("open")
                    // new_state
                    new_state = "closed"
                } else {
                    branch.classList.remove("hide")
                    this.classList.add("open")
                    // new_state
                    new_state = "opened"
                }

                // state update
                const current_state = self.tree_state.find(item => item.id === row.term_id)
                if (current_state && current_state.state !== new_state) {
                    current_state.state = new_state
                    // update sessionStorage tree_state var
                    sessionStorage.setItem('tree_state', JSON.stringify(self.tree_state));
                }
            })
        }

        // scope note wrapper
        let scope_note
        if (row.scope_note && row.scope_note.length > 0) {

            const hide_style = row.state === "opened" ? "" : " hide"

            // scope_note
            const scope_note_text = row.scope_note.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '');
            scope_note = common.create_dom_element({
                element_type: "div",
                class_name: "scope_note hide",
                inner_html: scope_note_text,
                parent: tree_node
            })
        }

        // relations wrapper
        let relations_container
        if (row.relations && row.relations.length > 0) {

            // relations_container
            relations_container = common.create_dom_element({
                element_type: "div",
                class_name: "relations_container hide",
                parent: tree_node
            })

            // Callback function to execute when mutations are observed
            const callback = function (mutationsList, observer) {
                // Use traditional 'for loops' for IE 11
                for (let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!mutationsList[0].target.classList.contains("hide")) {

                            // draw nodes
                            self.render_relation_nodes(row, relations_container, self, false)

                            // Stop observing
                            observer.disconnect();
                        }
                    }
                }
            };

            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);

            // Start observing the target node for configured mutations
            observer.observe(relations_container, { attributes: true, childList: false, subtree: false });

            if (row.hilite === true && self.hilite_relations_showed < self.hilite_relations_limit) {
                relations_container.classList.remove("hide")
                btn_relations.classList.add("open")
                // increment hilite_relations_showed until reach self.hilite_relations_limit
                self.hilite_relations_showed++
            }
        }

        // indexation wrapper
        let indexation_container
        if (row.indexation && row.indexation.length > 0) {

            // indexation_container
            indexation_container = common.create_dom_element({
                element_type: "div",
                class_name: "indexation_container hide",
                parent: tree_node
            })

            // Callback function to execute when mutations are observed
            const callback = function (mutationsList, observer) {
                // Use traditional 'for loops' for IE 11
                for (let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!mutationsList[0].target.classList.contains("hide")) {

                            // draw nodes
                            self.render_indexation_nodes(row, indexation_container, self)

                            // Stop observing
                            observer.disconnect();
                        }
                    }
                }
            };

            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);

            // Start observing the target node for configured mutations
            observer.observe(indexation_container, { attributes: true, childList: false, subtree: false });

            if (row.hilite === true && self.hilite_indexation_showed < self.hilite_indexation_limit) {
                indexation_container.classList.remove("hide")
                btn_indexation.classList.add("open")

                // increment hilite_indexation_showed until reach self.hilite_indexation_limit
                self.hilite_indexation_showed++
            }
        }

        // children wrapper
        let branch
        if (row.children && row.children.length > 0) {

            const hide_style = row.state === "opened" ? "" : " hide"

            // branch
            branch = common.create_dom_element({
                element_type: "div",
                class_name: "branch" + hide_style,
                parent: tree_node
            })

            tree_node.branch = branch

        } else {

            tree_node.branch = null
        }


        return tree_node
    };//end build_tree_node



    /**
    * RENDER_RELATION_NODES
    * @return promise
    */
    this.render_relation_nodes = function (row, relations_container, self, view_in_context, limit) {

        return new Promise(function (resolve) {

            if (!row) {
                console.warn("Invalid row: ", row);
                console.trace()
                resolve(false)
            }

            if (!row.relations || row.relations.length < 1) {
                resolve(false)
            }

            limit = !isNaN(limit) ? limit : 100
            let vieved = 0
            const relations_length = row.relations.length

            // iterate function
            function iterate(from, to) {

                const fragment = new DocumentFragment()

                const ar_promises = []
                for (let i = from; i < to; i++) {
                    ar_promises.push(
                        self.build_relation_item({
                            data: row.relations[i]
                        })
                    )
                }

                Promise.all(ar_promises).then((values) => {

                    // add each rendered relation_item
                    for (let i = 0; i < values.length; i++) {
                        const relation_item = values[i]
                        fragment.appendChild(relation_item)
                    }

                    // add/move link to view in context
                    if (view_in_context === true) {
                        const view_in_context = relations_container.querySelector('.view_in_context') || common.create_dom_element({
                            element_type: "a",
                            href: page_globals.__WEB_ROOT_WEB__ + '/thesaurus/' + row.term_id,
                            class_name: "relation_item view_in_context",
                            target: "_blank",
                            title: "Thesaurus " + row.term
                        })
                        fragment.appendChild(view_in_context)
                    }

                    // load more button
                    if (to < (relations_length - 1)) {

                        vieved = vieved + (to - from)

                        const more_node = common.create_dom_element({
                            element_type: "div",
                            class_name: "more_node btn btn-light btn-block primary relation_item",
                            parent: fragment
                        })
                        more_node.offset = to

                        more_node.addEventListener("click", function () {

                            const _from = parseInt(this.offset)
                            const _to = ((_from + limit) < relations_length) ? (_from + limit) : relations_length
                            iterate(_from, _to)

                            this.remove()
                        })

                        const label = (tstring['load_more'] || "Load more..") + " <small>[" + vieved + " " + tstring.of + " " + relations_length + "]</small>"
                        const more_label = common.create_dom_element({
                            element_type: "span",
                            inner_html: label,
                            parent: more_node
                        })
                    }

                    // append to parent
                    relations_container.appendChild(fragment)

                    resolve(true)
                });
            }

            // first, iterate elements from zero to limit
            const to = limit < relations_length ? limit : relations_length
            iterate(0, to)

        })
    };//end render_relation_nodes



    /**
    * BUILD_RELATION_ITEM
    * Build DOM node relation_item
    * @return promise
    */
    this.build_relation_item = function (options) {

        const self = this

        // options
        const data = options.data

        return new Promise(function (resolve) {

            const image_url = data.image_url
            const thumb_url = data.thumb_url
            const title = data.title
            const path = data.path || data.table

            const title_text = title
                ? title
                : ''

            const relation_item = common.create_dom_element({
                element_type: "div",
                class_name: "relation_item",
                title: title_text + (SHOW_DEBUG ? (" [" + path + " " + options.data.section_tipo + " " + options.data.section_id + "]") : '')
            })

            // img
            page.build_image_with_background_color(thumb_url, relation_item)
                .then(function (response) {

                    const img = response.img

                    // append thumb image
                    relation_item.appendChild(img)

                    // image click event
                    img.addEventListener("click", function () {
                        // open detail file in another window
                        const url = page_globals.__WEB_ROOT_WEB__ + "/" + path + "/" + data.section_id
                        const new_window = window.open(url)
                        new_window.focus();
                    })
                })

            resolve(relation_item)
        })
    };//end build_relation_item



    /**
    * RENDER_INDEXATION_NODES
    * @return promise
    */
    this.render_indexation_nodes = function (row, indexation_container, self) {
        if (SHOW_DEBUG === true) {
            console.log("-- render_indexation_nodes row:", row);
        }

        return new Promise(function (resolve) {

            if (!row.indexation || row.indexation.length < 1) {
                resolve(false)
            }

            // get fragments
            self.caller.get_indexation_data(row.indexation)
                .then(function (response) {

                    const data_indexation = response.data_indexation
                    const data_interview = response.data_interview

                    // group by interview section_id
                    const groups = data_indexation.reduce(function (r, a) {
                        const interview_section_id = a.index_locator.section_top_id
                        r[interview_section_id] = r[interview_section_id] || [];
                        r[interview_section_id].push(a);
                        return r;
                    }, Object.create(null));

                    // iterate groups
                    for (const section_top_id in groups) {

                        const data_video_items = groups[section_top_id]
                        const relation_item_promise = self.build_indexation_item({
                            data_video_items: data_video_items,
                            data_interview: data_interview,
                            term: row.term,
                            parent: indexation_container
                        })
                    }

                    resolve(true)
                })
        })
    };//end render_indexation_nodes



    /**
    * BUILD_INDEXATION_ITEM
    * Build and append indexation_item to options parent element
    * @return promise
    */
    this.build_indexation_item = function (options) {

        const self = this

        return new Promise(function (resolve) {

            // @working here

            const parent = options.parent
            const data_video_items = options.data_video_items
            const data_interview = options.data_interview
            const term = options.term

            const av_section_id = data_video_items[0].section_id

            const indexation_item = common.create_dom_element({
                element_type: "div",
                class_name: "indexation_item",
                parent: parent
            })

            // img
            const thumb_url = av_section_id
                ? common.get_media_engine_url(av_section_id, 'posterframe', 'thumb', true)
                : __WEB_TEMPLATE_WEB__ + '/assets/images/default_thumb.jpg'

            page.build_image_with_background_color(thumb_url, indexation_item, null)
                .then(function (response) {

                    const img = response.img

                    // append thumb image
                    indexation_item.appendChild(img)

                    let current_video_player_wrapper = null

                    // image click event
                    img.addEventListener("click", function () {


                        event_manager.publish('open_video', {
                            mode: 'indexation', // indexation | tapes
                            data_interview: data_interview,
                            data_video_items: data_video_items,
                            term: term,
                            selected_key: 0
                        })
                    })

                    resolve(img)
                })
        })
    };//end build_indexation_item



    /**
    * GET_THESAURUS_CHILDREN
    * @return promise
    */
    this.get_thesaurus_children = function (item_terms) {

        return new Promise(function (resolve) {

            const term_id = item_terms.join(',')

            // request
            data_manager.request({
                body: {
                    dedalo_get: 'thesaurus_children',
                    db_name: page_globals.WEB_DB,
                    lang: page_globals.WEB_CURRENT_LANG_CODE,
                    ar_fields: ['term_id'],
                    term_id: term_id,
                    recursive: true,
                    only_descriptors: true,
                    remove_restricted: false,
                    multiple: true
                }
            })
                .then(function (response) {

                    const ar_terms = []
                    const elements = response.result
                    for (let j = 0; j < elements.length; j++) {

                        const terms = elements[j].result
                        for (let i = 0; i < terms.length; i++) {
                            ar_terms.push(terms[i])
                        }
                    }

                    resolve(ar_terms.map(function (el) {
                        return el.term_id
                    }))
                })
        })
    };//end get_thesaurus_children



}//end tree_factory



function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
