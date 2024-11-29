"use strict";



var portada = {

    /**
    * SET_UP
    */
    set_up: function (options) {

        const self = this

        // options
        const row = options.row
        const children_container = options.children_container

        // fix values
        self.row = row

        // children render
        if (children_container && row.children && row.children.length > 0) {

            // get children info
            page.get_records({
                table: 'ts_web_mupreva',
                //sql_filter: 'parents LIKE \'%"' + row.term_id + '"%\' && template_name=\'item\'',
                sql_filter: 'parents LIKE \'%"' + row.term_id + '"%\'',
                parser: page.parse_ts_web,
                resolve_portals_custom: '{"image": "image"}'
            })
                .then(function (rows) {
                    rows = rows.map(function(item){
                        return item;
                    })
                    templateModules.render_items(rows, row.term_id).forEach(node => {
                        appendTemplate(children_container, node);
                    });
                })
        }

        // event publish template_render_end
        event_manager.publish('template_render_end', {})


        return true
    },//end set_up

}//end generic
