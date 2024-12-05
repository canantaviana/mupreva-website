"use strict";

var templateModules = {

    fix_names: function(text) {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"").replaceAll(' ', '_');
    },

    render_items: function (rows, term_id) {
        const self = this;
        const elems = rows.filter(function(elem){
            return elem.parent == term_id
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
                    `<img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">`
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
                    `<img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">`
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
                            `<img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">`
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
                            `<img src="${info.image[0].image}" alt="${info.image[0].title}" class="is-block">`
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
            </div>
        `);
        var children_container = content[0].querySelector('.accordion-content')
        templateModules.render_items(rows, info.term_id).forEach(node => {
            appendTemplate(children_container[0], node);
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
                    `<img src="${info.image[0].image}" alt="${info.image[0].title}">`
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
                `<div class="column is-narrow">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center gap-8">
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
                `<div class="column is-narrow">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center gap-8">
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
            <div class="children_container">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getPublicacionesDestacados().then(function(results){
            var content = htmlTemplate(`
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
        return content;
    },
    bloque_proximas_actividades: function(info){
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
                `<div class="column is-narrow">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center gap-8">
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
            <div class="children_container">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getActividadesDestacados().then(function(results){
            var content = htmlTemplate(`
                <ul class="galeria galeria--242x342 activitats-list link-dn">
                ${results.map(function(row){
                    const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                    var image_url = '/assets/img/placeholder.png';
                    if (row.identifying_image !== null) {
                        image_url = __WEB_MEDIA_ENGINE_URL__+row.identifying_image;
                    }
                    var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                    return `
                    <li>
                        <div class="is-flex is-flex-direction-column gap-4 full-link ${row.tpl}">
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
                    </li>
                    `;
                }).join('')}
                </ul>
            `);
            appendTemplate(children_container, content);
        });
        return content;
    },
    bloque_exposiciones_destacadas: function(info){
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
                `<div class="column is-narrow">
                    <div class="is-flex is-flex-wrap-wrap is-align-items-center gap-8">
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
            <div class="children_container">
            </div>
        </div>
        `);
        var children_container = content[0].querySelector('div.children_container');
        api.getExposicionesDestacados().then(function(results){
            var content = htmlTemplate(`
                <ul class="columns is-multiline mt-7">
                ${results.map(function(row){
                    const url = page_globals.__WEB_ROOT_WEB__ + '/' + row.tpl + '/' + row.section_id;
                    var image_url = '/assets/img/placeholder.png';
                    if (row.identifying_image !== null) {
                        image_url = __WEB_MEDIA_ENGINE_URL__+row.identifying_image;
                    }
                    var date = formatDateRange(row.time_frame, page_globals.WEB_CURRENT_LANG_CODE);

                    return `
                    <li class="column is-half-tablet is-one-third-desktop ${row.tpl}">
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
                    </li>
                    `;
                }).join('')}
                </ul>
            `);
            appendTemplate(children_container, content);
        });
        return content;
    },

}
