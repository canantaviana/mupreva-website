// render_page.js




/**
* RENDER_TS_WEB_MEDIA_BLOCK
*/
page.render_ts_web_media_block = function (row, caller) {

    const self = this

    const fragment = new DocumentFragment()

    // other_images_resolved
    if (row.other_images_resolved && row.other_images_resolved.length > 0) {


        for (let i = 0; i < row.other_images_resolved.length; i++) {

            const media_block_item = common.create_dom_element({
                element_type: "div",
                class_name: "media_block_item qdp_button",
                parent: fragment
            })

            const image_url = row.other_images_resolved[i].url

            page.build_image_with_background_color(image_url, media_block_item)
                .then(function (response) {

                    const img = response.img

                    // append thumb image
                    media_block_item.appendChild(img)

                    // lightbox
                    img.addEventListener("click", function (e) {
                        const c_image = common.create_dom_element({
                            element_type: "img",
                            src: image_url
                        })
                        page.build_image_with_background_color(image_url, c_image).then(function () {
                            // on render, place it in overlay div like shadow box
                            page.open_player_with_overlay(document.body, c_image)
                        })
                    })
                })
        }
    }

    // audiovisual_resolved
    if (row.audiovisual_resolved && row.audiovisual_resolved.length > 0) {
        for (let i = 0; i < row.audiovisual_resolved.length; i++) {

            const media_block_item = common.create_dom_element({
                element_type: "div",
                class_name: "media_block_item qdp_button",
                parent: fragment
            })

            const image_url = row.audiovisual_resolved[i].posterframe
            const video_url = row.audiovisual_resolved[i].url

            page.build_image_with_background_color(image_url, media_block_item)
                .then(function (response) {

                    const img = response.img

                    img.addEventListener("click", function (e) {

                        // load video
                        self.video_player = self.video_player || new video_player() // creates / get existing instance of player
                        self.video_player.init({
                            video_url: video_url,
                            posterframe_url: image_url,
                            mode: "default"
                        })
                        self.video_player.render()
                            .then(function (video_player_wrapper) {
                                // on render, place it in overlay div like shadow box
                                page.open_player_with_overlay(document.body, video_player_wrapper)
                            })
                    })

                    // append thumb image
                    media_block_item.appendChild(img)
                })
        }
    }

    // pdf_resolved
    if (row.pdf_resolved && row.pdf_resolved.length > 0) {
        for (let i = 0; i < row.pdf_resolved.length; i++) {

            const pdf_url = row.pdf_resolved[i].url
            const pdf_title = row.pdf_title[i] || ''

            const media_block_item = common.create_dom_element({
                element_type: "div",
                class_name: "media_block_item qdp_button documents",
                parent: fragment
            })

            const link = common.create_dom_element({
                element_type: 'a',
                class_name: '',
                href: pdf_url,
                target: '_blank',
                parent: media_block_item
            })

            common.create_dom_element({
                element_type: 'img',
                class_name: 'icon_pdf',
                src: __WEB_TEMPLATE_WEB__ + '/assets/images/icon_pdf.svg',
                parent: link
            })
            common.create_dom_element({
                element_type: "div",
                class_name: "pdf_title truncate_text",
                inner_html: pdf_title,
                parent: link
            })
        }
    }


    if (fragment.children.length > 0) {

        const media_block = common.create_dom_element({
            element_type: "div",
            class_name: "media_block"
        })
        media_block.appendChild(fragment)

        return media_block
    }


    return null
};//end render_ts_web_media_block



