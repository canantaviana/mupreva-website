"use strict";

var api = {
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
            sql_filter: 'imagen_identificativa is not null',
            limit: 6,
            order: 'fecha_publicacion ASC',
            //ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"imagen_identificativa": "image"}'
        };
        if (serie !== null) {
            options.sql_filter = options.sql_filter+' and serie_data = "'+serie+'"'
        }
        return page.get_records(options);
    },

    getPublicacionesSeries: function() {
        var options = {
            table: 'publications',
            ar_fields: "serie,serie_data",
            sql_filter: 'serie_data is not null and serie_data in ()',
            limit: 6,
            order: 'fecha_publicacion ASC',
            //ar_fields: '*',
            parse: page.parse_list_data,
        };
        return page.get_records(options);
    },


    getActividadesDestacados: function() {
        var options = {
            table: 'activities',
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and (type_data like '%\\\"4\\\"%' or type_data like '%\\\"16\\\"%' or type_data like '%\\\"18\\\"%' or type_data like '%\\\"21\\\"%')",
            limit: 6,
            order: 'RAND()',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },

    getExposicionesDestacados: function() {
        var options = {
            table: 'activities',
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and (type_data like '%\\\"3\\\"%' or type_data like '%\\\"11\\\"%' or type_data like '%\\\"12\\\"%')",
            limit: 3,
            order: 'RAND()',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },


    getActividadesActuales: function() {
        var options = {
            table: 'activities',
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and (type_data like '%\\\"4\\\"%' or type_data like '%\\\"16\\\"%' or type_data like '%\\\"18\\\"%' or type_data like '%\\\"21\\\"%')",
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
            table: 'activities',
            //sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and (type_data like '%\\\"3\\\"%' or type_data like '%\\\"11\\\"%' or type_data like '%\\\"12\\\"%')",
            limit: 10,
            order: 'time_frame asc',
            ar_fields: '*',
            parse: page.parse_list_data,
            //resolve_portals_custom: '{"image": "image"}'
        };
        return page.get_records(options);
    },


    getObjectsDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'objects',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: 'RAND()',
            //ar_fields: '*',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options);
    },
    getPicturesDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'pictures',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: 'RAND()',
            //ar_fields: '*',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options);
    },
    getInmovablesDefault: function() {
        var options = {
            //table: 'objects,pictures,immovables,documents_catalog',
            table: 'immovables',
            sql_filter: 'imagenes_identificativas is not null and destacado is not null',
            limit: 12,
            order: 'RAND()',
            //ar_fields: '*',
            parse: page.parse_list_data,
            resolve_portals_custom: '{"imagenes_identificativas": "image"}'
        };
        return page.get_records(options);
    },
    getDocumentsDefault: function() {
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

};
