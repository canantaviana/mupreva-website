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



        api.getSliderPortada()
            .then(function (rows) {

                const results = [...rows[0].result, ...rows[1].result];
                results.sort(() => Math.random() - 0.5);

                const sliderItems = results.map(expo => {
                    const img = JSON.parse(expo.identifying_image)[0]

                    return `
                        <a href="/exp/${expo.section_id}" class="swiper-slide">
                            <div class="wrapper is-relative">
                                <h2 class="has-text-white has-text-weight-semibold is-size-2 link-dn">
                                    <p class="link-text">${expo.title}</p>
                                </h2>
                            </div>
                            <img src="${__WEB_MEDIA_ENGINE_URL__}/${img}" alt=""></img>
                        </a>
                    `
                })

                var content = htmlTemplate(`
                    <div class="swiper-wrapper">
                        ${sliderItems.join('')}
                    </div>
                    <div class="wrapper is-relative">
                        <div class="swiper-controls is-flex gap-3 is-align-items-flex-end">
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-pagination is-flex"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                    </div>
                `);
                appendTemplate(options.swiper_container, content);
                swiperHome();
            })

        return true
    },//end set_up

}//end generic
