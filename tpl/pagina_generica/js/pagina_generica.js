"use strict";



var generic = {



    /**
    * VARS
    */
    video_player: null,



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
                })
        }

        // children render
        if (children_container && row.children && row.children.length > 0) {

            // get children info
            page.get_records({
                table: 'ts_web_mupreva',
                //sql_filter: 'parents LIKE \'%"' + row.term_id + '"%\' && template_name=\'item\'',
                sql_filter: 'parents LIKE \'%"' + row.term_id + '"%\' && web_path is null',
                parser: page.parse_ts_web
            })
                .then(function (rows) {
console.log(rows)
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
                ar_promises.push(self.render_item(row, i))
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
    render_item: function (row, key) {
        // console.log("row:",row);
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

            // team custom
            if (self.row.web_path === 'team') {
                // blur animation trigger on enter in visible screen area
                const observer = new IntersectionObserver(function (entries) {
                    // if(entries[0].isIntersecting === true) {}
                    const entry = entries[0]
                    if (entry.isIntersecting === true || entry.intersectionRatio > 0) {
                        identify_image.classList.add('animate_blur')
                        // observer.unobserve(entry.target);
                        observer.disconnect();
                    }
                }, { threshold: [0] });

                observer.observe(identify_image);

                // sequenced circle color
                // const color = page.colors.sort(() => Math.random() - 0.5)
                const color_length = page.colors.length
                const color_key = (key < color_length)
                    ? key
                    : (function () {
                        const factor = Math.floor((key) / color_length) || 1
                        const new_key = key - (color_length * factor)
                        return new_key
                    })()
                const color_name = page.colors[color_key]
                identify_image.classList.add('line_' + color_name)
            }


            // block_text
            const block_text = common.create_dom_element({
                element_type: "div",
                class_name: "block_text",
                parent: fragment
            })

            // term
            const term = common.create_dom_element({
                element_type: "h3",
                class_name: "title term",
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




}//end generic
