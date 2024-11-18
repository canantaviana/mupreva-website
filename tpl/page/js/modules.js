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

}