/**
* RENDER_EXPORT_DATA_BUTTONS
* @return promise : DOM node
*/
page.render_export_data_buttons = function () {

    let request_body
    let result

    function get_data() {

        const data_object = {
            source_org: page_globals.WEB_ENTITY_LABEL,
            source_url: page_globals.__WEB_BASE_URL__,
            lang: page_globals.WEB_CURRENT_LANG_CODE,
            date: common.get_today_date()
        }

        return new Promise(function (resolve) {

            // result or request_body are invalid
            if (!request_body) {
                console.warn("Invalid result or request_body:", request_body);
                return null
            }

            // if result is not limited, we can use directly
            // if (request_body.limit==0) {
            // 	// parsed rows
            // 	data_object.data = page.export_parse_catalog_data(rows)
            // 	resolve(data_object)
            // }

            // get new request without limit
            request_body.limit = 0
            request_body.resolve_portals_custom = null
            data_manager.request({
                body: request_body
            })
                .then(function (api_response) {
                    resolve(api_response.result)
                })
        })
            .then(function (rows) {

                // parsed rows
                data_object.data = page.export_parse_catalog_data(rows)

                return data_object
            })
    }

    // event data_request_done is triggered when new search is done
    event_manager.subscribe('data_request_done', data_request_done)
    function data_request_done(options) {
        request_body = options.request_body
        result = options.result
    }


    const fragment = new DocumentFragment()

    // button_export_json
    const button_export_json = common.create_dom_element({
        element_type: "button",
        type: "button",
        text_content: tstring.export_json || 'Export JSON',
        class_name: "button button--simple",
        parent: fragment
    })
    button_export_json.addEventListener("click", function () {

        const button = this

        // spinner on
        button.disabled = true;

        get_data().then(function (data) {

            const file_name = 'export_data.json'

            // Blob data
            const blob_data = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
                name: file_name
            });

            // create a temporal a node and trigger click
            const href = URL.createObjectURL(blob_data)
            const link_obj = common.create_dom_element({
                element_type: "a",
                href: href,
                download: file_name
            })
            link_obj.click()

            // destroy temporal node
            link_obj.remove()

            button.disabled = false;
        })
    })

    // button_export_csv
    const button_export_csv = common.create_dom_element({
        element_type: "button",
        type: "button",
        text_content: tstring.export_csv || 'Export CSV',
        class_name: "button button--simple",
        parent: fragment
    })
    button_export_csv.addEventListener("click", function () {

        const button = this

        // spinner on
        button.disabled = true;

        get_data().then(function (data) {

            const file_name = 'export_data.csv'

            // Convert JSON obj to csv
            const csv = page.convert_json_to_csv(data.data)

            // Blob data
            const blob_data = new Blob([csv], {
                type: 'text/csv',
                name: file_name
            });

            // create a temporal a node and trigger click
            const href = URL.createObjectURL(blob_data)
            const link_obj = common.create_dom_element({
                element_type: "a",
                href: href,
                download: file_name
            })
            link_obj.click()

            // destroy temporal node
            link_obj.remove()

            button.disabled = false;
        })
    })

    return fragment
};//end render_export_data_buttons



/**
* RENDER_DOWNLOAD_LICENSE
* @return promise : DOM node
*/
page.render_download_license = function (callback) {

    const self = this

    return new Promise(function (resolve) {

        const request_body = {
            dedalo_get: 'records',
            table: 'ts_web',
            ar_fields: ['*'],
            sql_filter: "web_path='download_license'",
            limit: 1,
            count: false
        }
        data_manager.request({
            body: request_body
        })
            .then(function (api_response) {

                if (!api_response.result) {
                    resolve(false)
                    return
                }

                const row = api_response.result[0]

                const download_license_wrapper = common.create_dom_element({
                    element_type: "div",
                    class_name: "download_license_wrapper float_dialog"
                })
                download_license_wrapper.addEventListener("click", function (e) {
                    download_license_wrapper.remove()
                })
                const container = common.create_dom_element({
                    element_type: "div",
                    class_name: "download_license_container float_dialog_container",
                    parent: download_license_wrapper
                })
                container.addEventListener("click", function (e) {
                    e.stopPropagation()
                })
                const title_node = common.create_dom_element({
                    element_type: "h1",
                    class_name: "title",
                    inner_html: row.title,
                    parent: container
                })
                const abstract_node = common.create_dom_element({
                    element_type: "div",
                    class_name: "abstract",
                    inner_html: row.abstract,
                    parent: container
                })
                const body_node = common.create_dom_element({
                    element_type: "div",
                    class_name: "body",
                    inner_html: row.body,
                    parent: container
                })

                const buttons_node = common.create_dom_element({
                    element_type: "div",
                    class_name: "buttons_node",
                    parent: container
                })
                const button_ok = common.create_dom_element({
                    element_type: "input",
                    type: "button",
                    class_name: "btn btn-light btn-block primary button_ok  qdp_green",
                    value: tstring.aceptar || "Agree",
                    parent: buttons_node
                })
                button_ok.addEventListener("click", function (e) {

                    // spinner on
                    button_ok.classList.add("unactive")
                    abstract_node.classList.add("unactive")
                    body_node.classList.add("unactive")
                    const spinner = common.create_dom_element({
                        element_type: "div",
                        class_name: "spinner",
                        parent: buttons_node
                    })

                    // exec callback (result could be a promise or not)
                    const response = callback()

                    // force result as promise and then remove download_license node
                    Promise.resolve(response)
                        .then(function (response) {
                            download_license_wrapper.remove()
                        })
                })
                const button_cancel = common.create_dom_element({
                    element_type: "input",
                    type: "button",
                    class_name: "btn btn-light btn-block primary button_cancel color_grey_medium",
                    value: tstring.cancel || "Cancel",
                    parent: buttons_node
                })
                button_cancel.addEventListener("click", function (e) {
                    download_license_wrapper.remove()
                })

                resolve(download_license_wrapper)
            })
    })
};//end render_download_license



