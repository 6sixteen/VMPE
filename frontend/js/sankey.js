import * as d3 from "d3";
import * as d3sankey from "d3-sankey"

function sankey(data, that) {

    const svg = d3.select('#' + that.id);
    // if (svg._groups[0][0] == null) {
    //     return
    // }
    svg.selectAll("*").remove()
    const width = 300
    const height = 300
    if (data["nodes"].length === 0) {
        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .append("text")
            .attr("x", 0.5*width )
            .attr("y", 0.5*height)
            .attr("dy", "0.35em")
            .text("空集")
        return
    }
    console.log("sankey nodes data",data["nodes"])
    const sankey = d3sankey.sankey()
        .nodeId(d => d.name)
        .nodeAlign(d3sankey.sankeyJustify)
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 5], [width - 1, height - 5]]);

    const sankey_t = ({nodes, links}) => sankey({
        nodes: nodes.map(d => Object.assign({}, d)),
        links: links.map(d => Object.assign({}, d))
    })

    const {nodes, links} = sankey_t(data);

    let color10 = d3.scaleOrdinal(d3.schemeCategory10);
    let color = d => color10(d.category === undefined ? d.name : d.category);

    const format_t = d3.format(",.0f");
    const format = data.units ? d => `${format_t(d)} ${data.units}` : format_t;

    svg.append("g")
        .attr("stroke", "#000")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", color)
        .append("title")
        .text(d => `${d.name}\n${format(d.value)}`);

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("g")
        .data(links)
        .join("g")
        .style("mix-blend-mode", "multiply");


    let edgeColor = "input"
    //input output none path

    if (edgeColor === "path") {
        const gradient = link.append("linearGradient")
            .attr("id", d => (d.uid = DOM.uid("link")).id)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("x2", d => d.target.x0);

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => color(d.source));

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d => color(d.target));
    }

    link.append("path")
        .attr("d", d3sankey.sankeyLinkHorizontal())
        .attr("stroke", d => edgeColor === "none" ? "#aaa"
            : edgeColor === "path" ? d.uid
                : edgeColor === "input" ? color(d.source)
                    : color(d.target))
        .attr("stroke-width", d => Math.max(1, d.width));


    link.append("title")
        .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name);
}

export {sankey};