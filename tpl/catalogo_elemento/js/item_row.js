/*global tstring, page_globals, SHOW_DEBUG, item, common, page, forms, document, DocumentFragment, tstring, console, tree_factory, map_factory */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var item_row = {



    filmstrip_items: [],



    draw_item: function (row, format, caller) {

        const self = this

        const fragment = new DocumentFragment();
        if (!row) {
            return fragment
        }

        // filmstrip items
        const identifying_images = row.identifying_images_combi || []
        const images = row.images_combi || []
        const audiovisuals = row.audiovisuals_combi || []

        const all_items = [].concat(identifying_images, images)
        self.filmstrip_items = all_items

        // item_wrapper
        const item_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "item_wrapper " + format,
            parent: fragment
        })


        // image_wrapper
        const image_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "image_wrapper",
            parent: item_wrapper
        })
        image_wrapper.addEventListener('contextmenu', event => event.preventDefault());

        if (row.images_combi.length > 0 || row.identifying_images_combi.length > 1 || row.audiovisuals.length > 0) {
            image_wrapper.classList.add("with_filmstrip")
        }

        // img
        const image_url = row.image_url
        const thumb_url = row.thumb_url

        // build image with backgroundColorThief color
        page.build_image_with_background_color(thumb_url, image_wrapper, null, 1)
            .then(function (response) {

                const img = response.img

                // unactive. Disable user pointer events to prevent drag image
                img.classList.add("unactive")

                // set item_wrapper format class vartical / horizontal
                // item_wrapper.classList.add(response.format)

                // append thumb image
                image_wrapper.appendChild(img)

                // activate hi-res viewer on click
                img.addEventListener("click", self.activate_hires_viewer)

                // const add_class = (img.height > img.width) ? 'vertical' : 'horizontal'
                // item_wrapper.classList.add(add_class)

                // const is_vertical = img.height > img.width
                // console.log("is_vertical:",is_vertical, " img.height", img.height, " img.width", img.width);
                // console.log("is_vertical:",is_vertical, " img.clientHeight", img.clientHeight, " img.clientWidth", img.clientWidth);

                // event publish image_ready
                event_manager.publish('image_ready', img)

                // load high resolution image
                // img.src = image_url
            })

        const event_token = event_manager.subscribe('image_ready', load_hi_res)
        function load_hi_res(img) {

            // replace thumb with mid res image
            self.load_image(image_url, img)

            // build_filmstrip
            if (self.filmstrip_items.length > 1) {

                // data. add callback properties to filmstrip_items
                const data = self.filmstrip_items.map(function (item) {

                    if (item.type === 'image') {

                        item.selected = null

                    } else if (item.type === 'audiovisual') {

                        // item.selected = function(image_big){
                        // 	self.open_player({
                        // 		src			: item.url_av,
                        // 		poster		: item.url,
                        // 		container	: image_wrapper
                        // 	})
                        // 	.then(function(response){
                        // 		console.log("response:",response);
                        // 		response.player.play()
                        // 	})
                        // }
                    }

                    return item
                })

                self.build_filmstrip({
                    data: data,
                    img: img
                })
                    .then(function (filmstrip_node) {
                        image_wrapper.appendChild(filmstrip_node)
                    })
            }

            // image_buttons bar
            const image_buttons = common.create_dom_element({
                element_type: "div",
                class_name: "image_buttons",
                parent: image_wrapper
            })
            // button_image_footer
            // const button_image_footer = common.create_dom_element({
            // 	element_type	: "div",
            // 	class_name		: "button_image_footer hide",
            // 	title			: "View info",
            // 	parent			: image_buttons
            // })
            // caller.button_image_footer = button_image_footer
            // footer_info
            const footer_info = common.create_dom_element({
                element_type: "div",
                class_name: "footer_info hide",
                parent: image_buttons
            })
            caller.footer_info = footer_info

            // button_hires
            const button_hires = common.create_dom_element({
                element_type: "div",
                class_name: "button_hires",
                title: tstring.view_hires || "View high resolution",
                parent: image_buttons
            })
            button_hires.addEventListener("click", function () {
                // activate hi-res viewer on click
                self.activate_hires_viewer({
                    target: img
                })
            })
            // button_share
            const button_share = common.create_dom_element({
                element_type: "div",
                class_name: "button_share",
                title: tstring.share || "Share",
                parent: image_buttons
            })
            button_share.addEventListener("click", function () {
                // open dialog window
                page.render_share_url_dialog(this)
            })
            // button_download (not for pictures items -qdp100-)
            if (row.section_tipo !== "qdp100") {
                const button_download = common.create_dom_element({
                    element_type: "div",
                    class_name: "button_download",
                    title: tstring.download || "Download",
                    parent: image_buttons
                })
                button_download.addEventListener("click", function () {
                    const file_name = page_globals.WEB_ENTITY + '_' + img.src.substring(img.src.lastIndexOf('/') + 1);
                    const image_url = img.src + '/original' // row.image_url_hires

                    const callback = function () {
                        return common.download_item(image_url, file_name)
                    }
                    page.render_download_license(callback)
                        .then(function (download_license_wrapper) {
                            if (download_license_wrapper) {
                                document.body.appendChild(download_license_wrapper)
                            }
                        })
                })
            }
            // button_zoom
            const button_zoom = common.create_dom_element({
                element_type: "div",
                class_name: "button_zoom",
                title: tstring.zoom || "Zoom",
                parent: image_buttons
            })
            button_zoom.addEventListener("click", function () {

                image_wrapper.classList.toggle("zomm_active")
                if (image_wrapper.classList.contains("zomm_active")) {
                    window.scrollTo(0, 0);
                }

                // if format is vertical, change it to horizontal
                if (item_wrapper.classList.contains("vertical")) {
                    item_wrapper.classList.remove("vertical")
                    item_wrapper.classList.add("horizontal")
                } else if (format === 'vertical') {
                    // restore vertical only for original vertical format
                    item_wrapper.classList.add("vertical")
                    item_wrapper.classList.remove("horizontal")
                }
            })

            event_manager.publish('image_selected', {
                item: row.identifying_images_combi[0]
            })

            // remove subscription
            event_manager.unsubscribe(event_token)
        }

        // info_wrapper
        const info_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "info_wrapper container ",
            parent: item_wrapper
        })

        const block1 = common.create_dom_element({
            element_type: "div",
            class_name: "block1 ", //+ format,
            parent: info_wrapper
        })

        const block2 = common.create_dom_element({
            element_type: "div",
            class_name: "block2 ",
            parent: info_wrapper
        })

        // title (fotografía / immovable)
        if (row.title && row.title.length > 0) {
            // title container
            const title_container = common.create_dom_element({
                element_type: "div",
                id: 'title_container',
                class_name: "title_container",
                parent: block1
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

        // name (name - typology)
        const ar_title_nodes = []
        for (let i = 0; i < row.name_combi.length; i++) {

            const title_text = row.name_combi[i].label
            const title_node = common.create_dom_element({
                element_type: "h1",
                class_name: "title " + row.tpl,
                inner_html: title_text,
                title: tstring.name || "Name"
            })
            title_node.addEventListener("click", function () {
                const url = page_globals.__WEB_ROOT_WEB__ + '/thesaurus/' + 'ts1_' + row.name_combi[i].value
                window.open(url)
            })
            ar_title_nodes.push(title_node)
        }
        const title_container = common.create_dom_element({
            element_type: "div",
            id: 'title_container',
            class_name: "title_container",
            parent: block1
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

        // typology
        if (row.typology && row.typology.length > 0) {
            const ar_typology_nodes = []
            for (let i = 0; i < row.typology_combi.length; i++) {

                const typology_text = row.typology_combi[i].label
                const typology_node = common.create_dom_element({
                    element_type: "a",
                    class_name: "typology",
                    inner_html: typology_text,
                    title: tstring.typology || "typology"
                })
                typology_node.addEventListener("click", function () {
                    const url = page_globals.__WEB_ROOT_WEB__ + '/thesaurus/' + 'ts1_' + row.typology_combi[i].value
                    window.open(url)
                })
                ar_typology_nodes.push(typology_node)
            }
            const typology_container = common.create_dom_element({
                element_type: "div",
                class_name: "typology_container",
                parent: block1
            })
            for (let i = 0; i < ar_typology_nodes.length; i++) {

                typology_container.appendChild(ar_typology_nodes[i])

                if (ar_typology_nodes[i + 1]) {
                    const separator = common.create_dom_element({
                        element_type: "span",
                        text_content: " - ",
                        parent: typology_container
                    })
                }
            }
        }

        // block1_1
        const block1_1 = common.create_dom_element({
            element_type: "div",
            class_name: "block1_1 ",
            parent: block1
        })

        // id
        const id_container = common.create_dom_element({
            element_type: "div",
            class_name: "grid_label",
            text_content: "ID",
            parent: block1_1
        })
        const id_node = common.create_dom_element({
            element_type: "div",
            class_name: "id",
            inner_html: row.section_id,
            title: tstring.id || "ID",
            parent: block1_1
        })

        // collection
        if (row.collection) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.collection || "Collection",
                parent: block1_1
            })
            const collection_node = common.create_dom_element({
                element_type: "div",
                class_name: "collection",
                inner_html: row.collection,
                title: tstring.collection || "Collection",
                parent: block1_1
            })
        }

        // source (fuente de ingreso)
        if (row.source_combi.length > 0) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.source || "source",
                parent: block1_1
            })
            const source_text = row.source_combi.join(", ")
            const source_node = common.create_dom_element({
                element_type: "div",
                class_name: "source",
                inner_html: source_text,
                title: tstring.source || "source",
                parent: block1_1
            })
        }

        // dating
        if (row.dating) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.dating || "Dating",
                parent: block1_1
            })
            const clean_dating = row.dating.join(' - ')
            const dating_node = common.create_dom_element({
                element_type: "div",
                class_name: "dating",
                inner_html: clean_dating,
                title: tstring.dating || "Dating",
                parent: block1_1
            })
        }

        // author
        if (row.author) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.author || "Author",
                parent: block1_1
            })
            const clean_author = row.author.join(', ')
            const author_node = common.create_dom_element({
                element_type: "div",
                class_name: "author",
                inner_html: clean_author,
                title: tstring.author || "Author",
                parent: block1_1
            })
        }

        // trademark
        if (row.trademark) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.trademark || "Trademark",
                parent: block1_1
            })
            const clean_trademark = row.trademark
            const trademark_node = common.create_dom_element({
                element_type: "div",
                class_name: "trademark",
                inner_html: clean_trademark,
                title: tstring.trademark || "Trademark",
                parent: block1_1
            })
        }

        // manufacturer
        if (row.manufacturer) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.manufacturer || "Manufacturer",
                parent: block1_1
            })
            const clean_manufacturer = row.manufacturer.join(", ")
            const manufacturer_node = common.create_dom_element({
                element_type: "div",
                class_name: "manufacturer",
                inner_html: clean_manufacturer,
                title: tstring.manufacturer || "Manufacturer",
                parent: block1_1
            })
        }

        // fund
        // if (row.fund) {
        // 	const fund_node = common.create_dom_element({
        // 		element_type	: "div",
        // 		class_name		: "fund",
        // 		inner_html		: row.fund,
        // 		title			: tstring.fund || "fund",
        // 		parent			: info_wrapper
        // 	})
        // }

        // description
        if (row.description) {
            common.create_dom_element({
                element_type: "div",
                class_name: "grid_label",
                text_content: tstring.description || "Description",
                parent: block1_1
            })
            const description_node = common.create_dom_element({
                element_type: "div",
                class_name: "description",
                inner_html: row.description,
                title: tstring.description || "Description",
                parent: block1_1
            })
        }

        // interpretation
        if (row.interpretation) {
            const interpretation_node = common.create_dom_element({
                element_type: "div",
                class_name: "interpretation",
                inner_html: row.interpretation,
                title: tstring.interpretation || "Interpretation",
                parent: block1
            })
            // if (row.interpretation.length>250) {
            // 	interpretation_node.classList.add("fade")

            // 	interpretation_node.addEventListener("mousedown", function(){
            // 		this.classList.remove("fade")
            // 	})
            // 	interpretation_node.addEventListener("dblclick", function(){
            // 		this.classList.add("fade")
            // 	})
            // }
        }

        // recovery_place
        // if (row.recovery_place && row.recovery_place.length>1){
        // 	const recovery_place_node = common.create_dom_element({
        // 		element_type	: "div",
        // 		class_name		: "recovery_place",
        // 		inner_html		: row.recovery_place,
        // 		title			: tstring.recovery_place || "recovery_place",
        // 		parent			: info_wrapper
        // 	})
        // }

        // inscriptions
        // if (row.inscriptions && row.inscriptions.length>1){
        // 	block2.appendChild(
        // 		self.build_header_content_block('inscriptions', (tstring.inscriptions || "Inscriptions"), false, function(items_content_body){
        // 			// body content
        // 			const inscriptions_node = common.create_dom_element({
        // 				element_type	: "div",
        // 				class_name		: "",
        // 				inner_html		: row.inscriptions,
        // 				parent			: items_content_body
        // 			})
        // 		})
        // 	)
        // }

        // audiovisuals (!) moved to filmstrip
        if (audiovisuals && audiovisuals.length > 0) {
            block2.appendChild(
                self.build_header_content_block('audiovisual', (tstring.audiovisuals || "Audiovisuals"), true, function (items_content_body) {
                    // body content
                    const audiovisuals_container = common.create_dom_element({
                        element_type: "div",
                        class_name: "audiovisuals"
                    })
                    self.build_audiovisuals_list(audiovisuals, audiovisuals_container)

                    items_content_body.appendChild(audiovisuals_container)
                    self.click_first_link(items_content_body, "hide")
                })
            )
        }

        // documents
        if (row.documents && row.documents.length > 0) {
            block2.appendChild(
                self.build_header_content_block('documents', (tstring.documents || "Documents"), true, function (items_content_body) {
                    // body content

                    const data = row.documents
                    for (let i = 0; i < data.length; i++) {
                        const pdf_link = common.create_dom_element({
                            element_type: "a",
                            class_name: "pdf_link",
                            href: data[i].url,
                            title: (tstring.view_pdf || "View pdf") + " " + data[i].label,
                            inner_html: data[i].title,
                            parent: items_content_body
                        })
                        pdf_link.setAttribute("target", "_blank")
                        const img = common.create_dom_element({
                            element_type: "img",
                            class_name: "pdf",
                            src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_pdf.svg',
                            parent: pdf_link
                        })
                    }
                })
            )
        }

        // measures
        if (row.measures && row.measures.length > 0) {
            block2.appendChild(
                self.build_header_content_block('measures', (tstring.measures || "Measures"), false, function (items_content_body) {
                    // body content
                    // container
                    const measures_container = common.create_dom_element({
                        element_type: "div",
                        class_name: "measures_container",
                        title: tstring.measures || "Medidas",
                        parent: items_content_body
                    })
                    // header element
                    common.create_dom_element({
                        element_type: "div",
                        class_name: "mesure_header",
                        inner_html: tstring.elemento || "Elemento",
                        parent: measures_container
                    })
                    // header type
                    common.create_dom_element({
                        element_type: "div",
                        class_name: "mesure_header",
                        inner_html: tstring.medida || "Medida",
                        parent: measures_container
                    })
                    // header value
                    common.create_dom_element({
                        element_type: "div",
                        class_name: "mesure_header right",
                        inner_html: tstring.valor || "Valor",
                        parent: measures_container
                    })
                    // header unit
                    // common.create_dom_element({
                    // 	element_type	: "div",
                    // 	class_name		: "mesure_header",
                    // 	// inner_html		: tstring.unidad || "Unidad",
                    // 	parent			: measures_container
                    // })
                    for (let g = 0; g < row.measures.length; g++) {
                        const mobj = row.measures[g]
                        // element
                        common.create_dom_element({
                            element_type: "div",
                            class_name: "element",
                            inner_html: mobj.element || (tstring.principal || "Principal"),
                            parent: measures_container
                        })
                        // type
                        common.create_dom_element({
                            element_type: "div",
                            class_name: "type",
                            inner_html: mobj.type,
                            parent: measures_container
                        })
                        // value
                        common.create_dom_element({
                            element_type: "div",
                            class_name: "value",
                            inner_html: mobj.value,
                            parent: measures_container
                        })
                        // unit
                        common.create_dom_element({
                            element_type: "div",
                            class_name: "unit",
                            inner_html: mobj.unit,
                            parent: measures_container
                        })
                    }
                })
            )
        }

        // marks
        if (row.marks && row.marks.length > 0) {
            block2.appendChild(
                self.build_header_content_block('marks', (tstring.marks || "marks"), false, function (items_content_body) {
                    // body content
                    // container
                    const marks_container = common.create_dom_element({
                        element_type: "div",
                        class_name: "marks_container",
                        title: tstring.marks || "Marks",
                        parent: items_content_body
                    })

                    const row_header_node = common.create_dom_element({
                        element_type: "div",
                        class_name: "item_row mark_header_row",
                        parent: marks_container
                    })

                    // header inscription
                    common.create_dom_element({
                        element_type: "div",
                        class_name: "mark_header",
                        inner_html: tstring.inscription || "Inscription",
                        parent: row_header_node
                    })
                    // header position
                    common.create_dom_element({
                        element_type: "div",
                        class_name: "mark_header",
                        inner_html: tstring.position || "Position",
                        parent: row_header_node
                    })
                    // header images
                    common.create_dom_element({
                        element_type: "div",
                        class_name: "mark_header center",
                        inner_html: tstring.images || "Images",
                        parent: row_header_node
                    })
                    for (let g = 0; g < row.marks.length; g++) {

                        const mobj = row.marks[g]

                        const row_node = common.create_dom_element({
                            element_type: "div",
                            class_name: "item_row mark_row",
                            parent: marks_container
                        })

                        // inscription
                        common.create_dom_element({
                            element_type: "div",
                            class_name: "inscription",
                            inner_html: mobj.inscription,
                            parent: row_node
                        })
                        // position
                        if (mobj.position) {
                            const marks_position_container = common.create_dom_element({
                                element_type: "div",
                                class_name: "marks_position_container",
                                parent: row_node
                            })
                            for (let i = 0; i < mobj.position.length; i++) {
                                common.create_dom_element({
                                    element_type: "div",
                                    class_name: "position",
                                    inner_html: mobj.position[i],
                                    parent: marks_position_container
                                })
                            }
                        }
                        // images
                        if (mobj.images) {
                            const marks_images_container = common.create_dom_element({
                                element_type: "div",
                                class_name: "marks_images_container",
                                parent: row_node
                            })
                            for (let i = 0; i < mobj.images.length; i++) {
                                const img = common.create_dom_element({
                                    element_type: "img",
                                    class_name: "image",
                                    src: mobj.images[i],
                                    parent: marks_images_container
                                })
                                img.hires = mobj.images_hires[i]
                                // activate hi-res viewer on click
                                img.addEventListener("click", self.activate_hires_viewer)
                            }
                        }
                    }
                })
            )
        }

        // indexation (indexation_combi)
        if (row.indexation_combi.length > 0) {
            block2.appendChild(
                self.build_header_content_block('thematic', (tstring.indexation || "Indexation"), false, function (items_content_body) {
                    // body content
                    // current_relations_container
                    const current_relations_container = common.create_dom_element({
                        element_type: "div",
                        class_name: "relations_container"
                    })
                    const data = row.indexation_combi
                    for (let i = 0; i < data.length; i++) {
                        // build relations
                        const current_item = common.create_dom_element({
                            element_type: "a",
                            class_name: "open_relations",
                            inner_html: data[i].label,
                            parent: items_content_body
                        })
                        current_item.addEventListener("click", function () {
                            if (this.classList.contains("selected")) return
                            self.show_relations(this, current_relations_container, data[i], 'indexation')
                            page.selected(this, items_content_body)
                        })
                    }
                    items_content_body.appendChild(current_relations_container)
                    self.click_first_link(items_content_body, "hide")
                })
            )
        }

        // technique (technique_combi)
        if (row.technique_combi.length > 0) {
            block2.appendChild(
                self.build_header_content_block('technique', (tstring.technique || "Technique"), false, function (items_content_body) {
                    // body content
                    // current_relations_container
                    const current_relations_container = common.create_dom_element({
                        element_type: "div",
                        class_name: "relations_container"
                    })
                    const data = row.technique_combi
                    for (let i = 0; i < data.length; i++) {
                        // build relations
                        const current_item = common.create_dom_element({
                            element_type: "a",
                            class_name: "open_relations",
                            inner_html: data[i].label,
                            parent: items_content_body
                        })
                        current_item.addEventListener("click", function () {
                            if (this.classList.contains("selected")) return
                            page.selected(this, items_content_body)
                            self.show_relations(this, current_relations_container, data[i], 'technique')
                        })
                    }
                    items_content_body.appendChild(current_relations_container)
                    self.click_first_link(items_content_body, "hide")
                })
            )
        }

        // material (material_combi)
        if (row.material_combi.length > 0) {
            block2.appendChild(
                self.build_header_content_block('material', (tstring.material || "Material"), false, function (items_content_body) {
                    // body content
                    // current_relations_container
                    const current_relations_container = common.create_dom_element({
                        element_type: "div",
                        class_name: "relations_container",
                    })
                    const data = row.material_combi
                    for (let i = 0; i < data.length; i++) {
                        // build relations
                        const current_item = common.create_dom_element({
                            element_type: "a",
                            class_name: "open_relations",
                            inner_html: data[i].label,
                            parent: items_content_body
                        })
                        current_item.addEventListener("click", function () {
                            if (this.classList.contains("selected")) return
                            page.selected(this, items_content_body)
                            self.show_relations(this, current_relations_container, data[i], 'material')
                        })
                    }
                    items_content_body.appendChild(current_relations_container)
                    self.click_first_link(items_content_body, "hide")
                })
            )
        }

        // items (sets only)
        if (row.items && row.items.length > 0) {
            block2.appendChild(
                self.build_header_content_block('items', (tstring.items || "Items"), false, function (items_content_body) {
                    // body content
                    const data = row.items
                    for (let t = 0; t < data.length; t++) {

                        const item = data[t]
                        const thumb_url = item.thumb_url
                        const title = item.name
                            ? item.name.join(" - ")
                            : (item.title || item.section_id)

                        // item_wrapper
                        const item_wrapper = common.create_dom_element({
                            element_type: "div",
                            class_name: "set_item_wrapper",
                            parent: items_content_body
                        })

                        // image
                        const image_wrapper = common.create_dom_element({
                            element_type: "div",
                            class_name: "set_image_wrapper",
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

                                const img = response.img // dom node
                                const format = response.format // vertical | horinzontal
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
                })
            )
        }

        // sets (objects only)
        if (row.sets && row.sets.length > 0) {
            block2.appendChild(
                self.build_header_content_block('sets', (tstring.sets || "Sets"), false, function (items_content_body) {
                    // body content
                    const data = row.sets
                    for (let t = 0; t < data.length; t++) {

                        const item = data[t]
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

                                const img = response.img // dom node
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
                })
            )
        }

        // map
        // if (row.map) {

        // 	// subscribe events
        // 	const event_token = event_manager.subscribe('image_ready', load_map)
        // 	function load_map(img) {

        // 		event_manager.unsubscribe(event_token)

        // 		const map_container = common.create_dom_element({
        // 			element_type	: "div",
        // 			class_name		: "map",
        // 			parent			: info_wrapper
        // 		})

        // 		common.when_in_dom(map_container, function(){
        // 			// draw map
        // 			const map_data	= page.parse_map_data([row]) // prepares data to use in map
        // 			self.map		= self.map || new map_factory() // creates / get existing instance of map
        // 			self.map.init({
        // 				source_maps		: page.maps_config.source_maps,
        // 				map_position	: null,
        // 				map_container	: map_container,
        // 				popup_builder	: page.map_popup_builder,
        // 				popup_options	: page.maps_config.popup_options
        // 			})
        // 			.then(function(){
        // 				// parse data points
        // 				self.map.parse_data_to_map(map_data)
        // 				// .then(function(map_node){
        // 				// 	resolve(true)
        // 				// })
        // 			})
        // 		})
        // 	}
        // }

        // geolocation_data_geojson
        if (row.geolocation_data_geojson) {
            block2.appendChild(
                self.build_header_content_block('location', (tstring.location || "Location"), true, function (items_content_body) {

                    // recovery_place
                    if (row.recovery_place && row.recovery_place.length > 1) {
                        const recovery_place_node = common.create_dom_element({
                            element_type: "div",
                            class_name: "recovery_place",
                            inner_html: row.recovery_place,
                            title: tstring.recovery_place || "recovery_place",
                            parent: items_content_body
                        })
                    }

                    // subscribe events
                    const event_token = event_manager.subscribe('image_ready', load_map)
                    function load_map(img) {

                        event_manager.unsubscribe(event_token)

                        const map_container = common.create_dom_element({
                            element_type: "div",
                            class_name: "map",
                            parent: items_content_body
                        })
                        common.when_in_dom(map_container, function () {
                            // draw map
                            const map_data = page.parse_map_data([row]) // prepares data to use in map
                            self.map = self.map || new map_factory() // creates / get existing instance of map
                            self.map.init({
                                source_maps: page.maps_config.source_maps,
                                map_position: null,
                                map_container: map_container,
                                popup_builder: page.map_popup_builder,
                                popup_options: page.maps_config.popup_options
                            })
                                .then(function () {
                                    // parse data points
                                    self.map.parse_data_to_map(map_data)
                                })
                        })
                    }
                })
            )

            // // subscribe events
            // const event_token = event_manager.subscribe('image_ready', load_map)
            // function load_map(img) {

            // 	event_manager.unsubscribe(event_token)

            // 	const map_container = common.create_dom_element({
            // 		element_type	: "div",
            // 		class_name		: "map",
            // 		parent			: block1
            // 	})

            // 	common.when_in_dom(map_container, function(){
            // 		// draw map
            // 		const map_data	= page.parse_map_data([row]) // prepares data to use in map
            // 		self.map		= self.map || new map_factory() // creates / get existing instance of map
            // 		self.map.init({
            // 			source_maps		: page.maps_config.source_maps,
            // 			map_position	: null,
            // 			map_container	: map_container,
            // 			popup_builder	: page.map_popup_builder,
            // 			popup_options	: page.maps_config.popup_options
            // 		})
            // 		.then(function(){
            // 			// parse data points
            // 			self.map.parse_data_to_map(map_data)
            // 			// .then(function(map_node){
            // 			// 	resolve(true)
            // 			// })
            // 		})
            // 	})
            // }
        }

        return fragment
    },//end draw_item



    /**
    * ACTIVATE_HIRES_VIEWER
    */
    activate_hires_viewer: function (e) {

        const img = e.target

        // const hires_url = typeof img.hires!=="undefined" ? img.hires : img.src
        const hires_url = img.hires || (img.src + '/original')

        // iv-viewer. load hi-res viewer
        // const viewer = new ImageViewer(img, {
        // 	snapView : true
        // });

        // vieverjs
        const new_image = new Image();
        new_image.src = hires_url;

        const viewer = new Viewer(new_image, {
            // inline: true,
            viewed() {
                // viewer.zoomTo(1);
            },
            hidden: function () {
                viewer.destroy();
            },
            navbar: false,
            toolbar: {
                zoomIn: {
                    show: 2,
                    size: 'large'
                },
                zoomOut: {
                    show: 2,
                    size: 'large'
                },
                oneToOne: {
                    show: 2,
                    size: 'large'
                },
                reset: {
                    show: 2,
                    size: 'large'
                },
                prev: {
                    show: 0,
                    size: 'large',
                },
                play: {
                    show: 0,
                    size: 'large',
                },
                next: {
                    show: 0,
                    size: 'large',
                },
                rotateLeft: {
                    show: 2,
                    size: 'large'
                },
                rotateRight: {
                    show: 2,
                    size: 'large'
                },
                flipHorizontal: {
                    show: 2,
                    size: 'large'
                },
                flipVertical: {
                    show: 2,
                    size: 'large'
                },
            }
        });
        // new_image.click();
        viewer.show();

        // remove contextual menu on right click
        const viewer_el = document.querySelector('.viewer-container')
        viewer_el.addEventListener('contextmenu', event => event.preventDefault())


        return viewer
    },//end activate_hires_viewer



    /**
    * BUILD_HEADER_CONTENT_BLOCK
    */
    build_header_content_block: function (name, title, open, add_body) {

        const self = this

        const header_content_block = common.create_dom_element({
            element_type: "div",
            class_name: "header_content_block " + name
        })

        const items_content_head = common.create_dom_element({
            element_type: "div",
            class_name: "content_head set_items",
            inner_html: title,
            parent: header_content_block
        })
        items_content_head.addEventListener("click", function () {
            if (this.classList.contains("opened")) {
                this.classList.remove("opened")
                items_content_body.classList.add("hide")
            } else {
                this.classList.add("opened")
                items_content_body.classList.remove("hide")
            }
        })
        const items_content_body = common.create_dom_element({
            element_type: "div",
            class_name: "content_body set_items hide " + name,
            parent: header_content_block
        })

        add_body(items_content_body)

        if (open === true) {
            items_content_head.click()
        }

        return header_content_block
    },//end build_header_content_block



    /**
    * SHOW_RELATIONS
    * @return
    */
    show_relations: function (element, relations_container, data, type) {

        const self = this

        const term_id = data.value
        const label = data.label

        let table
        switch (type) {
            case 'technique':
                table = 'ts_technique';
                break
            case 'material':
                table = 'ts_material';
                break
            case 'indexation':
            default:
                table = page.ts_tables;
                break
        }

        const view_in_context = true


        // clean container
        while (relations_container.hasChildNodes()) {
            relations_container.removeChild(relations_container.lastChild);
        }
        // add spinner
        const spinner = common.spinner(relations_container);

        const js_promise = item.load_relations(term_id, table)
            .then(function (relations_data) {

                const row = relations_data && relations_data.length > 0
                    ? relations_data[0]
                    : null

                // render_relation_nodes using tree_factory instance
                self.tree = self.tree || new tree_factory()
                self.tree.init({
                    data: []
                })
                self.tree.render_relation_nodes(row, relations_container, self.tree, view_in_context, 100)
                    .then(function () {

                        // remove spinner on complete
                        spinner.remove()
                    })
            })

        return js_promise
    },//end show_relations



    /**
    * BUILD_FILMSTRIP
    * @return promise
    */
    build_filmstrip: function (options) {

        const self = this

        const data = options.data
        const img_big = options.img

        return new Promise(function (resolve) {

            // filmstrip_image_wrapper
            const filmstrip_image_wrapper = common.create_dom_element({
                element_type: "div",
                class_name: "filmstrip_image_wrapper"
            })

            const images_container = common.create_dom_element({
                element_type: "div",
                class_name: "images_container",
                parent: filmstrip_image_wrapper
            })

            // add scroll buttons if they are necessary
            common.when_in_dom(images_container, function () {

                if (images_container.scrollWidth <= images_container.clientWidth) {
                    return // scroll is unnecessary
                }

                // add scroll buttons and events

                // left button
                const left = common.create_dom_element({
                    element_type: "div",
                    class_name: "left hide",
                    parent: filmstrip_image_wrapper
                })
                left.addEventListener("click", function () {
                    self.scroll_filmstrip('left', images_container, filmstrip_image_wrapper)
                })

                // right button
                const right = common.create_dom_element({
                    element_type: "div",
                    class_name: "right",
                    parent: filmstrip_image_wrapper
                })
                right.addEventListener("click", function () {
                    self.scroll_filmstrip('right', images_container, filmstrip_image_wrapper)
                })

                // scroll event
                images_container.addEventListener('scroll', function (e) {

                    const pos = e.target.scrollLeft
                    const scrollWidth = e.target.scrollWidth
                    const offsetWidth = e.target.offsetWidth

                    if (pos === 0) {
                        if (!left.classList.contains('hide')) {
                            left.classList.add('hide')
                        }
                    } else {
                        if (left.classList.contains('hide')) {
                            left.classList.remove('hide')
                        }
                    }

                    if ((offsetWidth + pos) >= scrollWidth) {
                        if (!right.classList.contains('hide')) {
                            right.classList.add('hide')
                        }
                    } else {
                        if (right.classList.contains('hide')) {
                            right.classList.remove('hide')
                        }
                    }
                });
            })

            const all_promisses = []
            for (let i = 0; i < data.length; i++) {

                const item = data[i]


                const thumb_url = item.url_thumb
                const image_url = item.url
                const type = item.type // image | audiovisual

                // image_thumb
                const class_name = (i === 0) ? "image_thumb selected" : "image_thumb"
                const image_thumb = common.create_dom_element({
                    element_type: "div",
                    class_name: class_name + ' ' + type,
                    parent: images_container
                })

                // build image with backgroundColorThief color
                const current_promise = page.build_image_with_background_color(thumb_url, image_thumb, null, 1)
                    .then(function (response) {

                        const img = response.img

                        // set item_wrapper format class vertical / horizontal
                        // item_wrapper.classList.add(response.format)

                        // click event
                        image_thumb.addEventListener("click", function () {

                            event_manager.publish('image_selected', {
                                item: item
                            })

                            self.load_image(image_url, img_big)
                                .then(function () {

                                    const image_wrapper = filmstrip_image_wrapper.parentNode

                                    // video. remove player if exists
                                    const player_wrapper = image_wrapper.querySelector('.player_wrapper')
                                    if (player_wrapper) {
                                        player_wrapper.remove()
                                    }

                                    // select. activate element (css: selected)
                                    page.selected(image_thumb, filmstrip_image_wrapper)

                                    // image_wrapper . set play item info
                                    image_wrapper.classList.remove('image', 'audiovisual')
                                    image_wrapper.classList.add(type)

                                    // optional callback
                                    if (item.selected) {
                                        item.selected(img_big)
                                    }
                                })
                        })

                        // append thumb image
                        image_thumb.appendChild(img)
                    })
                all_promisses.push(current_promise)

            }//for (let i = 0; i < data.length; i++)

            // loaded all
            setTimeout(function () {
                filmstrip_image_wrapper.classList.add('loaded')
            }, 150)

            resolve(filmstrip_image_wrapper)
        })
    },//end build_filmstrip



    /**
    * LOAD_IMAGE
    * @return promise
    */
    load_image: function (image_url, img) {

        return new Promise(function (resolve) {

            img.classList.remove("loaded")

            img.addEventListener('load', handle_load, true)
            function handle_load() {
                img.removeEventListener('load', handle_load, true);
                resolve(img)
            }

            // force css opacity transition
            setTimeout(function () {
                img.src = image_url
            }, 150)

        })
    },//end load_image



    /**
    * SCROLL_FILMSTRIP
    * @return
    */
    scroll_filmstrip: function (direction, images_container) {

        const current_left_position = images_container.scrollLeft
        const total_width = images_container.offsetWidth
        const move = Math.floor(total_width / 2)

        const target_pos = (direction === 'left')
            ? current_left_position - move
            : current_left_position + move

        images_container.scroll({
            left: target_pos,
            behavior: 'smooth'
        })

        return true
    },//end scroll_filmstrip



    /**
    * BUILD_AUDIOVISUALS_LIST
    */
    build_audiovisuals_list: function (audiovisuals, item_wrapper) {

        const self = this

        // test only
        // const add_items = 4
        // for (let i = 0; i < add_items; i++) {
        // 	audiovisuals.push(audiovisuals[0])
        // }

        const speaker_icon = __WEB_TEMPLATE_WEB__ + '/assets/images/icon_speaker.svg'

        for (let i = 0; i < audiovisuals.length; i++) {

            const item = audiovisuals[i]

            const video_url = item.url_av
            const posterframe_url = item.url_thumb

            // image_container
            const image_container = common.create_dom_element({
                element_type: "div",
                class_name: "image_container play_video",
                parent: item_wrapper
            })

            // image
            const image = common.create_dom_element({
                element_type: "img",
                class_name: "audiovisual posterframe",
                title: tstring.ver_video || "Ver video",
                src: posterframe_url,
                parent: image_container
            })
            image.addEventListener("error", manage_error)
            function manage_error() {
                if (this.src !== page.default_image && this.src !== speaker_icon) {
                    this.src = speaker_icon
                }
            }

            // open video_player on click
            image.addEventListener("click", function (e) {

                // load video
                self.video_player = self.video_player || new video_player() // creates / get existing instance of player
                self.video_player.init({
                    video_url: video_url,
                    posterframe_url: posterframe_url,
                    mode: "default"
                })
                self.video_player.render()
                    .then(function (video_player_wrapper) {
                        // on render, place it in overlay div like shadow box
                        page.open_player_with_overlay(document.body, video_player_wrapper)
                    })
            })
        }

        return true
    },//end build_audiovisuals_list



    /**
    * OPEN_PLAYER
    * Create and open video player for given url
    * @return promise
    */
    open_player: function (options) {

        const js_promise = new Promise(function (resolve) {

            const src = options.src
            const poster = options.poster
            const container = options.container

            const wrapper = container.querySelector(".player_wrapper") || common.create_dom_element({
                element_type: "div",
                class_name: "player_wrapper",
                parent: container
            })

            // clean wrapper
            while (wrapper.hasChildNodes()) {
                wrapper.removeChild(wrapper.firstChild);
            }

            const overlay = common.create_dom_element({
                element_type: "div",
                class_name: "overlay",
                parent: wrapper
            })
            overlay.addEventListener("click", function () {
                wrapper.remove()
            })

            // hide buttons
            // const buttons = document.querySelectorAll(".navigation, .button_index, .close")
            // for(const button of buttons) {
            // 	button.classList.add("hide")
            // }

            // player
            const player = common.build_player({
                src: src,
                poster: poster
            })
            // overlay.addEventListener("click", function(e){
            // 	e.stopPropagation()
            // })
            wrapper.appendChild(player)

            // posterframe load
            const image = new Image()
            image.addEventListener('load', function () {
                resolve({
                    wrapper: wrapper,
                    player: player
                })
            })
            image.src = poster
        })


        return js_promise
    },//end open_player



    /**
    * CLICK_FIRST_LINK
    * Find and click first link on change element class
    * @return promise
    */
    click_first_link: function (container, class_name) {

        // Select the node that will be observed for mutations
        const targetNode = container;

        // Options for the observer (which mutations to observe)
        const config = { attributes: true, childList: false, subtree: false };

        // Callback function to execute when mutations are observed
        const callback = function (mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes') {

                    if (mutation.attributeName === "class" && !container.classList.contains(class_name)) {

                        // find first link
                        const link = container.querySelector("a")
                        if (link) {
                            link.click()
                        }
                        observer.disconnect();
                    }
                }
            }
        };

        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

        // Later, you can stop observing
        // observer.disconnect();

        return true
    },//end click_first_link



    /**
    * SET_FORMAT_CSS
    * Set css verticals / horizontal to selected elements
    */
    set_format_css: function () {

        const layout_format = self.layout_format
        const to_set_format_items = self.to_set_format_items

        for (let i = 0; i < to_set_format_items.length; i++) {
            to_set_format_items[i].classList(layout_format)
        }

        return true
    },//end set_format_css



}//end item_row
