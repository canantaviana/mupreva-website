// https://observablehq.com/@d3/sunburst@242
export default function define(runtime, observer) {

    const main = runtime.module();

    // file
    // const fileAttachments = new Map([["flare-2.json",new URL("./files/e65374209781891f37dea1e7a6e1c5e020a3009b8aedf113b4c80942018887a1176ad4945cf14444603ff91d3da371b3b0d72419fa8d2ee0f6e815732475d5de",import.meta.url)]]);
    // const fileAttachments = new Map([["flare-2.json",new URL("./files/chronologic",import.meta.url)]]);
    // const fileAttachments = new Map([["flare-2.json",new URL("./files/2",import.meta.url)]]);
    // main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    // main.variable(observer()).define(["md"], function(md){return(
    //   md`Sunburst Thesaurus QDP`
    // )});

    // chart
    main.variable(observer("chart"))
        .define("chart", ["partition", "data", "d3", "color", "arc", "format", "autoBox"], function (partition, data, d3, color, arc, format, autoBox) {

            const root = partition(data);

            const svg = d3.create("svg");

            // Define the div for the tooltip
            const div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            // logo append at center
            const logo = svg.append("g")
                // .attr("text-anchor", "middle")
                .style("user-select", "none")
                .selectAll("text")
                .data(root.descendants().slice(1))
                .join("svg:image")
                .attr("xlink:href", "./tpl/assets/images/logo_museo_qdp_monogram.svg")
                .attr("width", 50)
                .attr("height", 50)
                .attr("transform", function (d) {
                    return `translate(-25,-25)`;
                })
            // .on('click', d => { console.log('over element', d) })
            // .on('mouseover', (d) => { console.log('On mouse over', d) });

            // path
            const path = svg.append("g")
                .attr("fill-opacity", 0.6)
                .selectAll("path")
                .data(root.descendants().filter(d => d.depth))
                .join("path")
                .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name.label); })
                .attr("d", arc)
                .style("cursor", "pointer")
                .on("click", clicked)
                // .on("mouseenter", mouseentered)
                // .on("mouseout", mouseouted)
                .on("mouseenter", function (e, d) {
                    d3.select(this).attr("fill-opacity", 0.4)
                    // div.transition()
                    //		.duration(100)
                    //		.style("opacity", .99);
                    div.html(d.data.name.label)
                        .style("left", (e.clientX) + "px")
                        .style("top", (e.clientY - 40) + "px");
                    div.style("opacity", 1);
                })
                .on("mouseout", function (e, d) {
                    d3.select(this).attr("fill-opacity", 0.6)
                    // div.transition()
                    //     .duration(200)
                    //     .style("opacity", 0);
                    div.style("opacity", 0);
                })
            // .append("title")
            //	// .text(d => `${d.ancestors().map(d => d.data.name.label).reverse().join("/")}\n${format(d.value)}`);
            //	.text(d => d.data.name.label);

            function clicked(e, d) {
                // term_id
                const term_id = d.data.name.term_id
                // console.log("term_id:",term_id);

                // change backgound color
                // d3.select(this).style("fill", "magenta");
                d3.select(this).attr("fill-opacity", 0.2)

                // open thesaurus searchin selected term
                const url = BASE_LINKS + 'thesaurus/' + term_id
                // window.location.href = url
                window.open(url)
            }

            function trim_name(name) {
                const max_len = 10
                if (name.length > max_len) {
                    name = name.substring(0, max_len) + '..'
                }
                return name
            }

            // label
            const label = svg.append("g")
                .attr("pointer-events", "none")
                .attr("text-anchor", "middle")
                .attr("font-size", 9)
                .attr("font-family", "sans-serif")
                .style("user-select", "none")
                .selectAll("text")
                .data(root.descendants().filter(d => d.depth && (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10))
                .join("text")
                .attr("transform", function (d) {
                    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                    const y = (d.y0 + d.y1) / 2;
                    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
                })
                .attr("dy", "0.35em")
                .text(d => trim_name(d.data.name.label));

            svg.style("opacity", 0);
            svg.transition()
                .duration(600)
                .style("opacity", 1);

            return svg.attr("viewBox", autoBox).node();
        });

    // autoBox
    main.define("autoBox", function () {
        return (
            function autoBox() {
                document.body.appendChild(this);
                const { x, y, width, height } = this.getBBox();
                document.body.removeChild(this);
                return [x, y, width, height];
            }
        )
    });

    // data
    // main.variable(observer("data")).define("data", ["FileAttachment"], function(FileAttachment){
    //   return(
    //     FileAttachment("flare-2.json").json()
    // )});
    main.define("data", function () {
        const ts_data_promise = project.get_ts_data()
        // console.log("++++++++ ts_data_promise:",ts_data_promise);
        return (
            ts_data_promise
        )
    });

    // partition
    main.define("partition", ["d3", "radius"], function (d3, radius) {
        return (
            data => d3.partition()
                .size([2 * Math.PI, radius])
                (d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value))
        )
    });

    main.define("color", ["d3", "data"], function (d3, data) {
        return (
            d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
        )
    });

    main.define("format", ["d3"], function (d3) {
        return (
            d3.format(",d")
        )
    });

    main.define("width", function () {
        return (
            975
        )
    });

    // main.define("height", function(){return(
    // 	975
    // )});

    main.define("radius", ["width"], function (width) {
        return (
            width / 2
        )
    });

    main.define("arc", ["d3", "radius"], function (d3, radius) {
        return (
            d3.arc()
                .startAngle(d => d.x0)
                .endAngle(d => d.x1)
                .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
                .padRadius(radius / 2)
                .innerRadius(d => d.y0)
                .outerRadius(d => d.y1 - 1)
        )
    });

    main.define("d3", ["require"], function (require) {
        return (
            require("d3@6")
        )
    });


    return main;
}
