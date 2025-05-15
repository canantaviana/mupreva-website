"use strict";

var templateModules = {

    fix_names: function(text) {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"").replaceAll(' ', '_');
    },

    render_items: function (rows, term_id) {
        const self = this;
        const elems = rows.filter(function(elem){
            return elem.parent == term_id && elem.template_name != null
        })
        return elems.map(function(elem){
            var template = self.fix_names(elem.template_name);
            if (!self.hasOwnProperty(template)) {
                return null;
            }
            return self[template](elem, rows);
        }).filter(function(elem){
            return elem !== null;
        });
    },

    bloque_de_texto_con_imagen_a_la_derecha: function(info){
        return htmlTemplate(`
            <div class="block-text-img-dreta block-dedalo columns is-widescreen is-variable is-8">
                <div class="column is-5-widescreen flow--l">
                ${(info.title)?
                `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                        ${(info.image_icon && info.image_icon.length > 0)?
                        `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                        :''}
                        ${info.title}
                </h2>`
                :''}
                ${(info.body)?info.body:''}
                </div>
                <div class="column">
                    ${(info.image.length > 0)?
                    `<div class="button-like" data-a11y-dialog-show="dialog-${info.section_id}" role="button" tabindex="0">
                        <img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">
                        <div class="dialog-container" data-a11y-dialog="dialog-${info.section_id}" aria-hidden="true" aria-labelledby="dialog-${info.section_id}-title">
                            <div class="dialog-overlay" data-a11y-dialog-hide></div>
                            <div class="dialog-content" role="document">
                                <button data-a11y-dialog-hide class="dialog-close" aria-label="Tanca aquesta finestra">
                                    <svg width="44" height="44">
                                        <g fill="none" fill-rule="evenodd">
                                            <path d="M0 0h44v44H0z" />
                                            <path stroke="#FFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" d="M33 11 11 33M11 11l22 22" />
                                        </g>
                                    </svg>
                                </button>
                                <img loading="lazy" src="${info.image[0].image}" alt="" class="is-block">
                            </div>
                        </div>
                    </div>`
                    :''}
                </div>
            </div>
        `);
    },
    bloque_de_texto_con_imagen_a_la_izquierda: function(info){
        return htmlTemplate(`

            <div class="block-text-img-esquerra block-dedalo columns is-widescreen is-variable is-8 is-flex-direction-row-reverse">
                <div class="column is-5-widescreen flow--l">
                ${(info.title)?
                `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                        ${(info.image_icon && info.image_icon.length > 0)?
                        `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                        :''}
                        ${info.title}
                </h2>`
                :''}
                ${(info.body)?info.body:''}
                </div>
                <div class="column">
                    ${(info.image.length > 0)?
                    `<div class="button-like" data-a11y-dialog-show="dialog-${info.section_id}" role="button" tabindex="0">
                        <img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">
                        <div class="dialog-container" data-a11y-dialog="dialog-${info.section_id}" aria-hidden="true" aria-labelledby="dialog-${info.section_id}-title">
                            <div class="dialog-overlay" data-a11y-dialog-hide></div>
                            <div class="dialog-content" role="document">
                                <button data-a11y-dialog-hide class="dialog-close" aria-label="Tanca aquesta finestra">
                                    <svg width="44" height="44">
                                        <g fill="none" fill-rule="evenodd">
                                            <path d="M0 0h44v44H0z" />
                                            <path stroke="#FFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" d="M33 11 11 33M11 11l22 22" />
                                        </g>
                                    </svg>
                                </button>
                                <img loading="lazy" src="${info.image[0].image}" alt="" class="is-block">
                            </div>
                        </div>
                    </div>`
                    :''}
                </div>
            </div>
        `);
    },
    bloque_de_texto_con_fondo_gris_y_imagen_a_la_derecha: function(info){
        return htmlTemplate(`
            <div class="block-text-img-dreta-fons-gris full-bleed has-background-grey-light">
                <div class="wrapper">
                    ${(info.title)?
                    `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                            ${(info.image_icon && info.image_icon.length > 0)?
                            `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                            :''}
                            ${info.title}
                    </h2>`
                    :''}
                    <div class="block-dedalo columns is-widescreen is-variable is-8">
                        <div class="column is-5-widescreen flow--l">
                        ${(info.body)?info.body:''}
                        </div>
                        <div class="column">
                            ${(info.image.length > 0)?
                            `<div class="button-like" data-a11y-dialog-show="dialog-${info.section_id}" role="button" tabindex="0">
                                <img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">
                                <div class="dialog-container" data-a11y-dialog="dialog-${info.section_id}" aria-hidden="true" aria-labelledby="dialog-${info.section_id}-title">
                                    <div class="dialog-overlay" data-a11y-dialog-hide></div>
                                    <div class="dialog-content" role="document">
                                        <button data-a11y-dialog-hide class="dialog-close" aria-label="Tanca aquesta finestra">
                                            <svg width="44" height="44">
                                                <g fill="none" fill-rule="evenodd">
                                                    <path d="M0 0h44v44H0z" />
                                                    <path stroke="#FFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" d="M33 11 11 33M11 11l22 22" />
                                                </g>
                                            </svg>
                                        </button>
                                        <img loading="lazy" src="${info.image[0].image}" alt="" class="is-block">
                                    </div>
                                </div>
                            </div>`
                            :''}

                        </div>
                    </div>
                </div>

            </div>
        `);
    },

    bloque_de_texto_con_fondo_gris_y_imagen_a_la_izquierda: function(info){
        return htmlTemplate(`
            <div class="block-text-img-esquerra-fons-gris full-bleed has-background-grey-light">
                <div class="wrapper">
                    ${(info.title)?
                    `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                            ${(info.image_icon && info.image_icon.length > 0)?
                            `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                            :''}
                            ${info.title}
                    </h2>`
                    :''}
                    <div class="block-dedalo columns is-widescreen is-variable is-8 is-flex-direction-row-reverse">
                        <div class="column is-5-widescreen flow--l">
                        ${(info.body)?info.body:''}
                        </div>
                        <div class="column">
                            ${(info.image.length > 0)?
                            `<div class="button-like" data-a11y-dialog-show="dialog-${info.section_id}" role="button" tabindex="0">
                                <img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">
                                <div class="dialog-container" data-a11y-dialog="dialog-${info.section_id}" aria-hidden="true" aria-labelledby="dialog-${info.section_id}-title">
                                    <div class="dialog-overlay" data-a11y-dialog-hide></div>
                                    <div class="dialog-content" role="document">
                                        <button data-a11y-dialog-hide class="dialog-close" aria-label="Tanca aquesta finestra">
                                            <svg width="44" height="44">
                                                <g fill="none" fill-rule="evenodd">
                                                    <path d="M0 0h44v44H0z" />
                                                    <path stroke="#FFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" d="M33 11 11 33M11 11l22 22" />
                                                </g>
                                            </svg>
                                        </button>
                                        <img loading="lazy" src="${info.image[0].image}" alt="" class="is-block">
                                    </div>
                                </div>
                            </div>`
                            :''}
                        </div>
                    </div>
                </div>
            </div>
        `);
    },

    bloque_desplegable: function(info, rows){
        var content = htmlTemplate(`
            <div class="accordion accordion--primary mt-6">
                <h2 id="${this.fix_names(info.title)}" class="accordion-header">
                    <button type="button">${info.title}</button>
                </h2>
                <div class="accordion-content block-dedalo">
                ${(info.body)?info.body:''}
                </div>
            </div>`)
        var children_container = content[0].querySelector('.accordion-content')
        templateModules.render_items(rows, info.term_id).forEach(node => {
            appendTemplate(children_container, node);
        });
        return content;
    },

    bloque_de_tres_columnas_desiguales: function(info, rows){
        var modules = templateModules.render_items(rows, info.term_id);
        var content = htmlTemplate(`
        <div class="flow">
            ${(info.title)?
            `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                ${(info.image_icon && info.image_icon.length > 0)?
                `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                :''}
                ${info.title}
            </h2>`
            :''}
            <div class="block-dedalo columns is-multiline is-variable is-8">
                ${modules.map(function(elem, index){
                    if (index%3 == 2) {
                        return `<div class="column is-full-tablet is-one-third-desktop is-half-widescreen"></div>`;
                    }
                    return `<div class="column"></div>`;
                }).join('')}
            </div>
        </div>
        `);
        var children_container = content[0].querySelectorAll('.block-dedalo div');
        modules.forEach(function(elem, index){
            appendTemplate(children_container[index], elem);
        });
        return content;
    },
    bloque_de_dos_columnas: function(info, rows){
        var modules = templateModules.render_items(rows, info.term_id);
        var content = htmlTemplate(`
        <div class="flow">
            ${(info.title)?
            `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                ${(info.image_icon && info.image_icon.length > 0)?
                `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                :''}
                ${info.title}
            </h2>`
            :''}
            <div class="block-dedalo columns is-variable is-8 is-multiline">
                ${modules.map(function(elem){
                    return `<div class="column is-half-tablet"></div>`;
                }).join('')}
            </div>
        </div>
        `);
        var children_container = content[0].querySelectorAll('.block-dedalo div');
        modules.forEach(function(elem, index){
            appendTemplate(children_container[index], elem);
        });
        return content;
    },

    bloque_de_tres_columnas: function(info, rows){
        var modules = templateModules.render_items(rows, info.term_id);
        var content = htmlTemplate(`
        <div class="flow">
            ${(info.title)?
            `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                ${(info.image_icon && info.image_icon.length > 0)?
                `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                :''}
                ${info.title}
            </h2>`
            :''}
            <div class="block-dedalo columns is-multiline is-variable is-8">
                ${modules.map(function(elem){
                    return `<div class="column is-half-tablet is-one-third-desktop"></div>`;
                }).join('')}
            </div>
        </div>
        `);
        var children_container = content[0].querySelectorAll('.block-dedalo div');
        modules.forEach(function(elem, index){
            appendTemplate(children_container[index], elem);
        });
        return content;
    },

    bloque_de_quatro_columnas: function(info, rows){
        var modules = templateModules.render_items(rows, info.term_id);
        var content = htmlTemplate(`
        <div class="flow">
            ${(info.title)?
            `<h2 id="${this.fix_names(info.title)}" class="is-flex is-align-items-center gap-2 mb-7 has-text-black">
                    ${(info.image_icon && info.image_icon.length > 0)?
                    `<img src="${info.image_icon[0].image}" alt="" width="30" height="30">`
                    :''}
                    ${info.title}
            </h2>`
            :''}
            <div class="block-dedalo columns is-multiline is-variable is-8">
                ${modules.map(function(elem){
                    return `<div class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen"></div>`;
                }).join('')}
            </div>
        </div>
        `);
        var children_container = content[0].querySelectorAll('.block-dedalo div');
        modules.forEach(function(elem, index){
            appendTemplate(children_container[index], elem);
        });
        return content;
    },

    bloque_de_titulo_rojo_mas_texto: function(info){
        return htmlTemplate(`
            <div class="block-titol-vermell-text flow">
                ${(info.title)?
                `<h3>
                    ${info.title}
                </h3>`
                :''}
                ${(info.body)?info.body:''}
            </div>
        `);
    },

    bloque_titulo_mas_imagen_mas_texto: function(info){
        return htmlTemplate(`
            <div class="block-titol-imatge-text flow--l">
                ${(info.title)?
                `<h2 id="${this.fix_names(info.title)}">
                    ${info.title}
                </h2>`
                :''}
                ${(info.image.length > 0)?
                    `<div class="button-like" data-a11y-dialog-show="dialog-${info.section_id}" role="button" tabindex="0">
                        <img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">
                        <div class="dialog-container" data-a11y-dialog="dialog-${info.section_id}" aria-hidden="true" aria-labelledby="dialog-${info.section_id}-title">
                            <div class="dialog-overlay" data-a11y-dialog-hide></div>
                            <div class="dialog-content" role="document">
                                <button data-a11y-dialog-hide class="dialog-close" aria-label="Tanca aquesta finestra">
                                    <svg width="44" height="44">
                                        <g fill="none" fill-rule="evenodd">
                                            <path d="M0 0h44v44H0z" />
                                            <path stroke="#FFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" d="M33 11 11 33M11 11l22 22" />
                                        </g>
                                    </svg>
                                </button>
                                <img loading="lazy" src="${info.image[0].image}" alt="" class="is-block">
                            </div>
                        </div>
                    </div>`
                :''}
                ${(info.body)?info.body:''}
            </div>
        `);
    },

    bloque_de_titulo_y_texto: function(info){
        return htmlTemplate(`
            <div class="block-titol-text flow">
                ${(info.title)?
                `<h3>
                    ${info.title}
                </h3>`
                :''}
                ${(info.body)?info.body:''}
            </div>
        `);
    },

    bloque_de_texto: function(info){
        return htmlTemplate(`
            <div class="block-titol-text flow">
            ${(info.body)?info.body:''}
            </div>
            `);
    },
    bloque_de_título_y_texto: function(info){
        return htmlTemplate(`
            <div class="block-titol-text flow">
                ${(info.title)?
                `<h3>
                    ${info.title}
                </h3>`
                :''}
                ${(info.body)?info.body:''}
            </div>
        `);
    },

    bloque_de_texto_con_mapa: function(info){
        return htmlTemplate(`
            <div class="block-text-img-dreta block-dedalo columns is-widescreen is-variable is-8">
                <div class="column is-5-widescreen flow--l">
                    <div class="block-titol-text flow">
                        ${(info.title)?
                        `<h2 id="${this.fix_names(info.title)}">
                            ${info.title}
                        </h2>`
                        :''}
                        ${(info.body)?info.body:''}
                    </div>
                </div>
                <div class="column">
                    ${(info.abstract)?info.abstract:''}
                </div>
            </div>
        `);
    },

    piso_gris: function(info, rows){
        var content = htmlTemplate(`
            <div class="full-bleed has-background-grey-light">
                <div class="wrapper">
                </div>
            </div>
        `);
        var children_container = content[0].querySelector('div.wrapper')
        templateModules.render_items(rows, info.term_id).forEach(node => {
            appendTemplate(children_container, node);
        });
        return content;
    },

    bloque_navega_en_la_coleccion: function(info){
        var content = htmlTemplate(`
        <div class="wrapper py-8">
            <div class="columns is-justify-content-space-between">
                <div class="column is-half-desktop is-one-third-widescreen flow--m">
                    ${(info.title)?
                    `<h2 id="${this.fix_names(info.title)}">
                        ${info.title}
                    </h2>`
                    :''}
                    ${(info.body)?info.body:''}
                </div>
                ${(info.uri && info.uri.length > 0 || info.pdf_resolved && info.pdf_resolved.length > 0)?
                `<div class="column">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-flex-end gap-6">
                    ${info.pdf_resolved.map(function(elem, index){
                        return `<a href="${elem.url}" class="is-flex is-align-items-center link-dn has-text-weight-semibold gap-2 is-size-6">
                            <img src="/assets/img/ico-descarregar.svg" alt="" width="30" height="30">
                            ${info.pdf_title[index]}
                        </a>`;
                    }).join('')}
                    ${info.uri.map(function(elem){
                        return `<a href="${elem.iri}" class="button">${elem.title}</a>`;
                    }).join('')}
                    </div>
                </div>`
                :''}
            </div>
            <div class="children_container has-text-centered mt-8 flow--xl">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getCatalogDestacados().then(function(results){
            var random = results.map(function(elem){
                return elem.section_id;
            });
            shuffle(random);
            random = random.slice(0, 4);
            var content = htmlTemplate(`
                <div class="masonry-grid">
                    <div class="masonry-grid-sizer"></div>
                    ${results.map(function(elem){

                        var extraClass = "";
                        if (random.includes(elem.section_id)) {
                            extraClass = 'masonry-grid-item--width-2';
                        }
                        const url = page_globals.__WEB_ROOT_WEB__ + '/' + elem.tpl + '/' + elem.section_id;
                        var image_url = '/assets/img/placeholder.png';
                        if (elem.imagenes_identificativas.length > 0) {
                            image_url = __WEB_MEDIA_ENGINE_URL__+elem.imagenes_identificativas[0].image;
                        }
                        return `
                            <div class="masonry-grid-item ${extraClass}">
                                <a href="${url}">
                                    <img src="${image_url}" alt="">
                                </a>
                            </div>
                        `;
                    }).join('')}
                    </div>
                </div>
            `);
            appendTemplate(children_container, content);
            massonryEnable();
        });
        return content;
    },
    bloque_descubrir_publicaciones: function(info){
        var content = htmlTemplate(`
        <div class="wrapper">
            <div class="columns is-justify-content-space-between">
                <div class="column is-half-desktop is-one-third-widescreen flow--m">
                    ${(info.title)?
                    `<h2 id="${this.fix_names(info.title)}">
                        ${info.title}
                    </h2>`
                    :''}
                    ${(info.body)?info.body:''}
                </div>
                ${(info.uri && info.uri.length > 0 || info.pdf_resolved && info.pdf_resolved.length > 0)?
                `<div class="column">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-flex-end gap-6">
                    ${info.pdf_resolved.map(function(elem, index){
                        return `<a href="${elem.url}" class="is-flex is-align-items-center link-dn has-text-weight-semibold gap-2 is-size-6">
                            <img src="/assets/img/ico-descarregar.svg" alt="" width="30" height="30">
                            ${info.pdf_title[index]}
                        </a>`;
                    }).join('')}
                    ${info.uri.map(function(elem){
                        return `<a href="${elem.iri}" class="button">${elem.title}</a>`;
                    }).join('')}
                    </div>
                </div>`
                :''}
            </div>
            <div class="children_container swiper-container is-relative mt-7">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getPublicacionesDestacados().then(function(results){
            var content = htmlTemplate(`
                <div class="swiper swiper--publicacions">
                    <div class="swiper-wrapper link-dn">
                        ${results.map(function(row){
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

                            return `
                            <div class="swiper-slide">
                                <div class="is-flex is-flex-direction-column full-link gap-2">
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
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="swiper--publicacions__btns">
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                </div>
            `);
            appendTemplate(children_container, content);
            swiperPublicaciones();
        });
        return content;
    },
    bloque_proximas_actividades: function(info){
        var content = htmlTemplate(`
        <div class="wrapper">
            <div class="columns is-justify-content-space-between">
                <div class="column is-half-desktop is-one-third-widescreen flow--m">
                    ${(info.title)?
                    `<h2 id="${this.fix_names(info.title)}">
                        ${info.title}
                    </h2>`
                    :''}
                    ${(info.body)?info.body:''}
                </div>
                ${(info.uri && info.uri.length > 0 || info.pdf_resolved && info.pdf_resolved.length > 0)?
                `<div class="column">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-flex-end gap-6">
                    ${info.pdf_resolved.map(function(elem, index){
                        return `<a href="${elem.url}" class="is-flex is-align-items-center link-dn has-text-weight-semibold gap-2 is-size-6">
                            <img src="/assets/img/ico-descarregar.svg" alt="" width="30" height="30">
                            ${info.pdf_title[index]}
                        </a>`;
                    }).join('')}
                    ${info.uri.map(function(elem){
                        return `<a href="${elem.iri}" class="button">${elem.title}</a>`;
                    }).join('')}
                    </div>
                </div>`
                :''}
            </div>
            <div class="is-flex is-flex-wrap-wrap is-align-items-center gap-8 mb-8"></div>
            <div class="children_container swiper-container is-relative mt-7">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getActividadesDestacados().then(function(results){
            var content = htmlTemplate(`
                <div class="swiper swiper--activitats">
                    <div class="swiper-wrapper activitats-list link-dn">
                        ${results.map(function(row){
                            const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                            var image_url = '/assets/img/placeholder.png';
                            if (row.identifying_image !== null) {
                                image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(row.identifying_image)[0];
                            }
                            var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                            return `
                            <div class="swiper-slide">
                                <div class="is-flex is-flex-direction-column gap-4 full-link">
                                    <h3 class="is-size-4">
                                        <a href="${url}">${row.title}</a>
                                    </h3>
                                    ${(row.type)?
                                    `<p class="has-text-weight-medium is-size-6">
                                        <a href="/activities/?type=${row.type}" class="link-dn is-relative">${row.type}</a>
                                    </p>`
                                    :''}
                                    <img loading="lazy" src="${image_url}" alt="">
                                    ${(date)?
                                    `<div class="has-text-primary has-text-weight-semibold is-size-6">
                                        ${date}
                                    </div>`
                                    :''}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="swiper--activitats__btns">
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                </div>
            `);
            appendTemplate(children_container, content);
            swiperActividades();
        });
        return content;
    },
    bloque_exposiciones_destacadas: function(info){
        var content = htmlTemplate(`
        <div class="wrapper">
            <div class="columns is-justify-content-space-between">
                <div class="column is-half-desktop is-one-third-widescreen flow--m">
                    ${(info.title)?
                    `<h2 id="${this.fix_names(info.title)}">
                        ${info.title}
                    </h2>`
                    :''}
                    ${(info.body)?info.body:''}
                </div>
                ${(info.uri && info.uri.length > 0 || info.pdf_resolved && info.pdf_resolved.length > 0)?
                `<div class="column">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-flex-end gap-6">
                    ${info.pdf_resolved.map(function(elem, index){
                        return `<a href="${elem.url}" class="is-flex is-align-items-center link-dn has-text-weight-semibold gap-2 is-size-6">
                            <img src="/assets/img/ico-descarregar.svg" alt="" width="30" height="30">
                            ${info.pdf_title[index]}
                        </a>`;
                    }).join('')}
                    ${info.uri.map(function(elem){
                        return `<a href="${elem.iri}" class="button">${elem.title}</a>`;
                    }).join('')}
                    </div>
                </div>`
                :''}
            </div>
            <div class="children_container swiper-container is-relative mt-7">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getExposicionesDestacados().then(function(results){
            var content = htmlTemplate(`
                <div class="swiper swiper--exposiciones-destacadas">
                    <div class="swiper-wrapper">
                        ${results.map(function(row){
                            const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                            var image_url = '/assets/img/placeholder.png';
                            if (row.identifying_image !== null) {
                                image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(row.identifying_image)[0];
                            }
                            var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                            return `
                            <div class="swiper-slide">
                                <div class="card is-flex is-flex-direction-column full-link">
                                    <div class="pt-7 pb-5 px-6 flow--xl">
                                        <h3 class="is-size-3 has-text-weight-semibold">
                                            <a href="${url}">${row.title}</a>
                                        </h3>
                                        ${(date)?
                                        `<p class="has-text-weight-medium is-uppercase">${date}</p>`
                                        :''}
                                        <p class="more-link">${tstring.home_activities_more}</p>
                                    </div>
                                    ${(row.type)?
                                    `<p class="has-text-weight-medium mb-3">
                                        <a href="/expositions/?type=${row.type}" class="link-dn is-relative">${row.type}</a>
                                    </p>`
                                    :''}
                                    <img loading="lazy" src="${image_url}" alt="">
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="swiper--exposiciones-destacadas__btns">
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                </div>
            `);
            appendTemplate(children_container, content);
            swiperExposicionesDestacadas();
        });
        return content;
    },

    bloque_actividades_anuales: function(target) {
        const content = htmlTemplate(`
            <div class="children_container accordion accordion--primary mt-6">
                <h2 class="is-flex is-align-items-center gap-2 mb-7 has-text-black">${tstring.historical}</h2>
            </div>
        `);
        var children_container = content[0];
        const spinner = common.spinner(children_container)
        appendTemplate(target, content);


        function buildYear (year, activs) {
            return `
                <h2 class="accordion-header" id="tab${year}">
                    <button type="button" aria-controls="panel${year}">${year}</button>
                </h2>
                <div class="accordion-content" id="panel${year}" aria-labelledby="tab${year}">
                    <div class="swiper-container is-relative">
                        <div class="swiper swiper--activitats swiper--activitats-${year}">
                            <div class="swiper-wrapper">
                                ${
                                    activs.map(function(row){
                                        const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                                        var image_url = '/assets/img/placeholder.png';
                                        if (row.identifying_image !== null) {
                                            image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(row.identifying_image)[0];
                                        }
                                        var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                                        return `
                                            <div class="swiper-slide">
                                                <div class="card is-flex is-flex-direction-column full-link">
                                                    <div class="pt-7 pb-5 px-6 flow--xl">
                                                        <h3 class="is-size-3 has-text-weight-semibold">
                                                            <a href="${url}">${row.title}</a>
                                                        </h3>
                                                        ${(date)?
                                                        `<p class="has-text-weight-medium is-uppercase">${date}</p>`
                                                        :''}
                                                        <p class="more-link">${tstring.home_activities_more}</p>
                                                    </div>
                                                    ${(row.type)?
                                                    `<p class="has-text-weight-medium mb-3">
                                                        <a href="/activities/?type=${row.type}" class="link-dn is-relative">${row.type}</a>
                                                    </p>`
                                                    :''}
                                                    <img loading="lazy" src="${image_url}" alt="">
                                                </div>
                                            </div>
                                        `;
                                    }).join('')
                                }
                            </div>
                            <div class="swiper--activitats-${year}__btns">
                                <div class="swiper-button-prev"></div>
                                <div class="swiper-button-next"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        api.getActivities().then(function(results){
            if (!results || results.length == 0) {
                return '';
            }

            const groupedByYear = {};
            results.forEach(activ => {
                const year = activ.date_start_year;
                if (year) {
                    groupedByYear[year] = groupedByYear[year] || [];
                    groupedByYear[year].push(activ);
                }
            })
            const yearsArray = Object.keys(groupedByYear).sort((a,b) => b-a);

            var content = htmlTemplate(`
                ${yearsArray.map(function(year, i){
                    return buildYear(year, groupedByYear[year], i);
                }).join('')}`);
            children_container.removeChild(children_container.lastChild);
            appendTemplate(children_container, content);
            swiperActividadesAnuales(yearsArray);
            let accordionInstance = new TenUp.Accordion('.accordion');
        });
        return;
    },


    bloque_actividades_actuales: function(){
        var content = htmlTemplate(`
        <div class="children_container swiper-container is-relative">
            <div class="swiper swiper--actividades-actuales">
                <div class="swiper-wrapper">
                </div>
            </div>
            <div class="swiper--actividades-actuales__btns">
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        </div>
        `);

        var children_container = content[0].querySelector('.children_container .swiper-wrapper');

        api.getActividadesActuales().then(function(results){
            var content = htmlTemplate(`
                ${results.map(function(row){
                    const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                    var image_url = '/assets/img/placeholder.png';
                    if (row.identifying_image !== null) {
                        image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(row.identifying_image)[0];
                    }
                    var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                    return `
                    <div class="swiper-slide">
                        <div class="card is-flex is-flex-direction-column full-link">
                            <div class="pt-7 pb-5 px-6 flow--xl">
                                <h3 class="is-size-4">
                                    <a href="${url}">${row.title}</a>
                                </h3>
                                ${(date)?
                                `<p class="has-text-weight-medium is-uppercase">${date}</p>`
                                :''}
                            </div>
                            ${(row.type)?
                            `<p class="has-text-weight-medium mb-3">
                                <a href="/activities/?type=${row.type}" class="link-dn is-relative">${row.type}</a>
                            </p>`
                            :''}
                            <img loading="lazy" src="${image_url}" alt="">
                        </div>
                    </div>
                    `;
                }).join('')}
            `);
            appendTemplate(children_container, content);
            swiperActividadesActuales();
        });
        return content;
    },
    bloque_exposiciones_anuales: function(target){
        const content = htmlTemplate(`
            <div class="children_container accordion accordion--primary mt-6">
                <h2 class="is-flex is-align-items-center gap-2 mb-7 has-text-black">${tstring.historical}</h2>
            </div>
        `);
        var children_container = content[0];
        const spinner = common.spinner(children_container)
        appendTemplate(target, content);

        function buildYear (year, expos) {
            return `
                <h2 class="accordion-header" id="tab${year}">
                    <button type="button" aria-controls="panel${year}">${year}</button>
                </h2>
                <div class="accordion-content" id="panel${year}" aria-labelledby="tab${year}">
                    <div class="swiper-container is-relative">
                        <div class="swiper swiper--expos swiper--expos-${year}">
                            <div class="swiper-wrapper">
                                ${
                                    expos.map(function(row){
                                        const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                                        var image_url = '/assets/img/placeholder.png';

                                        if (row.identifying_image !== null) {
                                            image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(row.identifying_image)[0];
                                        }
                                        var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                                        return `
                                            <div class="swiper-slide">
                                                <div class="card is-flex is-flex-direction-column full-link">
                                                    <div class="pt-7 pb-5 px-6 flow--xl">
                                                        <h3 class="is-size-3 has-text-weight-semibold">
                                                            <a href="${url}">${row.title}</a>
                                                        </h3>
                                                        ${(date)?
                                                        `<p class="has-text-weight-medium is-uppercase">${date}</p>`
                                                        :''}
                                                        <p class="more-link">${tstring.home_activities_more}</p>
                                                    </div>
                                                    ${(row.type)?
                                                    `<p class="has-text-weight-medium mb-3">
                                                        <a href="/expositions/?type=${row.type}" class="link-dn is-relative">${row.type}</a>
                                                    </p>`
                                                    :''}
                                                    <img loading="lazy" src="${image_url}" alt="">
                                                </div>
                                            </div>
                                        `;
                                    }).join('')
                                }
                            </div>
                            <div class="swiper--expos-${year}__btns">
                                <div class="swiper-button-prev"></div>
                                <div class="swiper-button-next"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        api.getExposiciones().then(function(results){
            if (!results || results.length == 0) {
                return '';
            }

            const groupedByYear = {};
            results.forEach(expo => {
                const year = expo.date_start_year;
                if (year) {
                    groupedByYear[year] = groupedByYear[year] || [];
                    groupedByYear[year].push(expo);
                }
            })
            const yearsArray = Object.keys(groupedByYear).sort((a,b) => b-a);

            var content = htmlTemplate(`
                ${yearsArray.map(function(year, i){
                    return buildYear(year, groupedByYear[year], i);
                }).join('')}`);
            children_container.removeChild(children_container.lastChild);
            appendTemplate(children_container, content);
            swiperExpos(yearsArray)
            let accordionInstance = new TenUp.Accordion('.accordion');
        });
        return;
    },

    bloque_exposiciones_actuales: function(){
        var content = htmlTemplate(`
        <div class="children_container swiper-container is-relative">
            <div class="swiper swiper--exposiciones-actuales">
                <div class="swiper-wrapper">
                </div>
            </div>
            <div class="swiper--exposiciones-actuales__btns">
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        </div>
        `);

        var children_container = content[0].querySelector('.children_container .swiper-wrapper');

        api.getExposicionesActuales().then(function(results){
            var content = htmlTemplate(`
                ${results.map(function(row){
                    const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                    var image_url = '/assets/img/placeholder.png';

                    if (row.identifying_image !== null) {
                        image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(row.identifying_image)[0];
                    }
                    var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                    return `
                    <div class="swiper-slide">
                        <div class="card is-flex is-flex-direction-column full-link">
                            <div class="pt-7 pb-5 px-6 flow--xl">
                                <h3 class="is-size-3 has-text-weight-semibold">
                                    <a href="${url}">${row.title}</a>
                                </h3>
                                ${(date)?
                                `<p class="has-text-weight-medium is-uppercase">${date}</p>`
                                :''}
                                <p class="more-link">${tstring.home_activities_more}</p>
                            </div>
                            ${(row.type)?
                            `<p class="has-text-weight-medium mb-3">
                                <a href="/expositions/?type=${row.type}" class="link-dn is-relative">${row.type}</a>
                            </p>`
                            :''}
                            <img loading="lazy" src="${image_url}" alt="">
                        </div>
                    </div>
                    `;
                }).join('')}
            `);
            appendTemplate(children_container, content);
            swiperExposicionesActuales();
        });
        return content;
    },





    bloque_catalogo_default: function(self){
        const data = self.loaded_items;

        var content = htmlTemplate(`
        <div>
            <div class="default_objects mt-8 flow--xl">
            </div>
            <div class="default_pictures mt-8 flow--xl">
            </div>
            <div class="default_inmovables mt-8 flow--xl">
            </div>
            <div class="default_documents mt-8 flow--xl">
            </div>
        </div>
        `);

        var children_container_objects = content[0].querySelector('div.default_objects');
        var children_container_pictures = content[0].querySelector('div.default_pictures');
        var children_container_inmovables = content[0].querySelector('div.default_inmovables');
        var children_container_documents = content[0].querySelector('div.default_documents');

        function load_items(type) {
            let title;
            let apiCall;
            let container;
            switch(type) {
                case 'objects':
                    title = tstring.collection_objects_default;
                    apiCall = api.getObjectsDefault;
                    container = children_container_objects;
                    break;
                case 'pictures':
                    title = tstring.collection_pictures_default;
                    apiCall = api.getPicturesDefault;
                    container = children_container_pictures;
                    break;
                case 'inmovables':
                    title = tstring.collection_inmovables_default;
                    apiCall = api.getInmovablesDefault;
                    container = children_container_inmovables;
                    break;
                case 'documents':
                    title = tstring.collection_documents_default;
                    apiCall = api.getDocumentsDefault;
                    container = children_container_documents;
                    break;
                default:
                    return;
            }
            // Si no hi ha cap element carregat, es creen els elements HTML de la galeria i botó de carregar més
            if (data[type].loaded === 0) {
                const new_gallery = htmlTemplate(`
                    <div class="is-flex is-justify-content-space-between is-align-items-center gap-4 mb-5">
                        <h2>${title}</h2>
                    </div>
                    <ul class="galeria galeria--242x242 link-dn"></ul>
                    <div class="has-text-centered mt-6">
                        <button type="button" class="button button--icon button--carrega" id="button_load_more_${type}">${tstring.collection_see_more}</button>
                    </div>
                `);
                appendTemplate(container, new_gallery);

                // Afegim l'event listener al botó de carregar més
                container.querySelector(`#button_load_more_${type}`).addEventListener('click', function(){
                    if (data[type].loaded < data[type].total) {
                        load_items(type);
                    }
                });
            }


            var gallery_children = container.querySelector('.galeria');

            // Crida a la api per carregar més elements
            apiCall(data[type].loaded).then(function({data: results, total}){
                if (!results || results.length == 0) {
                    return;
                }
                // Guardem els resultats a l'objecte data
                data[type].results = data[type].results.concat(results);
                data[type].total = total;
                data[type].loaded += results.length;

                // Si ja s'han carregat tots els elements, es treu el botó de carregar més
                if (data[type].loaded >= data[type].total) {
                    container.querySelector(`#button_load_more_${type}`).remove();
                }

                // Es crea el contingut HTML de la galeria
                var content = htmlTemplate(`
                    ${data[type].results.map(function(row){
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
                        </li>`;
                    }).join('')}
                `);

                // Esborrem el contingut anterior de la galeria i afegim el nou contingut
                gallery_children.innerHTML = '';
                appendTemplate(gallery_children, content);
            });
        }
        load_items('objects');
        load_items('pictures');
        load_items('immovables');
        load_items('documents');

        return content;
    },



/*
    Últimes publicacions del Museu
    Galeria de Serie de Trabajos Varios
    Galeria de Revista APL
    Galeria de Labor del SIP
    Galeria de Catálogos
    Galeria de Publicaciones Diverses
    Galeria Didáctica
    Galeria de Dodia
*/

    bloque_publicaciones_default: function(){
        var contentBase = htmlTemplate(`<div>
            <div class="default_last mt-8 flow--xl">
            </div>
            <div class="default_cats mt-8 flow--xl">
            </div>
        </div>`);
        var children_container = contentBase[0].querySelector('div.default_last');
        var children_container_cats = contentBase[0].querySelector('div.default_cats');
        api.getPublicacionesDestacados().then(function(results){
            var content = htmlTemplate(`
                <h2>${tstring.documents_default_last}</h2>
                <ul class="pubs-list link-dn mt-7">
                ${results.map(function(row){
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

                    return `
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
                    `;
                }).join('')}
                </ul>
            `);
            appendTemplate(children_container, content);
        });
        api.getPublicacionesSeries().then(function(results){
            results.forEach(function(elem){
                var content = htmlTemplate(`
                <div class="default_last mt-8 flow--xl">
                    <div class="is-flex is-justify-content-space-between is-align-items-center gap-4 mb-5">
                    <h2>${elem.name}</h2>
                    <a href="/publicaciones/?cercaSerie=${elem.name}" class="button button--simple-2">${tstring.collection_see_all}</a>
                </div>

                    <ul class="pubs-list link-dn mt-7">
                    </ul>
                </div>
                `);
                var children_container = content[0].querySelector('ul');
                api.getPublicacionesDestacados(elem.id).then(function(results){
                    var content = htmlTemplate(`
                        ${results.map(function(row){
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

                            return `
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
                            `;
                        }).join('')}
                    `);
                    appendTemplate(children_container, content);
                });
                appendTemplate(children_container_cats, content);
            });
        });
        return contentBase;
    },

    bloque_directorio: function(info){
        var content = htmlTemplate(`<div class="flow--2xl"></div>`);
        var children_container = content[0];
        api.getDirectorio().then(function(results){
            results.forEach(function(elem){
                var content = htmlTemplate(`<div class="accordion accordion--primary mt-6">
                        <h2 class="accordion-header">
                            <button type="button">${elem.nombre}</button>
                        </h2>
                        <div class="accordion-content block-dedalo">
                            ${(elem.estructura_funcionamiento)?`
                            <p>${elem.estructura_funcionamiento}</p>
                            `:''}
                            <div class="block-dedalo columns is-multiline is-variable is-8">
                            ${elem.relations.map(function(row){
                                return `<div data-relation="${row}" class="column is-half-tablet is-one-third-desktop is-one-quarter-widescreen">
                                </div>`
                            }).join('')}
                            </div>
                        </div>
                    </div>
                `);
                //var persons_container = content[0].querySelector('div.block-dedalo');
                elem.relations.forEach(function(relation){
                    var person_container = content[0].querySelector('div[data-relation="'+relation+'"]');
                    api.getPersona(relation).then(function(persona){
                        if (persona.length != 1) {
                            return;
                        }
                        persona = persona[0];
                        var content = htmlTemplate(`
                            <div class="block-titol-text flow">
                                <h3>${persona.nombre} ${persona.apellidos}</h3>
                                ${(persona.cargo || persona.telefono)?
                                `<div class="table">
                                    <table>
                                        <tbody>
                                            ${(persona.cargo)?
                                            `<tr>
                                                <th>${tstring.directory_rol}</th>
                                                <td>${persona.cargo}</td>
                                            </tr>`
                                            :''}
                                            ${(persona.telefono)?
                                            `<tr>
                                                <th>${tstring.directory_tel}</th>
                                                <td>
                                                    <a href="tel:${persona.telefono}">${persona.telefono}</a>
                                                </td>
                                            </tr>`
                                            :''}
                                        </tbody>
                                    </table>
                                </div>`
                                :''}
                            </div>`);
                        appendTemplate(person_container, content);
                    })
                });
                appendTemplate(children_container, content);
            })
            viewInit();
        });
        return content;
    },
    visitaYacimiento: function(info){
        var logo_url = null;
        if (info.identifying_image !== null && info.identifying_image.length > 0) {
            logo_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(info.identifying_image)[0];
        }
        var image_url = null;
        if (info.images !== null && info.images.length > 0) {
            image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(info.images)[0];
        }
        return htmlTemplate(`
            <h2 class="is-flex is-align-items-center gap-2 mb-7 has-text-black">${info.title}</h2>
                <!-- block-text-img-dreta-fons-negre -->
                <div class="block-text-img-dreta-fons-negre">
                    <div class="block-dedalo columns is-widescreen">
                        <div class="column is-5-widescreen">
                            <div class="has-background-black h-100 has-text-white flow--l p-8">
                                ${(logo_url)?`
                                <img src="${logo_url}" width="157" height="78">
                                `:''}
                                ${(info.summary)?`
                                ${common.convertText(info.summary)}
                                `:''}
                            </div>
                        </div>
                        ${(image_url)?`
                        <div class="column">
                            <img loading="lazy" src="${image_url}" alt="" class="is-block">
                        </div>
                        `:''}
                    </div>
                </div>
                ${(info.description)?`
                <div class="block-dedalo is-variable is-8 is-multiline flow text-columns-2">
                    ${common.convertText(info.description)}
                </div>
                `:''}
                ${(info.children_data.length > 0)?`
                <h2 class="is-flex is-align-items-center gap-2 mb-7 has-text-black">${tstring.route_sites}</h2>
                <div class="tabs-2">
                    <div class="tab-control">
                        <ul class="tab-list" role="tablist">
                        ${info.children_data.map(function(elem){
                            return `<li class="tab-item">
                                <button role="tab" aria-controls="route-tab-${elem.section_id}">${elem.title}</button>
                            </li>`;
                        }).join('')}
                        </ul>
                    </div>
                    <div class="tab-group">

                    ${info.children_data.map(function(elem){
                        return `
                        <div class="tab-content" id="route-tab-${elem.section_id}" role="tabpanel">
                            <div class="block-dedalo columns is-variable is-8 is-multiline">
                                <div class="column is-half-tablet">
                                    <div class="block-titol-text flow">
                                        <h3>${elem.title}</h3>
                                        ${(elem.summary)?`
                                        <h4>${elem.summary}</h4>
                                        `:''}
                                        ${(elem.description)?`
                                        ${common.convertText(elem.description)}
                                        `:''}
                                    </div>
                                </div>
                                <div class="column is-half-tablet"></div>
                            </div>
                            ${(elem.children_data.length > 0)?`
                            <div class="has-background-grey-light pt-7">
                                <div class="px-6">
                                    <ul class="columns is-multiline is-variable is-7">
                                    ${elem.children_data.map(function(site){
                                        console.log(site);
                                        var image_url = null;
                                        if (site.identifying_image !== null && site.identifying_image.length > 0) {
                                            image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(site.identifying_image)[0];
                                        }
                                        if (site.images !== null && site.images.length > 0) {
                                            image_url = __WEB_MEDIA_ENGINE_URL__+JSON.parse(site.images)[0];
                                        }
                                        var documents = [];
                                        if (site.documents) {
                                            documents = JSON.parse(site.documents);
                                        }
                                        var documentsTitles = [];
                                        if (site.documents_title) {
                                            documentsTitles = JSON.parse(site.documents_title);
                                        }
                                        return `
                                        <li class="column is-half-tablet mb-8">
                                            <div class="columns is-desktop is-flex-direction-row-reverse">
                                                <div class="column is-flex is-flex-direction-column">
                                                    <div class="flow--2xs mb-5">
                                                        <h3 class="is-size-3 has-text-weight-semibold">${site.title}</h3>
                                                        ${(elem.place)?`
                                                        <p class="is-size-6 has-text-weight-medium">${site.place}</p>
                                                        `:''}
                                                    </div>
                                                    <ul class="actions-list mt-auto mb-4 has-text-weight-medium link-dn flow--xs is-size-5">
                                                        <li>
                                                            <div class="button-like" data-a11y-dialog-show="dialog-route-${site.section_id}" role="button" tabindex="0">
                                                                ${tstring.route_visit} ${site.title}
                                                            </div>
                                                        </li>
                                                        <!-- li>
                                                            <a href="/jaciments/fitxa-jaciment/">${tstring.route_more_info} ${site.title}</a>
                                                        </li -->
                                                        ${documents.map(function(document, index){
                                                        return `
                                                        <li>
                                                            <a href="${__WEB_MEDIA_ENGINE_URL__+document}">${documentsTitles[index]}</a>
                                                        </li>
                                                        `;
                                                        }).join('')}
                                                    </ul>
                                                </div>
                                                ${(image_url)?`
                                                <div class="column">
                                                    <img loading="lazy" src="${image_url}" width="380" height="250" alt="" class="is-block">
                                                </div>
                                                `:`
                                                <div class="column">
                                                    <img loading="lazy" src="/assets/img/placeholder2.png" width="380" height="250" alt="" class="is-block">
                                                </div>
                                                `}
                                            </div>
                                            <div class="dialog-container" data-a11y-dialog="dialog-route-${site.section_id}" aria-hidden="true" aria-labelledby="dialog-route-${site.section_id}-title">
                                                <div class="dialog-overlay" data-a11y-dialog-hide></div>
                                                <div class="dialog-content" role="document">
                                                    <button data-a11y-dialog-hide class="dialog-close" aria-label="${tstring.close}">
                                                        <svg width="44" height="44">
                                                            <g fill="none" fill-rule="evenodd">
                                                                <path d="M0 0h44v44H0z" />
                                                                <path stroke="#FFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" d="M33 11 11 33M11 11l22 22" />
                                                            </g>
                                                        </svg>
                                                    </button>
                                                    <div class="columns is-fullhd is-variable is-8">
                                                        ${(image_url)?`
                                                        <div class="column">
                                                            <img loading="lazy" src="${image_url}" alt="">
                                                        </div>
                                                        `:''}
                                                        <div class="column text-base flow--2xs">
                                                            <div class="flow--xs">
                                                                <h1 id="dialog-01-title">${site.title}</h1>
                                                                ${(elem.place)?`
                                                                <p class="is-size-3 has-text-weight-medium">${site.place}</p>
                                                                `:''}
                                                            </div>
                                                            <h2 class="is-flex is-align-items-center gap-2 mt-7">
                                                                <img src="/assets/img/ico-localitzacio-small.svg" alt="" width="20" height="20">
                                                                ${tstring.site_how_arrive}
                                                            </h2>
                                                            ${common.convertText(site.summary)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>`;
                                    }).join('')}
                                    </ul>
                                </div>
                            </div>
                            `:''}
                        </div>`;
                    }).join('')}
                    </div>
                `:''}
                </div>
        `);
    },



}
