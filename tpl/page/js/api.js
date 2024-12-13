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

    exposicionesCategorias: function() {
        return [
            11,//Exposición temporal
            12,//Exposición itinerante
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
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and "+this.categoryToSql(this.activitadesCategorias()),
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
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and "+this.categoryToSql(this.exposicionesCategorias()),
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
            table: 'activities',
            sql_filter: "time_frame is not null and NOW() BETWEEN STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', 1), '%Y-%m-%d %H:%i:%s') AND STR_TO_DATE(SUBSTRING_INDEX(time_frame, ',', -1), '%Y-%m-%d %H:%i:%s') and "+this.categoryToSql(this.exposicionesCategorias()),
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
