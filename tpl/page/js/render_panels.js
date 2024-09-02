/*global tstring, common, timeline_factory, DocumentFragment*/
/*eslint no-undef: "error"*/
"use strict";



var render_panels = {



    /**
    * RENDER_EXPO_PRESENTATION
    * Used by exhibitions, exhibition and panels
    * @param object options
    * @return DOM node fragment
    */
    render_expo_presentation: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const text_body = options.text_body || false
        const text_summary = options.text_summary || false
        const add_link = options.add_link || false
        const add_image = typeof options.add_image !== 'undefined' ? options.add_image : true
        const animate = options.animate || false
        const panel_css_selector = options.panel_css_selector || null
        const key = options.key
        const orientation = key % 2
            ? 'left'
            : 'right'

        // color
        const color = row.color || ''
        const tinted_selector = row.color ? ' tinted' : ''

        // images
        const main_images = row.main_images_all
        const main_images_length = main_images.length


        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper " + color + " " + orientation,
            parent: fragment
        })

        if (panel_css_selector) {
            const ar_styles = panel_css_selector.split(' ')
            panel_wrapper.classList.add(...ar_styles)
        }

        // image_wrap
        if (add_image === true) {

            const image_wrap = common.create_dom_element({
                element_type: "div",
                class_name: "image_wrap " + color,
                parent: panel_wrapper
            })
            if (animate) {
                render_panels.animable_item(image_wrap, "animate-image-reveal", orientation)
            }

            // images
            for (let i = 0; i < main_images_length; i++) {

                const image_data = main_images[i]
                const current_image = image_data.image
                const current_image_thumb = image_data.thumb

                const image_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "image_container " + color,
                    parent: image_wrap
                })

                // image
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image" + tinted_selector,
                    src: current_image_thumb,
                    parent: image_container
                })
                page.build_image_with_background_color(current_image)
                    .then(function (response) {

                        const img = response.img

                        // set item_wrapper format class vertical / horizontal
                        image_container.classList.add(response.format)

                        image.classList.add(response.bg_type, orientation)

                        // set as loaded
                        image.classList.add('loaded')

                        // hi-res image set
                        setTimeout(function () {
                            image.src = current_image
                        }, 150)
                    })

                // audiovisual case
                if (image_data.type === 'audiovisual') {

                    image_container.classList.add("play_video")

                    // open video_player on click
                    image.addEventListener("click", function (e) {

                        const video_url = image_data.src
                        const posterframe_url = image_data.thumb

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
            }

            // carousel activation. Except groupers (years) and <2 image
            if (row.typology_id !== '9' && main_images.length > 1) {
                render_panels.activate_carousel(image_wrap)
            }
        }//end if (add_image===true)

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        // title
        if (row.title && row.title.length > 0) {
            const title = common.create_dom_element({
                element_type: "h2",
                class_name: "title " + tinted_selector,
                inner_html: row.title,
                parent: text_wrap
            })
            if (animate) {
                render_panels.animable_item(title, "animate-reveal", orientation)
            }
        }
        // summary
        if (text_summary === true && row.summary && row.summary.length > 0) {
            const summary = common.create_dom_element({
                element_type: "div",
                class_name: "summary",
                inner_html: row.summary,
                parent: text_wrap
            })
        }
        // body
        if (text_body === true && row.body && row.body.length > 0) {
            const body = common.create_dom_element({
                element_type: "div",
                class_name: "body",
                inner_html: row.body,
                parent: text_wrap
            })
        }
        // link
        if (add_link) {
            // link
            const link = common.create_dom_element({
                element_type: "a",
                class_name: "link",
                href: page_globals.__WEB_ROOT_WEB__ + '/exhibition/' + row.section_id,
                parent: text_wrap
            })
            if (animate) {
                render_panels.animable_item(link, "animate-reveal", orientation)
            }
            // icon_eye
            const icon_url = row.color
                ? __WEB_TEMPLATE_WEB__ + '/assets/images/icon_eye_white.svg'
                : __WEB_TEMPLATE_WEB__ + '/assets/images/icon_eye_color.svg'
            const icon_eye = common.create_dom_element({
                element_type: "img",
                class_name: "",
                src: icon_url,
                parent: link
            })
        }//end if (add_link)


        return fragment
    },//end render_expo_presentation



    /**
    * RENDER_GROUPER
    * @param object options
    * @return DOM node fragment
    */
    render_grouper: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const add_image = typeof options.add_image !== 'undefined' ? options.add_image : true
        const animate = typeof options.animate !== 'undefined' ? options.animate : true
        const panel_css_selector = options.panel_css_selector || null
        const key = options.key
        const title_icon = options.title_icon || null
        const orientation = typeof options.orientation !== 'undefined'
            ? options.orientation
            : (key % 2)
                ? 'left'
                : 'right'

        // color
        const color = row.color || ''
        const tinted_selector = row.color ? ' tinted' : ''

        // images
        const main_images = row.main_images_all
        const main_images_length = main_images.length


        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper no_image " + color + " " + orientation,
            parent: fragment
        })

        if (panel_css_selector) {
            const ar_styles = panel_css_selector.split(' ')
            panel_wrapper.classList.add(...ar_styles)
        }

        // image_wrap
        if (add_image === true) {
            const image_wrap = common.create_dom_element({
                element_type: "div",
                class_name: "image_wrap " + color,
                parent: panel_wrapper
            })

            for (let i = 0; i < main_images_length; i++) {

                const image_data = main_images[i]
                const current_image = image_data.image
                const current_image_thumb = image_data.thumb

                const image_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "image_container " + color,
                    parent: image_wrap
                })

                // image
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image" + tinted_selector,
                    src: current_image_thumb,
                    parent: image_container
                })
                page.build_image_with_background_color(current_image)
                    .then(function (response) {

                        const img = response.img

                        // set item_wrapper format class vertical / horizontal
                        image_container.classList.add(response.format)

                        image.classList.add(response.bg_type, orientation)

                        // set as loaded
                        image.classList.add('loaded')

                        // hi-res image set
                        setTimeout(function () {
                            image.src = current_image
                        }, 950)
                    })
            }
        }//end if (add_image===true)

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        // icon_eye_grouper
        if (title_icon) {
            const icon_eye_grouper = common.create_dom_element({
                element_type: "img",
                class_name: "icon_eye_grouper",
                src: title_icon,
                parent: text_wrap
            })
        }
        // title
        const title = common.create_dom_element({
            element_type: "h2",
            class_name: "title" + tinted_selector,
            inner_html: row.title,
            parent: text_wrap
        })
        if (animate) {
            render_panels.animable_item(text_wrap, "animate-reveal", orientation)
        }


        return fragment
    },//end render_grouper



    /**
    * RENDER_NEWS_GROUPER (YEAR)
    * @param object options
    * @return DOM node fragment
    */
    render_news_grouper: function (options) {
        // console.log("render_panels render_news_grouper options:",options);

        // options
        const self = options.caller
        const row = options.row
        const text_body = options.text_body || false
        const text_summary = options.text_summary || false
        const color = options.color // || 'qdp_purple'
        const add_link = options.add_link || false
        const animate = options.animate || false
        const panel_css_selector = options.panel_css_selector || null
        const key = options.key
        const orientation = typeof options.orientation !== 'undefined'
            ? options.orientation
            : (key % 2)
                ? 'left'
                : 'right'

        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper " + color + " " + orientation,
            parent: fragment
        })
        if (panel_css_selector) {
            panel_wrapper.classList.add(panel_css_selector)
        }

        // image_wrap
        const image_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "image_wrap " + color,
            parent: panel_wrapper
        })

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        // icon_news
        const icon_news = common.create_dom_element({
            element_type: "img",
            class_name: "icon_news",
            src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_news.svg',
            parent: text_wrap
        })
        // title
        const title = common.create_dom_element({
            element_type: "h2",
            class_name: "title",
            inner_html: row.title,
            parent: text_wrap
        })
        if (animate) {
            render_panels.animable_item(text_wrap, "animate-image-reveal", 'left')
        }


        return fragment
    },//end render_news_grouper



    /**
    * RENDER_didactic_GROUPER (YEAR)
    * @param object options
    * @return promise
    */
    render_didactic_grouper: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const color = options.color // || 'qdp_purple'
        const add_link = options.add_link || false
        const animate = typeof options.animate !== "undefined" ? options.animate : true
        const panel_css_selector = options.panel_css_selector || null
        const key = options.key
        const orientation = typeof options.orientation !== "undefined"
            ? options.orientation
            : (key % 2)
                ? 'left'
                : 'right'

        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper container " + color,
            parent: fragment
        })

        if (panel_css_selector) {
            panel_wrapper.classList.add(panel_css_selector)
        }

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        const title = common.create_dom_element({
            element_type: "h2",
            class_name: "title",
            inner_html: row.title,
            parent: text_wrap
        })
        if (animate) {
            render_panels.animable_item(title, "animate-reveal", orientation)
        }

        return fragment
    },//end render_didactic_grouper



    /**
    * RENDER_EXPO_CONTENTS
    * @param object options
    * @return DOM node fragment
    */
    render_expo_contents: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const add_link = options.add_link
        const add_views = options.add_views || false
        const animate = options.animate || false
        const panel_css_selector = options.panel_css_selector || null
        const key = options.key
        const panel_number = options.panel_number || 0
        const orientation = key % 2
            ? 'right'
            : 'left'

        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper " + orientation,
            parent: fragment
        })
        if (panel_css_selector) {
            const ar_styles = panel_css_selector.split(' ')
            panel_wrapper.classList.add(...ar_styles)
        }

        // image_wrap
        const image_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "image_wrap",
            parent: panel_wrapper
        })
        if (animate) {
            render_panels.animable_item(image_wrap, "animate-image-reveal", orientation)
        }

        const main_images = row.main_images_all
        for (let i = 0; i < main_images.length; i++) {

            const image_data = main_images[i]
            const current_image = image_data.image
            const current_image_thumb = image_data.thumb

            const image_container = common.create_dom_element({
                element_type: "div",
                class_name: "image_container",
                parent: image_wrap
            })

            // image
            const image = common.create_dom_element({
                element_type: "img",
                class_name: "image",
                src: current_image_thumb,
                parent: image_container
            })
            page.build_image_with_background_color(current_image, image_container)
                .then(function (response) {

                    const img = response.img

                    // set item_wrapper format class vertical / horizontal
                    image_container.classList.add(response.format)

                    image.classList.add(response.bg_type, orientation)

                    // set as loaded
                    image.classList.add('loaded')

                    // hi-res image set
                    setTimeout(function () {
                        image.src = current_image
                    }, 150)
                })

            // audiovisual case
            if (image_data.type === 'audiovisual') {

                image_container.classList.add("play_video")

                // open video_player on click
                image.addEventListener("click", function (e) {

                    const video_url = image_data.src
                    const posterframe_url = image_data.thumb

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
        }

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        // id_number
        const id_number_text = "" + (((parseInt(panel_number) + 1) + "").padStart(2, '0'))
        const id_number = common.create_dom_element({
            element_type: "div",
            class_name: "id_number",
            inner_html: id_number_text,
            parent: text_wrap
        })
        // title
        if (row.title && row.title.length > 0) {
            const title = common.create_dom_element({
                element_type: "h2",
                class_name: "title",
                inner_html: row.title,
                parent: text_wrap
            })
            if (animate) {
                render_panels.animable_item(title, "animate-reveal", orientation)
            }
        }
        // summary
        if (row.summary && row.summary.length > 0) {
            const summary = common.create_dom_element({
                element_type: "div",
                class_name: "summary",
                inner_html: row.summary,
                parent: text_wrap
            })
        }
        // body
        if (row.body && row.body.length > 0) {
            const body = common.create_dom_element({
                element_type: "div",
                class_name: "body",
                inner_html: row.body,
                parent: text_wrap
            })
        }
        // add_link
        if (add_link === true) {
            // link panels
            const link_panels = common.create_dom_element({
                element_type: "a",
                class_name: "link hide_opacity",
                href: page_globals.__WEB_ROOT_WEB__ + '/panels/' + self.section_id + '.' + row.section_id + '.' + key,
                parent: text_wrap
            })
            if (animate) {
                render_panels.animable_item(link_panels, "animate-reveal", orientation)
            }
            // icon_eye
            const icon_eye = common.create_dom_element({
                element_type: "img",
                class_name: "icon_eye",
                src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_eye_color.svg',
                parent: link_panels
            })
        }//end if (add_link===true)

        // add_link views
        if (add_views === true) {
            if ((row.images && row.images.length > 0) || (row.objects && row.objects.length > 0) || (row.immovable && row.immovable.length > 0)) {

                // list modes selector
                const list_mode_group = common.create_dom_element({
                    element_type: "div",
                    class_name: "list_mode_selection",
                    parent: text_wrap
                })
                // button_list_mode
                const button_list_mode = common.create_dom_element({
                    element_type: "span",
                    class_name: "btn_mode_selection button_list_mode " + self.color,
                    title: tstring['lista'] || 'Lista',
                    parent: list_mode_group
                })
                button_list_mode.addEventListener("click", function (e) {
                    e.preventDefault()
                    self.switch_view('list', views_container, list_mode_group, this, row)
                })
                // button_list_images_mode
                const button_list_images_mode = common.create_dom_element({
                    element_type: "span",
                    class_name: "btn_mode_selection button_list_images_mode " + self.color,
                    title: tstring['imagenes'] || 'Imágenes',
                    parent: list_mode_group
                })
                button_list_images_mode.addEventListener("click", function (e) {
                    e.preventDefault()
                    self.switch_view('list_images', views_container, list_mode_group, this, row)
                })
                // button_view_map_mode
                const button_view_map_mode = common.create_dom_element({
                    element_type: "span",
                    class_name: "btn_mode_selection button_view_map_mode " + self.color,
                    title: tstring['mapa'] || 'Mapa',
                    parent: list_mode_group
                })
                button_view_map_mode.addEventListener("click", function (e) {
                    e.preventDefault()
                    self.switch_view('map', views_container, list_mode_group, this, row)
                })
                // button_view_timeline_mode
                const button_view_timeline_mode = common.create_dom_element({
                    element_type: "span",
                    class_name: "btn_mode_selection button_view_timeline_mode " + self.color,
                    title: tstring['mapa'] || 'Mapa',
                    parent: list_mode_group
                })
                button_view_timeline_mode.addEventListener("click", function (e) {
                    e.preventDefault()
                    self.switch_view('timeline', views_container, list_mode_group, this, row)
                })
            }

            const views_container = common.create_dom_element({
                element_type: "div",
                id: 'views_container_' + row.section_id,
                class_name: "views_container hide99 " + orientation,
                parent: fragment
            })
        }//end if (add_views===true)


        // carousel activation. Except groupers (years)
        if (main_images && main_images.length > 1) {
            render_panels.activate_carousel(image_wrap)
        }

        return fragment
    },//end render_expo_contents



    /**
    * RENDER_TOC_PANEL
    * @param object options
    * @return DOM node fragment
    */
    render_toc_panel: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const add_link = options.add_link
        const add_views = options.add_views || false
        const animate = options.animate || false
        const carousel = typeof options.carousel !== 'undefined' ? options.carousel : true
        const add_button_detail = typeof options.add_button_detail !== 'undefined' ? options.add_button_detail : true
        const add_body = typeof options.add_body !== 'undefined' ? options.add_body : false
        const panel_css_selector = options.panel_css_selector || null
        const key = options.key
        const tpl = options.tpl || 'news_detail'
        const orientation = !(key % 2)
            ? 'right'
            : 'left'

        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper toc_contents container " + orientation,
            parent: fragment
        })
        if (panel_css_selector) {
            const ar_styles = panel_css_selector.split(' ')
            panel_wrapper.classList.add(...ar_styles)
        }

        // image_wrap
        const image_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "image_wrap",
            parent: panel_wrapper
        })
        if (animate) {
            render_panels.animable_item(image_wrap, "animate-image-reveal", orientation)
        }

        const main_images = row.main_images_all
        for (let i = 0; i < main_images.length; i++) {

            const image_data = main_images[i]
            const current_image = image_data.image
            const current_image_thumb = image_data.thumb

            const image_container = common.create_dom_element({
                element_type: "div",
                class_name: "image_container",
                parent: image_wrap
            })

            // image
            const image = common.create_dom_element({
                element_type: "img",
                class_name: "image",
                src: current_image_thumb,
                parent: image_container
            })
            page.build_image_with_background_color(current_image, image_container)
                .then(function (response) {

                    const img = response.img

                    // set item_wrapper format class vertical / horizontal
                    image_container.classList.add(response.format)

                    image.classList.add(response.bg_type, orientation)

                    // set as loaded
                    image.classList.add('loaded')

                    // hi-res image set
                    setTimeout(function () {
                        image.src = current_image
                    }, 950)
                })

            // audiovisual case
            if (image_data.type === 'audiovisual') {

                const video_url = common.get_media_engine_url(image_data.source, 'av', null, true)
                const posterframe_url = image_data.image

                image_container.classList.add("play_video")

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
        }

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        // date
        if (row.date) {
            const date = row.date.join(" - ")
            common.create_dom_element({
                element_type: "div",
                class_name: "id_number",
                inner_html: date,
                parent: text_wrap
            })
        }
        // title
        if (row.title && row.title.length > 0) {
            const title = common.create_dom_element({
                element_type: "h2",
                class_name: "title",
                inner_html: row.title,
                parent: text_wrap
            })
            if (animate) {
                render_panels.animable_item(title, "animate-reveal", orientation)
            }
        }
        // summary
        if (row.summary && row.summary.length > 0) {
            const summary = common.create_dom_element({
                element_type: "div",
                class_name: "summary",
                inner_html: row.summary,
                parent: text_wrap
            })
        }
        // body
        if (add_body === true && row.body && row.body.length > 0) {
            const body = common.create_dom_element({
                element_type: "div",
                class_name: "body",
                inner_html: row.body,
                parent: text_wrap
            })
        }

        // button_detail
        if (add_button_detail === true) {
            const button_detail = common.create_dom_element({
                element_type: "input",
                type: 'button',
                class_name: "btn btn-light btn-block secondary button_detail hide_opacity",
                value: tstring.view_more || 'View more',
                parent: text_wrap
            })
            button_detail.addEventListener("click", function () {
                window.location.href = page_globals.__WEB_ROOT_WEB__ + '/' + tpl + '/' + row.section_id;
            })
            if (animate) {
                render_panels.animable_item(button_detail, "animate-reveal", orientation)
            }
        }

        // link
        if (add_link) {
            const link = common.create_dom_element({
                element_type: "a",
                class_name: "link",
                // href			: page_globals.__WEB_ROOT_WEB__ + '/exhibition/' + row.section_id,
                href: page_globals.__WEB_ROOT_WEB__ + '/' + tpl + '/' + row.section_id,
                parent: text_wrap
            })
            if (animate) {
                render_panels.animable_item(link, "animate-reveal", orientation)
            }
            // icon_eye
            const icon_url = row.color
                ? __WEB_TEMPLATE_WEB__ + '/assets/images/icon_eye_white.svg'
                : __WEB_TEMPLATE_WEB__ + '/assets/images/icon_eye_color.svg'
            const icon_eye = common.create_dom_element({
                element_type: "img",
                class_name: "",
                src: icon_url,
                parent: link
            })
        }

        // other items
        if (row.other_items && row.other_items.length > 0) {

            const items_list = common.create_dom_element({
                element_type: "div",
                class_name: "items_list",
                parent: text_wrap
            })

            for (let k = 0; k < row.other_items.length; k++) {

                const image_data = row.other_items[k]

                const image_wrap = common.create_dom_element({
                    element_type: "a",
                    class_name: "image_wrap " + (image_data.type === 'audiovisual' ? (' play_video') : ''),
                    href: null,
                    parent: items_list
                })
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: image_data.image_url_thumb,
                    parent: image_wrap
                })
                image.data = image_data // add object data
                if (image_data.type !== 'document')
                    page.build_image_with_background_color(image_data.image_url_thumb, image_wrap)

                // audiovisual case
                if (image_data.type === 'audiovisual') {

                    image_wrap.classList.add("play_video")

                    // open video_player on click
                    image.addEventListener("click", function (e) {

                        const video_url = image_data.src
                        const posterframe_url = image_data.thumb

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
                } else if (image_data.type === 'document') {

                    // image_wrap.href					= common.get_media_engine_url(image_data.source, 'pdf')
                    image_wrap.href = image_data.pdf_url
                    image_wrap.target = '_blank'
                    image_wrap.style.backgroundColor = "rgb(255 255 255)"

                } else {

                    // lightbox
                    image.addEventListener("click", function (e) {
                        const c_image = common.create_dom_element({
                            element_type: "img",
                            class_name: "unactive",
                            src: image.data.image_url
                        })
                        // c_image.addEventListener('contextmenu', event => event.preventDefault());
                        page.build_image_with_background_color(image.src, c_image).then(function () {
                            // on render, place it in overlay div like shadow box
                            page.open_player_with_overlay(document.body, c_image)
                        })
                    })
                }
            }
        }//end if (row.other_items && row.other_items.length>0)


        // carousel activation. Except groupers (years)
        if (carousel === true && main_images && main_images.length > 1) {
            render_panels.activate_carousel(image_wrap)
        }


        return fragment
    },//end render_toc_panel



    /**
    * RENDER_DETAIL
    * @param object options
    * @return DOM node fragment
    */
    render_detail: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const animate = options.animate || false
        const panel_css_selector = options.panel_css_selector || null
        const orientation = 'left'


        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper exhibition_detail standard container",
            parent: fragment
        })
        if (panel_css_selector) {
            const ar_styles = panel_css_selector.split(' ')
            panel_wrapper.classList.add(...ar_styles)
        }

        // title
        if (row.title && row.title.length > 0) {
            const title = common.create_dom_element({
                element_type: "h2",
                class_name: "title",
                inner_html: row.title,
                parent: panel_wrapper
            })
            if (animate) {
                render_panels.animable_item(title, "animate-reveal", orientation)
            }
        }

        // date
        if (row.date) {
            const date = row.date.join(" - ")
            common.create_dom_element({
                element_type: "div",
                class_name: "id_number",
                inner_html: date,
                parent: panel_wrapper
            })
        }

        // images
        const main_images = row.main_images_all
        if (main_images && main_images.length > 0) {

            // image_wrap
            const image_wrap = common.create_dom_element({
                element_type: "div",
                class_name: "image_wrap",
                parent: panel_wrapper
            })
            if (animate) {
                render_panels.animable_item(image_wrap, "animate-image-reveal", orientation)
            }

            for (let i = 0; i < main_images.length; i++) {

                const image_data = main_images[i]
                const current_image = image_data.image
                const current_image_thumb = image_data.thumb

                const image_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "image_container",
                    parent: image_wrap
                })

                // image
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: current_image_thumb,
                    parent: image_container
                })
                page.build_image_with_background_color(current_image, image_container)
                    .then(function (response) {

                        const img = response.img

                        // set item_wrapper format class vertical / horizontal
                        image_container.classList.add(response.format)

                        image.classList.add(response.bg_type, orientation)

                        // set as loaded
                        image.classList.add('loaded')

                        // hi-res image set
                        setTimeout(function () {
                            image.src = current_image
                        }, 150)
                    })

                // audiovisual case
                if (image_data.type === 'audiovisual') {

                    const video_url = common.get_media_engine_url(image_data.source, 'av', null, true)
                    const posterframe_url = image_data.image

                    image_container.classList.add("play_video")

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
            }
        }

        // text_wrap

        // body
        const body_text = (row.body && row.body.length > 0)
            ? row.body
            : ((row.summary && row.summary.length > 0) ? row.summary : '')
        const body = common.create_dom_element({
            element_type: "div",
            class_name: "body",
            inner_html: body_text,
            parent: panel_wrapper
        })

        // items list
        const items_list = common.create_dom_element({
            element_type: "div",
            class_name: "items_list",
            parent: panel_wrapper
        })


        // catalog items
        if (row.catalog_items && row.catalog_items.length > 0) {
            for (let k = 0; k < row.catalog_items.length; k++) {

                const image_wrap = common.create_dom_element({
                    element_type: "a",
                    class_name: "image_wrap qdp_button",
                    href: page_globals.__WEB_ROOT_WEB__ + "/" + row.catalog_items[k].tpl + "/" + row.catalog_items[k].section_id,
                    target: "_blank",
                    parent: items_list
                })
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: row.catalog_items[k].image_url_thumb,
                    parent: image_wrap
                })
                page.build_image_with_background_color(row.catalog_items[k].image_url_thumb, image_wrap)
            }
        }

        // other items
        if (row.other_items && row.other_items.length > 0) {
            for (let k = 0; k < row.other_items.length; k++) {

                const image_data = row.other_items[k]

                const image_wrap = common.create_dom_element({
                    element_type: "a",
                    class_name: "image_wrap qdp_button " + image_data.type + (image_data.type === 'audiovisual' ? (' play_video') : ''),
                    href: null,
                    parent: items_list
                })
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: image_data.image_url_thumb,
                    parent: image_wrap
                })

                switch (image_data.type) {

                    case 'audiovisual':
                        page.build_image_with_background_color(image_data.image_url_thumb, image_wrap)

                        const video_url = image_data.video_url
                        const posterframe_url = image_data.image

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
                        break;

                    case 'document':

                        image_wrap.href = image_data.pdf_url
                        image_wrap.target = '_blank'
                        image_wrap.style.backgroundColor = "rgb(255 255 255)"
                        const pdf_title = image_data.title

                        common.create_dom_element({
                            element_type: "div",
                            class_name: "pdf_title truncate_text",
                            inner_html: pdf_title,
                            parent: image_wrap
                        })
                        break;

                    default:
                        page.build_image_with_background_color(image_data.image_url_thumb, image_wrap)
                        image.addEventListener("click", function (e) {

                            const c_image = common.create_dom_element({
                                element_type: "img",
                                class_name: "",
                                src: image_data.image_url
                            })

                            // on render, place it in overlay div like shadow box
                            page.open_player_with_overlay(document.body, c_image)
                        })
                        break;
                }//end switch(image_data.type)

            }
        }//end if (row.other_items && row.other_items.length>0)

        // carousel activation
        if (main_images && main_images.length > 1 && typeof image_wrap !== "undefined") {
            render_panels.activate_carousel(image_wrap)
        }


        return fragment
    },//end render_detail



    /**
    * PANEL_STANDARD
    * @param object options
    * @return DOM node fragment
    */
    panel_standard: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const key = options.key
        const orientation = options.orientation

        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper panel standard " + orientation,
            parent: fragment
        })

        // text_wrap
        const text_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "text_wrap",
            parent: panel_wrapper
        })
        // title
        if (row.title && row.title.length > 0) {
            const title = common.create_dom_element({
                element_type: "h2",
                class_name: "title",
                inner_html: row.title,
                parent: text_wrap
            })
        }
        // summary
        if (row.summary && row.summary.length > 0) {
            const summary = common.create_dom_element({
                element_type: "div",
                class_name: "summary",
                inner_html: row.summary,
                parent: text_wrap
            })
        }
        // body
        if (row.body && row.body.length > 0) {
            const body = common.create_dom_element({
                element_type: "div",
                class_name: "body",
                inner_html: row.body,
                parent: text_wrap
            })
        }

        // items list
        const items_list = common.create_dom_element({
            element_type: "div",
            class_name: "items_list",
            parent: text_wrap
        })

        // catalog items
        if (row.catalog_items && row.catalog_items.length > 0) {

            for (let k = 0; k < row.catalog_items.length; k++) {

                const image_wrap = common.create_dom_element({
                    element_type: "a",
                    class_name: "image_wrap",
                    href: page_globals.__WEB_ROOT_WEB__ + "/" + row.catalog_items[k].tpl + "/" + row.catalog_items[k].section_id,
                    target: "_blank",
                    parent: items_list
                })
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: row.catalog_items[k].image_url_thumb,
                    parent: image_wrap
                })
                page.build_image_with_background_color(row.catalog_items[k].image_url_thumb, image_wrap)
            }
        }

        // other items
        if (row.other_items && row.other_items.length > 0) {

            for (let k = 0; k < row.other_items.length; k++) {

                const image_data = row.other_items[k]

                const image_wrap = common.create_dom_element({
                    element_type: "a",
                    class_name: "image_wrap " + (image_data.type === 'audiovisual' ? (' play_video') : ''),
                    href: null,
                    parent: items_list
                })
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: image_data.image_url_thumb,
                    parent: image_wrap
                })
                image.data = image_data // add object data
                if (image_data.type !== 'document')
                    page.build_image_with_background_color(image_data.image_url_thumb, image_wrap)

                // audiovisual case
                if (image_data.type === 'audiovisual') {

                    image_wrap.classList.add("play_video")

                    // open video_player on click
                    image.addEventListener("click", function (e) {

                        const video_url = image_data.src
                        const posterframe_url = image_data.thumb

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
                } else if (image_data.type === 'document') {

                    image_wrap.href = common.get_media_engine_url(image_data.source, 'pdf')
                    image_wrap.target = '_blank'
                    image_wrap.style.backgroundColor = "rgb(255 255 255)"

                } else {

                    // lightbox
                    image.addEventListener("click", function (e) {
                        const c_image = common.create_dom_element({
                            element_type: "img",
                            class_name: "unactive",
                            src: image.data.image_url
                        })
                        // c_image.addEventListener('contextmenu', event => event.preventDefault());
                        page.build_image_with_background_color(image.src, c_image).then(function () {
                            // on render, place it in overlay div like shadow box
                            page.open_player_with_overlay(document.body, c_image)
                        })
                    })
                }
            }
        }

        // image_wrap
        const image_wrap = common.create_dom_element({
            element_type: "div",
            class_name: "image_wrap",
            parent: panel_wrapper
        })

        const main_images = row.main_images_all
        for (let i = 0; i < main_images.length; i++) {

            const image_data = main_images[i]
            const current_image = image_data.image
            const current_image_thumb = image_data.thumb

            const image_container = common.create_dom_element({
                element_type: "div",
                class_name: "image_container",
                parent: image_wrap
            })

            // image
            const image = common.create_dom_element({
                element_type: "img",
                class_name: "image",
                src: current_image_thumb,
                parent: image_container
            })
            page.build_image_with_background_color(current_image, image_container)
                .then(function (response) {

                    const img = response.img

                    // set item_wrapper format class vertical / horizontal
                    image_container.classList.add(response.format)

                    image.classList.add(response.bg_type, orientation)

                    // set as loaded
                    image.classList.add('loaded')

                    // hi-res image set
                    setTimeout(function () {
                        image.src = current_image
                    }, 150)
                })

            // audiovisual case
            if (image_data.type === 'audiovisual') {

                image_container.classList.add("play_video")

                // open video_player on click
                image.addEventListener("click", function (e) {

                    const video_url = image_data.src
                    const posterframe_url = image_data.thumb

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
        }

        // active carousel
        if (main_images && main_images.length > 1) {
            render_panels.activate_carousel(image_wrap)
        }


        return fragment
    },//end panel_standard



    /**
    * PANEL_MAP
    * @param object options
    * @return DOM node fragment
    */
    panel_map: function (options) {
        // console.log("options:",options);

        // options
        const self = options.caller
        const row = options.row
        const key = options.key
        const container = options.container

        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper_map panel",
            parent: fragment
        })

        // text_wrap (optional)
        if ((row.title && row.title.length > 0) || (row.summary && row.summary.length > 0) || (row.body && row.body.length > 0)) {
            const text_wrap = common.create_dom_element({
                element_type: "div",
                class_name: "text_wrap",
                parent: panel_wrapper
            })
            // title
            if (row.title && row.title.length > 0) {
                const title = common.create_dom_element({
                    element_type: "h2",
                    class_name: "title",
                    inner_html: row.title,
                    parent: text_wrap
                })
            }
            // summary
            if (row.summary && row.summary.length > 0) {
                const summary = common.create_dom_element({
                    element_type: "div",
                    class_name: "summary",
                    inner_html: row.summary,
                    parent: text_wrap
                })
            }
            // body
            if (row.body && row.body.length > 0) {
                const body = common.create_dom_element({
                    element_type: "div",
                    class_name: "body",
                    inner_html: row.body,
                    parent: text_wrap
                })
            }
        }

        // map container
        const map_container = common.create_dom_element({
            element_type: "div",
            class_name: "map panel_map_container",
            parent: panel_wrapper
        })

        // map
        common.when_in_dom(map_container, function () {
            const map_data = row.map_data
            const map = new map_factory() // creates instance of map_factory
            map.init({
                source_maps: page.maps_config.source_maps,
                map_position: null,
                map_container: map_container,
                popup_builder: page.map_popup_builder,
                popup_options: page.maps_config.popup_options
            })
                .then(function (leaflet_map) {
                    // parse data point
                    map.parse_data_to_map(map_data)
                })
        })


        return fragment
    },//end panel_map



    /**
    * PANEL_TIMELINE
    * @param object options
    * @return DOM node fragment
    */
    panel_timeline: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const key = options.key
        const container = options.container


        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper_timeline panel",
            parent: fragment
        })

        // text_wrap (optional)
        if ((row.title && row.title.length > 0) || (row.summary && row.summary.length > 0) || (row.body && row.body.length > 0)) {
            const text_wrap = common.create_dom_element({
                element_type: "div",
                class_name: "text_wrap",
                parent: panel_wrapper
            })
            // title
            if (row.title && row.title.length > 0) {
                const title = common.create_dom_element({
                    element_type: "h2",
                    class_name: "title",
                    inner_html: row.title,
                    parent: text_wrap
                })
            }
            // summary
            if (row.summary && row.summary.length > 0) {
                const summary = common.create_dom_element({
                    element_type: "div",
                    class_name: "summary",
                    inner_html: row.summary,
                    parent: text_wrap
                })
            }
            // body
            if (row.body && row.body.length > 0) {
                const body = common.create_dom_element({
                    element_type: "div",
                    class_name: "body",
                    inner_html: row.body,
                    parent: text_wrap
                })
            }
        }

        // timeline container
        const timeline_container = common.create_dom_element({
            element_type: "div",
            class_name: "timeline",
            parent: panel_wrapper
        })

        // timeline
        common.when_in_dom(timeline_container, function () {
            const timeline_data = row.timeline_data
            const timeline = new timeline_factory() // creates / get existing instance of timeline
            timeline.init({
                target: timeline_container,
                block_builder: catalog.timelime_block_builder
            })
                .then(function () {
                    timeline.render_timeline({
                        data: timeline_data
                    })
                        .then(function (timeline_node) {

                        })
                })
        })


        return fragment
    },//end panel_timeline



    /**
    * PANEL_GALLERY
    * @param object options
    * @return DOM node fragment
    */
    panel_gallery: function (options) {

        // options
        const self = options.caller
        const row = options.row
        const key = options.key
        const container = options.container
        const type = options.type // 'list' | 'list_images'
        const view_mode = type


        const fragment = new DocumentFragment()

        // panel_wrapper
        const panel_wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "panel_wrapper_gallery panel " + type,
            parent: fragment
        })

        // text_wrap (optional)
        if ((row.title && row.title.length > 0) || (row.summary && row.summary.length > 0) || (row.body && row.body.length > 0)) {
            const text_wrap = common.create_dom_element({
                element_type: "div",
                class_name: "text_wrap",
                parent: panel_wrapper
            })
            // title
            if (row.summary && row.summary.length > 0) {
                const title = common.create_dom_element({
                    element_type: "h2",
                    class_name: "title",
                    inner_html: row.title,
                    parent: text_wrap
                })
            }
            // summary
            if (row.summary && row.summary.length > 0) {
                const summary = common.create_dom_element({
                    element_type: "div",
                    class_name: "summary",
                    inner_html: row.summary,
                    parent: text_wrap
                })
            }
            // body
            if (row.body && row.body.length > 0) {
                const body = common.create_dom_element({
                    element_type: "div",
                    class_name: "body",
                    inner_html: row.body,
                    parent: text_wrap
                })
            }
        }

        // carousel
        const main_images = row.main_images_all
        if (main_images && main_images.length > 0) {
            const carousel_container = common.create_dom_element({
                element_type: "div",
                class_name: "identifying_items_carousel",
                parent: panel_wrapper
            })
            for (let h = 0; h < main_images.length; h++) {

                const image_data = main_images[h]
                const current_image = image_data.image
                const current_image_thumb = image_data.thumb

                const image_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "image_container",
                    parent: carousel_container
                })

                // image
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image",
                    src: current_image_thumb,
                    parent: image_container
                })
                page.build_image_with_background_color(current_image_thumb, image_container)
                    .then(function (response) {

                        const img = response.img

                        // set item_wrapper format class vertical / horizontal
                        image_container.classList.add(response.format)

                        // set as loaded
                        image.classList.add('loaded')

                        // hi-res image set
                        setTimeout(function () {
                            image.src = current_image
                        }, 10)
                    })

                // audiovisual case
                if (image_data.type === 'audiovisual') {

                    image_container.classList.add("play_video")

                    // open video_player on click
                    image.addEventListener("click", function (e) {

                        const video_url = image_data.src
                        const posterframe_url = image_data.thumb

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
            }

            // active carousel
            render_panels.activate_carousel(carousel_container)

        }//end if (main_images && main_images.length>0)

        // gallery container
        const gallery_container = common.create_dom_element({
            element_type: "div",
            class_name: "gallery " + type,
            parent: panel_wrapper
        })

        // list_factory
        // set as caller (mandatory for list_factory call and to pass to list_row_builder)
        self.view_mode = view_mode

        const list_data = row.list_data
        self.list = self.list || new list_factory() // creates / get existing instance of list
        self.list.init({
            target: container,
            data: list_data,
            fn_row_builder: self.list_row_builder,
            pagination: false, // false to disable, null to defaults
            caller: self
        })
        self.list.render_list()
            .then(function (list_node) {
                // finish(list_node)
                gallery_container.appendChild(list_node)
                // rendered event
                event_manager.publish('rendered', {
                    rows_list_container: gallery_container,
                    view_mode: view_mode
                })
            })



        return fragment
    },//end panel_gallery



    /**
    * ACTIVATE_CAROUSEL
    */
    activate_carousel: function (image_wrap, options = {}) {

        const autoplay = options.autoplay || false
        const autoplaySpeed = options.autoplaySpeed || 4000
        const speed = options.speed || 1600
        const arrows = options.arrows || false
        const fade = typeof options.fade !== 'undefined' ? options.fade : true
        const dots = typeof options.dots !== 'undefined' ? options.dots : true

        common.when_in_dom(image_wrap, function () {
            // config info: https://kenwheeler.github.io/slick/
            $(image_wrap).slick({
                // adaptiveHeight	: true,
                autoplay: autoplay,
                autoplaySpeed: autoplaySpeed,
                speed: speed,
                arrows: arrows,
                fade: fade,
                dots: dots,
                waitForAnimate: false
            })
        })

        return true
    },//endactivate_carousel



    /**
    * ANIMABLE_ITEM
    * Call as: self.animable_item(image_wrap, "animate-image-reveal")
    * @return
    */
    animable_item: function (node, animation_css, orientation, callback) {

        // vars
        animation_css = typeof animation_css !== "undefined"
            ? animation_css
            : "animate-image-reveal" // default

        orientation = typeof orientation !== "undefined"
            ? orientation
            : "" // default

        node.classList.add("hide_opacity")

        common.when_in_dom(node, function () {

            const observer = new IntersectionObserver(function (entries) {
                const entry = entries[0]
                if (entry.isIntersecting === true || entry.intersectionRatio > 0) {
                    node.classList.add(animation_css, orientation)
                    observer.disconnect();
                    if (typeof callback === "function") {
                        callback(node)
                    }
                }
            }, { threshold: [0] });
            observer.observe(node);
        })

        return true
    },//end animable_item



    /**
    * RENDER_GROUP_SELECTOR
    * @return DOM node fragment
    */
    render_group_selector: function (rows, label) {

        const fragment = new DocumentFragment();

        const wrapper = common.create_dom_element({
            element_type: "div",
            class_name: "group_selector",
            parent: fragment
        })

        // label
        const label_text = label || (tstring.filter || 'Filter')
        const node_label = common.create_dom_element({
            element_type: 'label',
            inner_html: label_text,
            parent: wrapper
        })

        // selector
        const node_select = common.create_dom_element({
            element_type: 'select',
            parent: wrapper
        })
        common.create_dom_element({
            element_type: 'option',
            value: '*',
            inner_html: tstring.all || 'All',
            parent: node_select
        })
        for (let i = 0; i < rows.length; i++) {
            common.create_dom_element({
                element_type: 'option',
                value: rows[i].title,
                inner_html: rows[i].title,
                parent: node_select
            })
        }
        node_select.addEventListener("change", function (e) {
            if (e.target.value) {
                event_manager.publish('group_selector_changed', {
                    value: e.target.value
                })
            }
        })

        const node_arrow = common.create_dom_element({
            element_type: 'div',
            class_name: "select_arrow",
            parent: wrapper
        })


        return fragment
    },//end render_group_selector



}//end render_panels
