/*global tstring, page_globals, SHOW_DEBUG, item_list_row, common, page, forms, document, DocumentFragment, tstring, console */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var item_list_row = {


    mode: null,
    row: null,
    row_node: null,


    render_item: function (row, mode, row_node) {

        const self = this

        self.mode = mode
        self.row = row
        self.row_node = row_node

        let result = null
        switch (mode) {
            case 'list':
                result = self.draw_item(row)
                break;
            case 'list_images': // masonry
                result = self.draw_list_images_item(row)
                break;
        }

        return result
    },//end render_item



    draw_item: function (row) {

        const self = this

        const fragment = new DocumentFragment()
        if (!row) {
            return fragment
        }

        // item_wrapper
        const item_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "item_wrapper",
            parent: fragment
        })

        // image_wrapper
        const image_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "image_wrapper",
            parent: item_wrapper
        })

        // img
        const thumb_url = row.thumb_url
        const image_url = row.image_url

        const item_image = common.create_dom_element({
            element_type: "img",
            src: thumb_url,
            parent: image_wrapper
        })
        item_image.loading = "lazy"
        self.goto_item_event(item_image, row.tpl, row.section_id)

        // calculate bg color and load hi res image
        page.build_image_with_background_color(thumb_url, image_wrapper)
            .then(function (response) {

                const img = response.img // DOM node
                const format = response.format // vertical | horizontal
                const bg_color_rgb = response.bg_color_rgb

                // set item_wrapper format class vertical / horizontal
                item_wrapper.classList.add(format)

                // set image node style to loaded (activate opacity transition)
                item_image.classList.add('loaded')

                // load high resolution image
                item_image.src = image_url
            })


        // info_wrapper
        const info_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "info_wrapper",
            parent: item_wrapper
        })

        // name (name - typology)
        if (row.section_tipo !== 'qdp100' && row.section_tipo !== 'qdp336') {
            const ar_title_nodes = []
            for (let i = 0; i < row.name_combi.length; i++) {

                const title_text = row.name_combi[i].label
                const title_node = common.create_dom_element({
                    element_type: "h1",
                    class_name: "title " + row.tpl,
                    inner_html: title_text,
                    title: tstring.name || "Name"
                })
                // title_node.addEventListener("click", function(){
                // 	const url = page_globals.__WEB_ROOT_WEB__ + '/thesaurus/' + 'ts1_' + row.name_combi[i].value
                // 	window.open(url)
                // })
                ar_title_nodes.push(title_node)
            }
            const title_container = common.create_dom_element({
                element_type: "div",
                class_name: "title_container",
                parent: info_wrapper
            })
            for (let i = 0; i < ar_title_nodes.length; i++) {

                title_container.appendChild(ar_title_nodes[i])

                if (ar_title_nodes[i + 1]) {
                    const separator = common.create_dom_element({
                        element_type: "span",
                        text_content: " - ",
                        parent: title_container
                    })
                }
            }
        }
        // const title_text = row.name + (row.typology && row.typology.length>0 ? (". "+row.typology) : "");

        // title (fotografía / immovable)
        if (row.title && row.title.length > 0) {
            if (row.section_tipo === 'qdp100' || row.section_tipo === 'qdp336') {
                // title container
                const title_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "title_container",
                    parent: info_wrapper
                })
                // title h1
                const title_text = row.title
                const title_node = common.create_dom_element({
                    element_type: "h1",
                    class_name: "title name",
                    inner_html: title_text,
                    title: tstring.title || "Título",
                    parent: title_container
                })
            }
        }

        // typology
        // if (row.typology) {
        // 	const ar_typology_nodes = []
        // 	for (let i = 0; i < row.typology_combi.length; i++) {

        // 		const typology_text = row.typology_combi[i].label
        // 		const typology_node = common.create_dom_element({
        // 			element_type	: "a",
        // 			class_name		: "typology",
        // 			inner_html		: typology_text,
        // 			title			: tstring.typology || "typology"
        // 			// parent			: info_wrapper
        // 		})
        // 		typology_node.addEventListener("click", function(){
        // 			const url = page_globals.__WEB_ROOT_WEB__ + '/thesaurus/' + 'ts1_' + row.typology_combi[i].value
        // 			window.open(url)
        // 		})
        // 		ar_typology_nodes.push(typology_node)
        // 	}
        // 	const typology_container = common.create_dom_element({
        // 		element_type	: "div",
        // 		class_name		: "typology_container",
        // 		parent			: info_wrapper
        // 	})
        // 	for (let i = 0; i < ar_typology_nodes.length; i++) {

        // 		typology_container.appendChild(ar_typology_nodes[i])

        // 		if (ar_typology_nodes[i+1]) {
        // 			const separator = common.create_dom_element({
        // 				element_type	: "span",
        // 				text_content	: " - ",
        // 				parent			: typology_container
        // 			})
        // 		}
        // 	}
        // }

        // collection
        if (row.collection) {
            const collection_node = common.create_dom_element({
                element_type: "div",
                class_name: "collection",
                inner_html: row.collection,
                title: tstring.collection || "Collection",
                parent: info_wrapper
            })
        }

        // fund
        // if (row.fund) {
        // 	if(row.section_tipo==='qdp1' || row.section_tipo==='qdp100') {
        // 		const fund_node = common.create_dom_element({
        // 			element_type	: "div",
        // 			class_name		: "fund",
        // 			inner_html		: row.fund,
        // 			title			: tstring.fund || "fund",
        // 			parent			: info_wrapper
        // 		})
        // 	}
        // }

        // dating
        if (row.dating) {
            if (row.section_tipo === 'qdp336') {
                // no date is showed for immovable
            } else {
                const clean_dating = row.dating.join(' - ')
                const dating_node = common.create_dom_element({
                    element_type: "div",
                    class_name: "dating",
                    inner_html: clean_dating,
                    title: tstring.dating || "Dating",
                    parent: info_wrapper
                })
            }
        }

        // description (exclude immovable qdp336)
        // if (row.description && row.section_tipo!=="qdp336") {
        // 	const description_node = common.create_dom_element({
        // 		element_type	: "div",
        // 		class_name		: "description",
        // 		inner_html		: row.description,
        // 		title			: tstring.description || "Description",
        // 		parent			: info_wrapper
        // 	})
        // }

        // items (sets only)
        if (row.items && row.items.length > 0) {
            const items_content_head = common.create_dom_element({
                element_type: "div",
                class_name: "content_head set_items",
                inner_html: tstring.items || "Items",
                parent: info_wrapper
            })
            let items_content_body
            items_content_head.addEventListener("click", function () {
                items_content_body = items_content_body || build_items_content_body()
                if (this.classList.contains("opened")) {
                    this.classList.remove("opened")
                    items_content_body.classList.add("hide")
                } else {
                    this.classList.add("opened")
                    items_content_body.classList.remove("hide")
                }
            })
            const build_items_content_body = function () {
                const items_content_body = common.create_dom_element({
                    element_type: "div",
                    class_name: "content_body set_items hide",
                    parent: info_wrapper
                })
                for (let t = 0; t < row.items.length; t++) {

                    const item = row.items[t]
                    const thumb_url = item.thumb_url
                    const title = item.name
                        ? item.name.join(" - ")
                        : (item.title || item.section_id)

                    // item_wrapper
                    const item_wrapper = common.create_dom_element({
                        element_type: "div",
                        class_name: "item_wrapper",
                        parent: items_content_body
                    })

                    // image
                    const image_wrapper = common.create_dom_element({
                        element_type: "div",
                        class_name: "image_wrapper",
                        parent: item_wrapper
                    })
                    image_wrapper.addEventListener("click", function () {
                        const url = page_globals.__WEB_ROOT_WEB__ + '/' + item.tpl + '/' + item.section_id
                        window.open(url)
                    })
                    const item_image = common.create_dom_element({
                        element_type: "img",
                        parent: image_wrapper
                    })
                    page.build_image_with_background_color(thumb_url, image_wrapper)
                        .then(function (response) {

                            const img = response.img // DOM node
                            const format = response.format // vertical | horizontal
                            const bg_color_rgb = response.bg_color_rgb

                            // set image node style to loaded (activate opacity transition)
                            item_image.classList.add('loaded')

                            // load image
                            item_image.src = thumb_url
                        })

                    // text_title
                    const text_title = common.create_dom_element({
                        element_type: "div",
                        class_name: "text_title",
                        inner_html: title,
                        parent: item_wrapper
                    })
                }
                return items_content_body
            }
        }

        // sets (objects only)
        if (row.sets && row.sets.length > 0) {
            const items_content_head = common.create_dom_element({
                element_type: "div",
                class_name: "content_head set_items",
                inner_html: tstring.sets || "Conjuntos",
                parent: info_wrapper
            })
            let items_content_body = null
            items_content_head.addEventListener("click", function () {
                items_content_body = items_content_body || build_items_content_body()
                if (this.classList.contains("opened")) {
                    this.classList.remove("opened")
                    items_content_body.classList.add("hide")
                } else {
                    this.classList.add("opened")
                    items_content_body.classList.remove("hide")
                }
            })
            const build_items_content_body = function () {
                const items_content_body = common.create_dom_element({
                    element_type: "div",
                    class_name: "content_body set_items hide",
                    parent: info_wrapper
                })
                for (let t = 0; t < row.sets.length; t++) {

                    const item = row.sets[t]
                    const thumb_url = item.thumb_url
                    const title = item.name
                        ? item.name
                        : (item.title || item.section_id)

                    // item_wrapper
                    const item_wrapper = common.create_dom_element({
                        element_type: "div",
                        class_name: "item_wrapper",
                        parent: items_content_body
                    })

                    // image
                    const image_wrapper = common.create_dom_element({
                        element_type: "div",
                        class_name: "image_wrapper",
                        parent: item_wrapper
                    })
                    image_wrapper.addEventListener("click", function () {
                        const url = page_globals.__WEB_ROOT_WEB__ + '/set/' + item.section_id
                        window.open(url)
                    })
                    const item_image = common.create_dom_element({
                        element_type: "img",
                        parent: image_wrapper
                    })
                    page.build_image_with_background_color(thumb_url, image_wrapper)
                        .then(function (response) {

                            const img = response.img // DOM node
                            const format = response.format // vertical | horizontal
                            const bg_color_rgb = response.bg_color_rgb

                            // set image node style to loaded (activate opacity transition)
                            item_image.classList.add('loaded')

                            // load image
                            item_image.src = thumb_url
                        })

                    // text_title
                    const text_title = common.create_dom_element({
                        element_type: "div",
                        class_name: "text_title",
                        inner_html: title,
                        parent: item_wrapper
                    })
                }
                return items_content_body
            }
        }


        return fragment
    },//end draw_item



    /**
    * DRAW_LIST_IMAGES_ITEM
    * @return document fragment
    */
    draw_list_images_item: function (row) {

        const self = this

        const fragment = new DocumentFragment()
        if (!row) {
            return fragment
        }

        // image_wrapper
        const image_wrapper = self.row_node

        // img
        const thumb_url = row.thumb_url
        const image_url = row.image_url

        const item_image = common.create_dom_element({
            element_type: "img",
            src: thumb_url,
            parent: fragment
        })
        self.goto_item_event(item_image, row.tpl, row.section_id)

        // calculate bg color and load hi res image
        page.build_image_with_background_color(thumb_url, image_wrapper)
            .then(function (response) {

                const img = response.img // DOM node
                const format = response.format // vertical | horizontal
                const bg_color_rgb = response.bg_color_rgb

                // set item_wrapper format class vertical / horizontal
                item_image.classList.add(format)

                // set image node style to loaded (activate opacity transition)
                item_image.classList.add('loaded')

                // added later to load hi-res image (after masonry layout done for example) on rendered event
                item_image.image_url = image_url
            })


        return item_image
    },//end draw_item



    /**
    * GOTO_ITEM_EVENT
    * @return bool true
    */
    goto_item_event: function (image_wrapper, tpl, section_id) {

        image_wrapper.addEventListener("click", function () {

            // iframe way
            // const page_wrapper = document.getElementById("page-wrapper")

            // const detail_wrapper = common.create_dom_element({
            // 	element_type	: "div",
            // 	class_name		: "detail_wrapper",
            // 	parent			: document.body
            // })

            // const detail_iframe = common.create_dom_element({
            // 	element_type	: "iframe",
            // 	class_name		: "detail_iframe hide_opacity",
            // 	parent			: detail_wrapper
            // })
            // detail_iframe.addEventListener("load", function(){

            // 	// hide page_wrapper
            // 		page_wrapper.classList.add("hide")

            // 	// add close button
            // 		const detail_close_button = common.create_dom_element({
            // 			element_type	: "div",
            // 			class_name		: "detail_close_button",
            // 			parent			: detail_wrapper
            // 		})
            // 		detail_close_button.addEventListener("click", function(){
            // 			close()
            // 		})

            // 		function close() {
            // 			// show page_wrapper
            // 			page_wrapper.classList.remove("hide")
            // 			detail_wrapper.remove();
            // 			// window.location.href = previous_url
            // 			history.pushState(state, title, previous_url)
            // 		}

            // 		window.addEventListener('popstate', hashHandler, false);
            // 		function hashHandler(e) {
            // 			close()
            // 		}

            // 	// browser navigation update
            // 		const previous_url = window.location.href
            // 		const state = { 'section_id': section_id, 'tpl': tpl }
            // 		const title = ''
            // 		const url = page_globals.__WEB_ROOT_WEB__ + '/' + tpl + '/' + section_id // 'hello-world.html'
            // 		history.pushState(state, title, url)

            // 	// show iframe content
            // 		this.classList.remove("hide_opacity")
            // })
            // detail_iframe.src = page_globals.__WEB_ROOT_WEB__ + '/' + tpl + '/' + section_id


            // navigation way
            const url = page_globals.__WEB_ROOT_WEB__ + '/' + tpl + '/' + section_id
            window.open(url)
        })

        return true
    },//end goto_item_event



}//end item_list_row
