"use strict";

var api = {

    activitadesCategorias: function() {
        return [
            4,//Actividad
            28,//Acto conmemorativo
            26,//Acto de homenaje
            15,//Conferencia
            10,//Comunicación
            30,//Ciclo de conferencias
            35,//Ciclo de cine
            34,//Concurso
            19,//Congreso
            29,//Curso
            32,//Feria
            18,//Jornadas
            17,//Jornadas en yacimentos
            13,//Día de los Museos/Noche de los Museos
            16,//Presentación
            14,//Proyección
            31,//Seminario/Reunión
            33,//Mesa redonda
            21,//Taller de formación/ Taller de trabajo
            22,//Bookcrossing
        ];
    },

    aprendeMuseoCategorias: function() {
        return [
            5,//Didáctica
            37,//Maleta didáctica
            20,//Visita didáctica / Visita guiada
            21,//Taller
            //Taller fin de semana
            //Taller en yacimiento
        ];
    },

    categoryToSql: function(cats) {
        if (cats.length == 0) {
            return '';
        }
        var filter = cats.map(function(elem){
            return "type_data like '%\\\""+elem+"\\\"%'";
        });
        return '('+filter.join(' or ')+')';
    },

    getSliderPortada: function() {
        const portada_ar_calls = [
            {
                id: "salas",
                options: {
                    dedalo_get: "records",
                    table: "ts_ubication",
                    sql_filter: `parents LIKE '%\"ubication1_18\"%' AND model_name IN ("Sala", "Sala general museo")`,
                    order: "RAND()",
                    ar_fields: ["term", "illustration", "imagenes", "section_id"],
                    limit: 4,
                    resolve_portals_custom: `{"imagenes":"image"}`,
                    lang: page_globals.WEB_CURRENT_LANG_CODE,
                }
            },
            {
                id: "exposiciones",
                options: {
                    dedalo_get: "records",
                    table: "exhibitions",
                    sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s')",
                    order: "RAND()",
                    ar_fields: ["identifying_image", "section_id", "title"],
                    parse: page.parse_list_data,
                    limit: 4,
                    lang: page_globals.WEB_CURRENT_LANG_CODE,
                }
            }
        ];

        return new Promise(function (resolve) {
            data_manager.request({
                body: {
                    dedalo_get: 'combi',
                    db_name: page_globals.WEB_DB,
                    lang: page_globals.WEB_CURRENT_LANG_CODE,
                    ar_calls: JSON.stringify(portada_ar_calls)
                }
            })
                .then(function (response) {
                    const data = (typeof parse === "function")
                        ? parse(response.result)
                        : response.result

                    resolve(data)
                })
        })
    },

    getCatalogDestacados: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'objects',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 16,
            order: 'RAND()',
            //ar_fields: '*',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options);
    },

    getPublicacionesDestacados: function(serie = null) {
        var options = {
            table: 'publications',
            //sql_filter: 'imagen_identificativa is not null',
            limit: 24,
            order: 'fecha_publicacion desc',
            //ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"imagen_identificativa": "image"}'
        };
        if (serie !== null) {
            //options.sql_filter = options.sql_filter+' and serie_data = \'["'+serie+'"]\''
            options.sql_filter = 'serie_data = \'["'+serie+'"]\''
        }
        return page.get_records(options);
    },

    getPublicacionesSeries: function() {
        //Galeria de Serie de Trabajos Varios -> 3
        //Galeria de Revista APL -> 9
        //Galeria de Labor del SIP -> 4
        //Galeria de Catálogos -> 8
        //Galeria de Publicaciones Diverses -> 7
        //Galeria Didáctica -> 6
        //Galeria de Dodia -> 13
        var options = {
            table: 'publications',
            ar_fields: "serie,serie_data",
            sql_filter: 'serie_data is not null and serie_data in (\'["3"]\', \'["9"]\', \'["4"]\', \'["8"]\', \'["7"]\', \'["6"]\', \'["13"]\')',
            limit: 6,
            order: 'fecha_publicacion ASC',
            //ar_fields: '*',
            group: 'serie_data',
            parse: this.parseSeries,
        };
        return page.get_records(options);
    },

    parseSeries: function(rows) {
        var result = rows.map(value => {
            return {
                'name': value.serie,
                'id': JSON.parse(value.serie_data)[0]
            }
        });
        return result;
    },

    getActividadesDestacados: function() {
        var options = {
            table: 'activities',
            //sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and "+this.categoryToSql(this.activitadesCategorias()),
            sql_filter: "time_frame is not null and NOW() < STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and "+this.categoryToSql(this.activitadesCategorias()),
            //limit: 5,
            order: 'time_frame desc',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },

    getExposicionesDestacados: function() {
        var options = {
            table: 'exhibitions',
            //sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s')",
            sql_filter: "time_frame is not null",
            //limit: 3,
            order: 'time_frame desc',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },


    getActividadesActuales: function() {
        var options = {
            table: 'activities',
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and "+this.categoryToSql(this.activitadesCategorias()),
            //limit: 6,
            order: 'time_frame asc',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },

    getExposicionesActuales: function() {
        var options = {
            table: 'exhibitions',
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s')",
            limit: 10,
            order: 'time_frame asc',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },

    getExposiciones: function () {
        var options = {
            table: 'exhibitions',
            order: 'time_frame desc',
            ar_fields: '*',
            parse: page.parse_list_data
        };
        return page.get_records(options);
    },


    getObjectsDefault: function(offset = 0) {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'objects',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: null,
            ar_fields: 'section_tipo,section_id,imagenes_identificativas,titulo',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}',
            count: true,
            get_count: true,
            offset: offset,
        };
        return page.get_records(options);
    },
    getPicturesDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'pictures',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: null,
            ar_fields: 'section_tipo,section_id,imagenes_identificativas,titulo',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}',
            count: true,
            get_count: true,
        };
        return page.get_records(options);
    },
    getInmovablesDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'immovables',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: null,
            ar_fields: 'section_tipo,section_id,imagenes_identificativas,titulo',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}',
            count: true,
            get_count: true,
        };
        return page.get_records(options);
    },
    getDocumentsDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'documents_catalog',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: null,
            ar_fields: 'section_tipo,section_id,imagenes_identificativas,titulo',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}',
            count: true,
            get_count: true,
        };
        return page.get_records(options);
    },

    getBiblioDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'documents_catalog',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: 'RAND()',
            //ar_fields: '*',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options);
    },

    getRelatedElements: function(table, relation, relationId, offset = 0) {
        var options = {
            table: table,
            sql_filter: `${relation} LIKE '%\"${relationId}\"%' and imagenes_identificativas is not null`,
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}',
            limit: 50,
            order: 'datacion_ini ASC',
            ar_fields: 'section_id,titulo,periodo,imagenes_identificativas',
            count: true,
            offset: offset,
            get_count: true,
        }

        return page.get_records(options);
    },

    getDirectorio: function() {
        var options = {
            table: 'entities',
            sql_filter: 'parent = "[\\"rsc106_1\\"]" and relations is not null',
            order: 'section_id asc',
            //ar_fields: '*',
            //resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options).then(function(results){
            results = results.map(function(elem){
                var relations = JSON.parse(elem.relations).filter(function(entry){
                    return entry.section_tipo === 'rsc197';
                });
                elem.relations = relations.map(function(entry){
                    return entry.section_id
                });
                return elem;
            })
            return results.filter(function(elem){
                return elem.relations.length > 0;
            });
        });
    },

    getPersona: function(id) {
        var options = {
            table: 'people',
            sql_filter: 'section_id = "'+id+'"',
            order: 'section_id asc',
            //section_id: id

            //ar_fields: '*',
            //resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options);
    },

    getExcavaciones: function(excavacions) {
        var options = {
            table: 'excavations',
            section_id: excavacions.join(','),
            //sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s')",
            //limit: 3,
            order: 'section_id asc',
            ar_fields: '*',
            //parse: page.parse_list_data,
            resolve_portals_custom: '{"identifying_image_data": "image"}'
        };
        return page.get_records(options);
    },

    getVisitasYacimiento: function() {
        var options = {
            table: 'ts_route',
            sql_filter: "parent_data = \"[\\\"27\\\"]\"",
            order: 'section_id asc',
            ar_fields: 'section_id',
        };
        return page.get_records(options);
    },

    getVisitaYacimiento: function(id) {
        var options = {
            table: 'ts_route',
            section_id: id,
            order: 'section_id asc',
            ar_fields: '*',
            parse: function(info){return info},
            resolve_portals_custom: '{"children_data":"ts_route", "children_data.identifying_image_data": "image", "children_data.images": "image", "children_data.documents_data": "documents","children_data.children_data":"ts_route"}'
        };
        return page.get_records(options).then(function(results){
            return results[0]
        });
    },

    getVisitaYacimientoCatalog: function(title) {
        var options = {
            table: 'ts_route',
            sql_filter: 'title = "'+title+'"',
            ar_fields: 'section_id,summary',
            order: 'section_id asc',
            parse: function(info){return info}
        };
        return page.get_records(options).then(function(results){
            return results[0]
        });
    },
};
