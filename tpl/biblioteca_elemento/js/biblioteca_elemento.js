/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page, forms, document, DocumentFragment, console, _form */
/*eslint no-undef: "error"*/
/*jshint esversion: 6 */
"use strict";



var item = {


    // section id
    section_id: null,

    // table (objects | pictures)
    table: null,

    // target DOM node
    target: null,

    // footer_info (default hidden)
    footer_info: null,



    /**
    * INIT
    * @return bool true
    */
    init: function (options) {

        const self = this

        // options
        self.table = options.table // string (objects / pictures)
        self.section_id = options.section_id // int
        self.target = options.target // DOM node

        // load and render
        self.load_data({})
            .then(function (response) {

                if (!response.result || response.result.length < 1) {
                    self.target.innerHTML = `<div class="not_found">Sorry, record not available (${self.section_id})</div>`
                    console.warn("self.target:", self.target);
                    return
                }

                const data = page.parse_list_data(response.result)
                const row = data[0] || null
                self.render({
                    row: row,
                    target: self.target
                })
                viewInit();
            })

        // events
        event_manager.subscribe('image_selected', image_selected)
        function image_selected(data) {

            const item = data.item

            if (!self.footer_info) {
                console.warn("No self.footer_info is set", self.footer_info);
                return false
            }

            if (item.footer && item.footer.length > 0) {

                const footer = item.footer

                self.footer_info.innerHTML = footer
                self.footer_info.classList.remove("hide")
            } else {
                self.footer_info.innerHTML = ''
                self.footer_info.classList.add("hide")
            }
        }


        return true
    },//end init

    /**
    * LOAD_DATA
    * @return promise
    */
    load_data: function (options) {

        const self = this

        const default_fields = ['*']

        // options
        const table = options.table || self.table
        const section_id = options.section_id || self.section_id
        const ar_fields = options.ar_fields || default_fields || ["*"]
        const lang = options.lang || page_globals.WEB_CURRENT_LANG_CODE
        const sql_filter = options.filter || ('section_id=' + parseInt(section_id))

        return new Promise(function (resolve) {

            // request
            const request_body = {
                dedalo_get: 'records',
                db_name: page_globals.WEB_DB,
                table: table,
                ar_fields: ar_fields,
                lang: lang,
                sql_filter: sql_filter,
                limit: 1,
                count: false
                // resolve_portals_custom : {
                // 	audiovisual :"audiovisual"
                // }
            }
            //if (table === 'sets') {
                /*request_body.resolve_portals_custom = {
                    imagenes_identificativas: 'image',
                    //imagenes: 'image',
                    //medidas: 'measures',
                    //bibliografia_propia: 'measures'
                    //bibliografia_relacionada: 'measures'
                }*/
            //}
            data_manager.request({
                body: request_body
            })
                .then((response) => {
                    event_manager.publish('data_request_done', {
                        request_body: request_body,
                        result: response.result
                    })

                    resolve(response)
                })
        })
    },//end load_data

    absUrl: function(row) {
        return page_globals.__WEB_MEDIA_BASE_URL__ + '/publication/' + row.section_id;
    },

    templateShare: function (row) {
        const url = this.absUrl(row);
        const title = row.titulo;
        return htmlTemplate(`
<div class="has-text-right-tablet mb-3">
    <span class="simple-tooltip-container"><button type="button" class="js-tooltip button button--icon button--compartir" data-tooltip-prefix-class="simple-tooltip" data-tooltip-content-id="compartir" data-tooltip-title="Compartir URL" data-tooltip-close-text="${tstring.close}" id="label_tooltipnk434h0i7m">${tstring.share_title}</button></span>
    <div id="compartir" class="is-hidden">
        <div class="my-7 flow">
            <p>${tstring.share_copy_desc}</p>
            <button type="button" class="button button--copiar" data-copy-url="${url}">${tstring.share_copy_link}</button>
        </div>
        <div class="flow">
            <p>${tstring.share_other_desc}</p>
            <ul class="is-flex is-flex-wrap-wrap gap-3">
                <li>
                    <a href="https://twitter.com/intent/tweet?url=${encodeURI(url)}&text=${encodeURI(title)}" target="_blank">
                        <img src="/assets/img/ico-twitter.svg" alt="X" width="40" height="40">
                    </a>
                </li>
                <!-- li>
                    <a href="#" target="_blank">
                        <img src="/assets/img/ico-instagram.svg" alt="Instagram" width="44" height="44">
                    </a>
                </li -->
                <!-- li>
                    <a href="#" target="_blank">
                        <img src="/assets/img/ico-youtube.svg" alt="YouTube" width="44" height="44">
                    </a>
                </li -->
                <li>
                    <a href="https://www.facebook.com/sharer.php?u=${encodeURI(url)}" target="_blank">
                        <img src="/assets/img/ico-facebook.svg" alt="Facebook" width="40" height="40">
                    </a>
                </li>
            </ul>
        </div>
    </div>
</div>
        `);
    },


    template: function (row) {
        const url = this.absUrl(row);
        return htmlTemplate(`
<div class="fitxa-intro columns is-variable is-8">
    <div class="column flow--xl">
        <h1>${row.titulo}</h1>
        <dl>
            ${(row.autor)?`
            <dt>${tstring.item_author}</dt>
            <dd><a href="/biblio/">${row.autor}</a></dd>
            `:''}
            ${(row.fecha_publicacion)?`
            <dt>${tstring.item_year}</dt>
            <dd>${row.fecha_publicacion}</dd>
            `:''}
            ${(row.serie)?`
            <dt>${tstring.item_serie}</dt>
            <dd><a href="/biblio/">${row.serie}</a>
            ${(row.num_serie)?`
            ${tstring.item_num} ${row.num_serie}
            `:''}
            </dd>
            `:''}
            ${(row.num_paginas)?`
            <dt>${tstring.item_pages}</dt>
            <dd>${row.num_paginas}</dd>
            `:''}
        </dl>
        ${(row.descripcion)?`
        <div class="flow">
            ${row.descripcion}
        </div>
        `:''}
        <p> ${tstring.item_url_perm} <br>
            <a href="${url}">${url}</a>
        </p>
    </div>
    <div class="column is-1 is-hidden-touch is-hidden-desktop-only"></div>
    <div class="fullscreen__fullheight images-group column is-7-tablet is-half-desktop">
    ${(row.imagen_identificativa)?`
        <figure class="fullscreen__content fullscreen__content--3 has-text-left">
            <img loading="lazy" class="active" src="${__WEB_MEDIA_ENGINE_URL__+row.imagen_identificativa}" data-original="${__WEB_MEDIA_ENGINE_URL__+imgOriginal(row.imagen_identificativa)}" alt="${row.titulo}">
            <!-- Eines -->
            <div class="is-flex gap-5 mt-2">
                <button type="button" class="button button--icon image-action-download">
                    <img src="/assets/img/ico-descarregar.svg" alt="" width="30" height="30"> ${tstring.item_download}
                </button>
                <button type="button" class="button button--icon image-action-zoom">
                    <img src="/assets/img/ico-lupa-2.svg" alt="" width="30" height="30"> ${tstring.item_show_online}
                </button>
            </div>
            <!-- /Eines -->
        </figure>
    `:''}
    </div>
</div>
        `);
    },

    templateContent: function (row) {
        //TODO
        return '';
        return htmlTemplate(`
<div class="flow--xl mt-8">
    <h2 class="is-size-3">${tstring.item_content}</h2>
</div>
        `);
    },

    templateRelated: function (row) {
        //TODO
        return '';
        return htmlTemplate(`
    <h2 class="accordion-header">
        <button type="button">${tstring.item_rel_content}</button>
    </h2>
    <div class="accordion-content">
    </div>
        `);
    },

    /**
    * RENDER
    * @return promise
    */
    render: function (options) {

        const self = this

        const target = options.target
        const row = options.row

        appendTemplate(target, this.templateShare(row));
        appendTemplate(target, this.template(row));
        appendTemplate(target, this.templateContent(row));

        const acordion = common.create_dom_element({
            element_type: 'div',
            class_name: 'accordion accordion--primary mt-9'
        })
        target.appendChild(acordion);
        appendTemplate(acordion, this.templateRelated(row));

    },//end render

}//end thesaurus