/**
* RENDER_SHARE_URL_DIALOG
* @return bool true
*/
page.render_share_url_dialog = function () {

    const uri = window.location;

    const self = this

    return new Promise(function (resolve) {

        const request_body = {
            dedalo_get: 'records',
            table: 'ts_web',
            ar_fields: ['*'],
            sql_filter: "web_path='share_url'",
            limit: 1,
            count: false
        }
        data_manager.request({
            body: request_body
        })
            .then(function (api_response) {

                if (!api_response.result) {
                    resolve(false)
                    return
                }

                const row = api_response.result[0]

                // Shared wrapper
                const shared_wrapper = common.create_dom_element({
                    element_type: "div",
                    class_name: "shared_wrapper float_dialog",
                    parent: document.body
                })
                shared_wrapper.addEventListener("click", function (e) {
                    shared_wrapper.remove()
                })

                // Shared container
                const shared_container = common.create_dom_element({
                    element_type: "div",
                    class_name: "shared_container float_dialog_container",
                    parent: shared_wrapper
                })
                shared_container.addEventListener("click", function (e) {
                    e.stopPropagation()
                })

                // text
                const title_node = common.create_dom_element({
                    element_type: "h1",
                    class_name: "title",
                    inner_html: row.title,
                    parent: shared_container
                })
                if (row.abstract && row.abstract.length > 1) {
                    const abstract_node = common.create_dom_element({
                        element_type: "div",
                        class_name: "abstract",
                        inner_html: row.abstract,
                        parent: shared_container
                    })
                }
                if (row.body && row.body.length > 1) {
                    const body_node = common.create_dom_element({
                        element_type: "div",
                        class_name: "body",
                        inner_html: row.body,
                        parent: shared_container
                    })
                }

                // sharing_copy
                const sharing_copy = common.create_dom_element({
                    element_type: "div",
                    class_name: "sharing_copy",
                    parent: shared_container
                })

                // url_input
                const url_input = common.create_dom_element({
                    element_type: "input",
                    type: "text",
                    class_name: "url_input",
                    value: uri,
                    parent: sharing_copy
                })
                url_input.setAttribute('readonly', 'readonly')

                // button_copy
                const button_copy = common.create_dom_element({
                    element_type: "button",
                    class_name: "btn btn-light btn-block primary qdp_yellow",
                    inner_html: tstring.copy || 'Copy',
                    parent: sharing_copy
                })
                button_copy.addEventListener("click", function (e) {
                    url_input.select();
                    document.execCommand("copy");
                    const alert_text = (tstring.copied || 'Copied') + " !";
                    alert(alert_text);
                    url_input.blur()
                })

                // social_share
                const social_share = common.create_dom_element({
                    element_type: "div",
                    class_name: "social_share",
                    parent: shared_container
                })

                // sharing_facebook
                const sharing_facebook = common.create_dom_element({
                    element_type: "div",
                    class_name: "sharing_facebook social_share_item",
                    parent: social_share
                })

                // icon Facebook
                const icon_facebook = common.create_dom_element({
                    element_type: 'img',
                    src: __WEB_TEMPLATE_WEB__ + '/assets/images/logo_facebook.svg',
                    parent: sharing_facebook
                })
                icon_facebook.addEventListener("click", function (e) {
                    const fb_url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(uri)
                    window.open(fb_url, '_blank').focus();
                })

                // sharing_instagram
                // const sharing_instagram = common.create_dom_element({
                // 	element_type	: "div",
                // 	class_name		: "sharing_instagram social_share_item",
                // 	parent			: social_share
                // })

                // // icon instagram
                // 	const icon_instagram = common.create_dom_element({
                // 		element_type	: 'img',
                // 		class_name		: "",
                // 		src				: __WEB_TEMPLATE_WEB__ + '/assets/images/logo_instagram.svg',
                // 		parent			: sharing_instagram
                // 	})
                // 	icon_instagram.addEventListener("click", function(e){
                // 		const fb_url = 'https://www.instagram.com/sharer/sharer.php?u=' + encodeURIComponent(uri)
                // 		window.open(fb_url, '_blank').focus();
                // 	})

                // sharing_twiter
                const sharing_twiter = common.create_dom_element({
                    element_type: "div",
                    class_name: "sharing_twiter social_share_item",
                    parent: social_share
                })

                // icon twitter
                const icon_twiter = common.create_dom_element({
                    element_type: 'img',
                    class_name: "",
                    src: __WEB_TEMPLATE_WEB__ + '/assets/images/logo_twiter.svg',
                    parent: sharing_twiter
                })
                icon_twiter.addEventListener("click", function (e) {
                    const text = encodeURIComponent('Museu virtual de Quart de Poblet')
                    const fb_url = 'http://twitter.com/share?text=' + text + '&url' + encodeURIComponent(uri)
                    window.open(fb_url, '_blank').focus();
                })

                resolve(shared_wrapper)
            })
    });
};//end render_share_url_dialog
