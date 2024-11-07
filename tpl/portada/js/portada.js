/*global tstring, page_globals, SHOW_DEBUG, item_list_row, common, event_manager, forms, document, BASE_LINKS, DocumentFragment, tstring, console, localStorage, page, activate_carousels, window */
/*eslint no-undef: "error"*/
/*jshint esversion: 6, node: true */
"use strict";



var main_home = {



    /**
    * VARS
    */
    // parsed row object form ts_web
    row: null,
    // header DOM node
    header_node: null,
    // carousel_container
    carousel_container: null,
    // carousel_items_limit
    carousel_items_limit: 8,



    /**
    * SET_UP
    */
    set_up: function (options) {

        // Clear old temporal data
        if (!localStorage.getItem('home_vieved_images')) {
            localStorage.clear();
        }

        const self = this

        // options
        const row = options.row
        const header_node = options.header_node
        const carousel_container = options.carousel_container

        // fix values
        self.row = page.parse_ts_web(row)[0]
        self.header_node = header_node
        self.carousel_container = carousel_container

        // carousel_items_limit
        switch (true) {
            case window.innerWidth <= 1500:
                self.carousel_items_limit = 8
                break;
            default:
                self.carousel_items_limit = 8
                break;
        }

        // render_header
        self.render_header()

        // render_catalog_carousels
        const ar_promises = []

        // carousel objects, sets
        ar_promises.push(
            new Promise(function (resolve) {
                self.load_catalog_data({
                    table: ['objects', 'sets']
                })
                    .then(function (rows) {
                        const fragment = self.render_catalog_carousel({
                            rows: rows,
                            title: tstring.objetos || 'Objects',
                            color: 'qdp_purple'
                        })
                        resolve(fragment)
                    })
            })
        );

        // carousel pictures
        ar_promises.push(
            new Promise(function (resolve) {
                self.load_catalog_data({
                    table: ['pictures']
                })
                    .then(function (rows) {
                        const fragment = self.render_catalog_carousel({
                            rows: rows,
                            title: tstring.fotografias || 'Pictures',
                            color: 'qdp_blue'
                        })
                        resolve(fragment)
                    })
            })
        );

        // carousel immovable
        ar_promises.push(
            new Promise(function (resolve) {
                self.load_catalog_data({
                    table: ['immovable']
                })
                    .then(function (rows) {
                        const fragment = self.render_catalog_carousel({
                            rows: rows,
                            title: tstring.inmueble || 'Immovable',
                            color: 'qdp_green'
                        })
                        resolve(fragment)
                    })
            })
        );

        Promise.all(ar_promises).then((values) => {

            // append carousels in desired order when all rows are loaded
            for (let i = 0; i < values.length; i++) {
                self.carousel_container.appendChild(values[i])
            }

            // activate already rendered and DOM placed carousels
            setTimeout(function () {
                activate_carousels('.carousel')
            }, 30)
        });

        // outstanding
        const outstanding_container = document.getElementById('outstanding_container')
        const outstanding_node = self.render_outstanding({

        })
        outstanding_container.appendChild(outstanding_node)

        // event publish template_render_end
        event_manager.publish('template_render_end', {})

        event_manager.subscribe('hide_button_scroll_to_top', _hide_button_scroll_to_top)
        let link_image_big = null
        function _hide_button_scroll_to_top(response) {

            link_image_big = link_image_big || document.querySelector('.link_image_big')
            if (!link_image_big) {
                return
            }

            if (response.result === true) {
                link_image_big.classList.add('hide')
            } else {
                link_image_big.classList.remove('hide')
            }
        }


        return true
    },//end set_up



    /**
    * RENDER_HEADER
    * Set a random identify_image to the header_node to show
    * the big image fade in
    * @return bool true
    */
    render_header: function () {

        const self = this

        const identify_images = self.row.identify_image
        if (identify_images && identify_images.length > 0) {

            const background_image_base = self.pick_random_image(identify_images)
            const background_image = background_image_base + '/home_big'

            // fix image
            self.background_image = background_image

            self.header_node.style.backgroundImage = 'url(' + background_image + ')';

            // search form
            const header_container = self.header_node.querySelector(".header_container")
            const global_search_form = common.create_dom_element({
                element_type: 'form',
                class_name: 'global_search_form',
                parent: header_container
            })
            global_search_form.addEventListener("submit", function (e) {
                e.preventDefault()

                if (global_search_input.value.length < 1) {
                    global_search_input.focus()
                    return false
                }

                window.location.href = BASE_LINKS + 'catalogo/' + encodeURI(global_search_input.value)

                return false
            }, false)

            // search input
            const global_search_input = common.create_dom_element({
                element_type: 'input',
                type: 'text',
                class_name: 'global_search_input',
                parent: global_search_form
            })
            const h_logo = self.header_node.querySelector('.h_logo')
            global_search_input.addEventListener("focus", function (e) {

                // active overlay pseudo :after opacity 0.5
                self.header_node.style.setProperty("--z_overlay", 0);
                self.header_node.style.setProperty("--transition_delay", '0');
                self.header_node.style.setProperty("--transition_params", 'opacity 0.45s ease-in-out');
                self.header_node.style.setProperty("--opacity_overlay", '0.5');
            })
            global_search_input.addEventListener("blur", function (e) {
                // hide overlay :after opacity 0
                self.header_node.style.setProperty("--opacity_overlay", 0);
            })

            // search icon
            const search_icon = common.create_dom_element({
                element_type: 'img',
                class_name: 'search_icon',
                title: tstring.buscar || 'Search',
                src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_search_black.svg',
                parent: global_search_form
            })
            search_icon.addEventListener("click", function (e) {
                button_submit.click()
            })

            // submit button
            const button_submit = common.create_dom_element({
                element_type: 'button',
                type: 'submit',
                class_name: 'hide',
                value: tstring.buscar || 'Search',
                parent: global_search_form
            })

            global_search_form.classList.add("show")

            // image_linker
            try {
                const image_section_id = /.*\/([0-9]+)$/.exec(background_image_base)[1]
                if (image_section_id && Number.isInteger(parseInt(image_section_id))) {
                    setTimeout(function () {
                        self.load_image_linker(image_section_id)
                            .then(function (link_node) {
                                if (link_node) {
                                    global_search_form.appendChild(link_node)
                                }
                            })
                    }, 1000)
                }
            } catch (error) {
                console.error(error)
            }

            // arrow down
            setTimeout(function () {
                const arrow_down = common.create_dom_element({
                    element_type: 'img',
                    class_name: 'arrow_down',
                    title: 'Continue',
                    src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_arrow_down.svg',
                    parent: self.header_node
                })
                arrow_down.addEventListener("click", function (e) {
                    e.preventDefault();

                    const banner = document.getElementById('banner')
                    if (banner) {
                        arrow_down.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
                    }
                })
            }, 2000)
        }//end if (identify_images && identify_images.length>0)

        return true
    },//end render_header



    /**
    * PICK_RANDOM_IMaGE
    * Pick a random image from the identify_images array and track
    * current user already view images to prevent to show same image again
    * @return string image url
    */
    pick_random_image: function (identify_images) {

        const ar_usable_images = []
        const identify_images_length = identify_images.length

        // home_vieved_images from localStorage
        const home_vieved_images_string = localStorage.getItem('home_vieved_images');
        let home_vieved_images = home_vieved_images_string
            ? JSON.parse(LZString.decompressFromUTF16(home_vieved_images_string))
            : []
        const home_vieved_images_length = home_vieved_images.length


        // check is full
        if (identify_images_length === home_vieved_images_length) {
            localStorage.setItem('home_vieved_images', LZString.compressToUTF16('[]')); // reset
            home_vieved_images = []
        }

        // get already viewed images
        if (home_vieved_images_length > 0) {

            for (let i = 0; i < identify_images_length; i++) {
                const current_image = identify_images[i]
                if (home_vieved_images.indexOf(current_image) === -1) {
                    ar_usable_images.push(current_image)
                }
            }
        } else {

            for (let i = 0; i < identify_images_length; i++) {
                const current_image = identify_images[i]
                ar_usable_images.push(current_image)
            }
        }

        // random pick
        const selected = ar_usable_images[Math.floor(Math.random() * ar_usable_images.length)];

        // final
        const final_image = selected
            ? (() => {
                // save user viewed
                home_vieved_images.push(selected)
                localStorage.setItem('home_vieved_images', LZString.compressToUTF16(JSON.stringify(home_vieved_images)));

                return selected
            })()
            : (() => {
                console.error("Error on get selected image. Fallback to identify_images");
                return identify_images[Math.floor(Math.random() * identify_images.length)]
            })()



        return final_image
    },//end pick_random_image



    /**
    * LOAD_IMAGE_LINKER
    * @return
    */
    load_image_linker: function (image_section_id) {

        const self = this

        return new Promise(function (resolve) {

            const request_body = {
                dedalo_get: 'records',
                table: ['objects', 'sets', 'pictures', 'immovable'],
                ar_fields: ['section_id', 'section_tipo'],
                sql_filter: `(images_data LIKE '%"${image_section_id}"%' OR identifying_images_data LIKE '%"${image_section_id}"%')`,
                limit: 1,
                order: 'section_id',
                count: false
            }
            data_manager.request({
                body: request_body
            })
                .then(function (response) {

                    let link = null

                    if (!response.result) {
                        console.error("Error on load_catalog_data");
                    } else {
                        const row = response.result && response.result[0]
                            ? response.result[0]
                            : null
                        if (row) {
                            const template = page.section_tipo_to_template(row.section_tipo)
                            const url = template + '/' + row.section_id

                            link = common.create_dom_element({
                                element_type: "a",
                                class_name: "link link_image_big",
                                href: url,
                                target: "_blank"
                            })
                            // icon eye_white
                            const eye_white = common.create_dom_element({
                                element_type: "img",
                                class_name: "eye_white",
                                src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_eye_white_border.svg',
                                parent: link
                            })
                        }
                    }

                    resolve(link)
                })
        })
    },//end load_image_linker



    /**
    * LOAD_CATALOG_DATA
    * @return array of objects
    */
    load_catalog_data: function (options) {

        const self = this

        // options
        const table = options.table
        const limit = options.limit || self.carousel_items_limit

        return new Promise(function (resolve) {

            const filter = (table.indexOf('immovable') !== -1)
                ? null
                : "outstanding = 'si'"

            const request_body = {
                dedalo_get: 'records',
                table: table,
                ar_fields: ['*'],
                sql_filter: filter,
                limit: limit,
                count: false,
                order: 'RAND()'
            }
            data_manager.request({
                body: request_body
            })
                .then(function (response) {

                    const data = (response.result)
                        ? page.parse_list_data(response.result)
                        : false

                    if (!response.result) {
                        console.error("Error on load_catalog_data");
                    }

                    resolve(data)
                })
        })
    },//end load_catalog_data



    /**
    * RENDER_CATALOG_CAROUSEL
    * @return promise : DOM object (document fragment)
    */
    render_catalog_carousel: function (options) {

        const self = this

        // options
        const rows = options.rows
        const title = options.title
        const color = options.color || 'qdp_purple'

        const mode = 'list' // list | list_images (masonry)

        const fragment = new DocumentFragment()

        // spacer
        const spacer = common.create_dom_element({
            element_type: 'div',
            class_name: 'spacer',
            parent: fragment
        })

        // wrapper
        const carousel_wrapper = common.create_dom_element({
            element_type: 'section',
            class_name: 'carousel ',
            parent: fragment
        })

        // title
        const h1 = common.create_dom_element({
            element_type: 'h1',
            inner_html: title,
            parent: carousel_wrapper
        })

        // reel container
        const carousel_reel = common.create_dom_element({
            element_type: 'div',
            class_name: 'reel',
            parent: carousel_wrapper
        })

        // items inside reel
        for (let i = 0; i < rows.length; i++) {

            const row = rows[i]

            const row_node = common.create_dom_element({
                element_type: 'article',
                class_name: 'loading row_node grid-item ' + row.tpl,
                parent: carousel_reel
            })

            const item_fragment = item_list_row.render_item(row, mode, row_node)
            if (item_fragment) {
                row_node.appendChild(item_fragment)
            }
        }

        // button_show_more
        const button_show_more = common.create_dom_element({
            element_type: 'input',
            type: 'button',
            value: tstring.view_more,
            class_name: 'button_show_more ' + color,
            parent: carousel_wrapper
        })
        button_show_more.addEventListener("click", function (e) {
            window.location.href = BASE_LINKS + 'catalog'
        })


        return fragment
    },//end render_catalog_carousel



    /**
    * RENDER_OUTSTANDING
    * @return
    */
    render_outstanding: function (options) {

        const self = this

        // options
        // const rows = options.rows

        const fragment = new DocumentFragment()

        // spacer
        const spacer = common.create_dom_element({
            element_type: 'div',
            class_name: 'spacer',
            parent: fragment
        })

        // wrapper
        const wrapper_outstanding = common.create_dom_element({
            element_type: 'section',
            class_name: 'wrapper_outstanding',
            parent: fragment
        })

        const url = self.background_image

        build_node(wrapper_outstanding, url)

        // iterate and select only horizontal images
        // const rows_length = rows.length
        // for (let i = 0; i < rows_length; i++) {

        // 	const img = document.createElement('img');
        // 	img.addEventListener('load', activate_image)
        // 	img.src = rows[i].image_url_thumb
        // 	img.big = rows[i].image_url + '/home_big'

        // 	break;
        // }

        // activate image
        // function activate_image(event) {

        // 	const width = this.width;
        // 	const height= this.height;

        // 	if (width > height) {

        // 		const url = this.big
        // 		build_node(wrapper_outstanding, url)
        // 	}
        // }

        function build_node(wrapper_outstanding, url) {

            const image_container = common.create_dom_element({
                element_type: 'div',
                class_name: 'image_container',
                parent: wrapper_outstanding
            })

            const body_text = common.create_dom_element({
                element_type: 'div',
                class_name: 'body_text',
                inner_html: self.row.body,
                parent: image_container
            })

            // button_show_more
            const button_show_more = common.create_dom_element({
                element_type: 'input',
                type: 'button',
                value: tstring.view_more,
                class_name: 'button_show_more',
                parent: body_text
            })
            button_show_more.addEventListener("click", function (e) {
                window.location.href = BASE_LINKS + 'project'
            })

            const image_node = common.create_dom_element({
                element_type: 'img',
                class_name: 'image_outstanding',
                src: url,
                parent: image_container
            })
            image_node.loading = 'lazy'
        }


        return fragment
    },//end render_outstanding



}//end main_home
