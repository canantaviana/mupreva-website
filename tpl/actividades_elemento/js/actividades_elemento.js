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

        // export_data_buttons (define before load_data to prepare the event subscribe)
        const export_data_buttons = page.render_export_data_buttons()

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
                // append export data buttons
                document.getElementById("export_data_container").appendChild(export_data_buttons);

                viewInit();

            })

        // events
        /*event_manager.subscribe('image_selected', image_selected)
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
        }*/


        return true
    },//end init



    /**
    * ACTIVATE_ITEM_LABEL
    * @param object row
    * @return bool true
    */
    activate_item_label: function (row) {

        const self = this

        const item_label = document.getElementById("item_label")
        const title_container = document.getElementById("title_container")
        if (row && item_label && title_container) {

            // append image
            if (row.image_url_thumb) {
                const image = common.create_dom_element({
                    element_type: "img",
                    class_name: "image_header",
                    src: row.image_url_thumb,
                    parent: item_label
                })
            }

            // append title to header bar
            const title_node = title_container.firstChild.cloneNode(true)
            if (!title_node) { return false }
            item_label.appendChild(title_node)

            // check title container top position to show/hide the title
            // document.addEventListener("scroll", (e) => {
            // 	const rect = title_container.getBoundingClientRect();
            // 	// console.log(rect.top, rect.right, rect.bottom, rect.left);
            // 	if(rect.top<=30){
            // 		item_label.classList.add('curtain_in')
            // 	}else{
            // 		item_label.classList.remove('curtain_in')
            // 	}
            // })

            // Throttling check title container top position
            function check_menu(top) {
                if (top <= 30) {
                    item_label.classList.add('curtain_in')
                } else {
                    item_label.classList.remove('curtain_in')
                }
            }

            let lastScrollPosition = window.scrollY || 0
            let tick = false; // Track whether call is currently in process

            window.addEventListener('scroll', function (e) {
                lastScrollPosition = window.scrollY;
                if (!tick) {
                    window.requestAnimationFrame(function () {
                        const rect = title_container.getBoundingClientRect();
                        check_menu(rect.top);
                        tick = false;
                    });
                    tick = true;
                }
            });

            // first check on page load
            const rect = title_container.getBoundingClientRect();
            check_menu(rect.top)
        } else {
            console.warn("Unable to activate item_label:", item_label, title_container, row.title);
        }

        return true
    },//end activate_item_label



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
                request_body.resolve_portals_custom = {
                    identifying_image_data: 'image',
                    audiovisuals_data: 'audiovisual',
                    images_data: 'image',
                    bibliografia: 'bibliographic_references',
                    documents_data: 'documents',
                    //people_data: '',
                    //related_data: 'activities',
                }
            //}
            data_manager.request({
                body: request_body
            })
                .then((response) => {
                    //correccions de dades
                    const result = response.result.map(function(item){

                        return item;
                    });
                    event_manager.publish('data_request_done', {
                        request_body: request_body,
                        result: result
                    })

                    resolve(response)
                })
        })
    },//end load_data



    absUrl: function(row) {
        return page_globals.__WEB_MEDIA_BASE_URL__ + '/' + row.tpl + '/' + row.section_id;
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
            <p class="copy-message"></p>
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

    datacion(row) {
        const datacion = [];
        if (row.datacion_ini) {
            datacion.push(row.datacion_ini);
        }
        if (row.datacion_fin) {
            datacion.push(row.datacion_fin);
        }
        return datacion;
    },


    templateFields:function(row) {
        var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

        return `
            ${(row.type)?`
            <dt><dt>${tstring.item_tipology}</dt></dt>
            <dd>${row.type}</dd>
            `:''}
            ${(row.place)?`
            <dt>${tstring.item_sala}</dt>
            <dd>${row.place}</dd>
            `:''}
            ${(row.date)?`
            <dt>${tstring.item_data}</dt>
            <dd>${row.date}</dd>
            `:''}
            ${(0)?`
            <dt>${tstring.item_hour}</dt>
            <dd>TODO</dd>
            `:''}
            ${(0)?`
            <dt>${tstring.item_to_public}</dt>
            <dd>TODO</dd>
            `:''}
        `;
    },

    template: function (row) {
        const url = this.absUrl(row);
        return htmlTemplate(`
<div class="fitxa-intro columns is-variable is-8">
    <div class="column flow--xl">
        ${(row.title)?`
        <h1>${row.title}</h1>
        `:''}
        <dl>
            ${this.templateFields(row)}
        </dl>
        ${(row.summary)?`
        <div class="flow">
            ${row.summary}
        </div>
        `:''}
        <p> ${tstring.item_url_perm} <br>
            <a href="${url}">${url}</a>
        </p>
    </div>
    <div class="column is-1 is-hidden-touch is-hidden-desktop-only"></div>
    ${this.renderImages(row)}
</div>
        `);
    },

    renderExport: function() {
        return `
            <div id="export_data_container" class="is-flex is-justify-content-flex-end gap-4 mt-4">
            </div>
        `;
    },

    renderImageButtons: function() {
        return `
            <button type="button" class="button button--icon image-action-zoom">
                <img src="/assets/img/ico-lupa-ampliar.svg" title="${tstring.item_image_zoom}" width="30" height="30">
            </button>
            <button type="button" class="button button--icon image-action-download">
                <img src="/assets/img/ico-descarregar.svg" title="${tstring.item_image_download}" width="30" height="30">
            </button>
            <button type="button" class="button button--icon is-hidden-mobile image-action-fullscreen">
                <img src="/assets/img/ico-pantalla-completa.svg" title="${tstring.item_image_fullscreen}" width="30" height="30">
            </button>
        `;
    },

    isMoneda(row) {
        return (row.nombre_bien === 'Moneda');
    },

    renderImages: function(row) {
        const images = row.identifying_image_data;
        if (images.length === 1) {
            const image = images[0];
            // una imatge
            return `
            <div class="images-group fullscreen__fullheight column is-7-tablet is-half-desktop">
                <figure class="fullscreen__content fullscreen__content--3 has-text-left">
                    <img loading="lazy" class="active" src="${__WEB_MEDIA_ENGINE_URL__+image.image}" data-original="${__WEB_MEDIA_ENGINE_URL__+imgOriginal(image.image)}" alt="${image.title}">
                    <div class="btns is-flex is-justify-content-flex-end gap-5 mt-1">
                        ${this.renderImageButtons()}
                    </div>
                </figure>
                ${this.renderExport()}
            </div>
            `;
        } else if (images.length > 1) {
            //multiples imatges
            return `
            <div class="images-group fullscreen__fullheight column is-7-tablet is-half-desktop">
                <!-- Slider -->
                <div class="fullscreen__content fullscreen__content--1 swiper swiper--fitxa">
                    <div class="swiper-wrapper">
                        ${images.map(function(image){
                            return `
                                <div class="swiper-slide">
                                    <img src="${__WEB_MEDIA_ENGINE_URL__+image.image}" data-original="${__WEB_MEDIA_ENGINE_URL__+imgOriginal(image.image)}" alt="${(image.title)?image.title:''}">
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <!-- Eines -->
                <div class="is-flex is-justify-content-center gap-7 is-relative py-4">
                    <!-- fletxes -->
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                    <!-- /fletxes -->
                    <div class="btns is-flex gap-5">
                        ${this.renderImageButtons()}
                    </div>
                </div>
                <!-- /Eines -->
                <div class="swiper swiper--thumbs">
                    <div class="swiper-wrapper">
                        ${images.map(function(image){
                            return `
                                <div class="swiper-slide">
                                    <img src="${__WEB_MEDIA_ENGINE_URL__+image.image}" alt="${(image.title)?image.title:''}">
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <!-- /Slider -->
                ${this.renderExport()}
            </div>
            `;
        } else {
            //no imatge
            return this.renderExport(row);
        }
    },


    templateInfo: function(row){
        if (!row.description || row.description == '') {
            return null;
        }
        return htmlTemplate(`
            <h2 class="accordion-header">
                <button type="button">${tstring.item_general_info}</button>
            </h2>
            <div class="accordion-content">
                <div class="accordion accordion--secondary">
                ${row.description}
                </div>
            </div>
        `);
    },

    templateResources: function(row){
        if (typeof row.documents_data === 'undefined') {
            row.documents_data = [];
        }
        if (typeof row.audiovisuals_data === 'undefined') {
            row.audiovisuals_data = [];
        }
        if (row.documents_data.length === 0 && row.audiovisuals_data.length === 0) {
            return null;
        }
        return htmlTemplate(`
            <h2 class="accordion-header">
                <button type="button">${tstring.item_resources}</button>
            </h2>
            <div class="accordion-content">
                <div class="accordion accordion--secondary">
                ${row.audiovisuals_data.length > 0?`
                    <h3 class="accordion-header">
                        <button type="button">${tstring.item_audiovisual}</button>
                    </h3>
                    <div class="accordion-content">
                        <ul class="galeria galeria--180x150 link-dn">
                            ${row.audiovisuals_data.map(function(entry){
                                return `
                                <li>
                                    <a href="${__WEB_MEDIA_ENGINE_URL__+entry.video}" data-subtitles="${__WEB_MEDIA_ENGINE_URL__+entry.subtitles}" class="video-popup">
                                        <figure>
                                            <img src="${getPosterframe(__WEB_MEDIA_ENGINE_URL__+entry.video)}" alt="">
                                            <figcaption>${entry.title}</figcaption>
                                        </figure>
                                    </a>
                                </li>
                                `;
                            }).join('')}
                        </ul>

                    </div>
                `:''}
                ${row.documents_data.length > 0?`
                    <h3 class="accordion-header">
                        <button type="button">${tstring.item_documents}</button>
                    </h3>
                    <div class="accordion-content">
                        <div class="text-base">
                            <ul>
                                ${row.documents_data.map(function(entry){
                                    return `
                                    <li><a target="_blank" href="${__WEB_MEDIA_ENGINE_URL__+entry.document}">${entry.title}</a></li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                `:''}
                </div>
            </div>
        `);
    },

    templateGaleria: function(row){
        var self = this;
        if (!row.images_data || row.images_data.length == 0) {
            return '';
        }
        return htmlTemplate(`
            <h2 class="accordion-header">
                <button type="button">${tstring.item_galery}</button>
            </h2>
            <div class="accordion-content">
                <ul class="galeria galeria--242x242 link-dn">
                ${row.images_data.map(function(object){
                    return self.templateGaleryElem(object);
                }).join('')}
                </ul>
            </div>
        `);
    },

    templateGaleryElem: function (row) {
        var image_url = '/assets/img/placeholder.png';
        if (row.image) {
            image_url = __WEB_MEDIA_ENGINE_URL__+row.image;
        }
        return `
        <li>
            <a href="${image_url}" target="_blank">
                <figure>
                    <img loading="lazy" src="${image_url}" alt="">
                    ${(row.footprint)?`
                    <figcaption>${row.footprint}</figcaption>
                    `:''}
                </figure>
            </a>
        </li>
        `;
    },//end list_row_builder


    templateRelated: function(row){
        //TODO: passar a camp patrimonio_relacionado
        return '';
        return htmlTemplate(`
            <h2 class="accordion-header">
                <button type="button">${tstring.item_rel_content}</button>
            </h2>
            <div class="accordion-content">
                <ul class="galeria galeria--242x242 link-dn">
                ${row.children.map(function(object){
                    return self.template_catalog_elem(object);
                }).join('')}
                </ul>
            </div>
        `);

    },

    templateActivitiesRelated: function(row){
        //TODO
        return '';
        return htmlTemplate(`
            <h2 class="accordion-header">
                <button type="button">${tstring.item_rel_content}</button>
            </h2>
            <div class="accordion-content">
                <ul class="galeria galeria--242x242 link-dn">
                ${row.children.map(function(object){
                    return self.template_catalog_elem(object);
                }).join('')}
                </ul>
            </div>
        `);

    },

    templateCredits: function(row){
        //TODO
        return '';
        return htmlTemplate(`
            <h2 class="accordion-header">
                <button type="button">${tstring.item_rel_content}</button>
            </h2>
            <div class="accordion-content">
                <ul class="galeria galeria--242x242 link-dn">
                ${row.children.map(function(object){
                    return self.template_catalog_elem(object);
                }).join('')}
                </ul>
            </div>
        `);

    },

    templateBibliografyEntry: function(entry) {
        return biblio_row_fields.render_row_bibliography(entry);
    },

    templateBiblio: function(target, row){
        const self = this;
        if (!row.bibliografia || row.bibliografia.length == 0) {
            return null;
        }
        const template = htmlTemplate(`
        <h2 class="accordion-header">
            <button type="button">${tstring.item_bibliografy}</button>
        </h2>
        <div class="accordion-content">
            <div class="text-base flow">
                <ul>
                </ul>
            </div>
        </div>
        `);
        const ul = template[2].querySelector('ul');
        row.bibliografia.forEach(function(entry){
            ul.appendChild(self.templateBibliografyEntry(entry));
        })
        appendTemplate(target, template);
    },

    /**
    * LIST_ROW_BUILDER
    * Build DOM nodes to insert into list pop-up
    */
    template_catalog_elem: function (row) {
        row.tpl = page.section_tipo_to_template(row.section_tipo);
        const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
        var image_url = '/assets/img/placeholder.png';
        if (row.imagenes_identificativas.length > 0) {
            image_url = __WEB_MEDIA_ENGINE_URL__+row.imagenes_identificativas[0].image;
        }
        return `
        <li class="${row.tpl}">
            <a href="${url}" target="_blank">
                <figure>
                    <img loading="lazy" src="${image_url}" alt="">
                    ${(row.titulo)?`
                    <figcaption>${row.titulo}</figcaption>
                    `:''}
                </figure>
            </a>
        </li>
        `;
    },//end list_row_builder



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

        const acordion = common.create_dom_element({
            element_type: 'div',
            class_name: 'accordion accordion--primary mt-9'
        })
        target.appendChild(acordion);
console.log(row);
        //info
        appendTemplate(acordion, this.templateInfo(row));

        //audiovisual
        appendTemplate(acordion, this.templateResources(row));

        //galeria
        appendTemplate(acordion, this.templateGaleria(row));

        //activitas relacionat
        appendTemplate(acordion, this.templateActivitiesRelated(row));

        //contigut relacionat
        appendTemplate(acordion, this.templateRelated(row));

        //credits
        appendTemplate(acordion, this.templateCredits(row));

        //bibliografia
        //this.templateBiblio(acordion, row);

    },//end render

    /**
    * LOAD_RELATIONS
    * Load database relations from term_id
    * @return promise
    */
    load_relations: function (term_id, table) {

        const ar_fields = ['*']
        const lang = page_globals.WEB_CURRENT_LANG_CODE
        const sql_filter = "term_id='" + term_id + "'"

        table = table.length > 0
            ? table
            : page.ts_tables

        return new Promise(function (resolve) {

            // request
            data_manager.request({
                body: {
                    dedalo_get: 'records',
                    db_name: page_globals.WEB_DB,
                    table: table,
                    ar_fields: ar_fields,
                    lang: lang,
                    sql_filter: sql_filter,
                    limit: 0,
                    count: false
                }
            })
                .then((api_response) => {
                    const relations_data = api_response.result && api_response.result.length > 0
                        ? page.parse_tree_data(api_response.result, null)
                        : null

                    resolve(relations_data)
                })
        })
    },//load_relations render

}//end thesaurus
