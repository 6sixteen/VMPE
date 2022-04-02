import * as d3 from "d3";

function paraDistributionLine(that) {
    console.log("line")
    let id = "#svg_" + that.id
    const svg = d3.select(id);
    svg.selectAll("*").remove()
    const width = parseInt(svg.style("width"))
    const height = parseInt(svg.style("height"))

    const rectHeight = height
    const data = that.parameterDis
    const data_num = []
    for (let key in data) {
        data_num.push(data[key])
    }

    const data_total = data["ero"] + data["suc"] + data["suc_filter"]
    const data_width = d3.cumsum(data_num)

    const data_x = data_width.map((d, i) => d - data_num[i])
    const color = ["#312c2c", "#eea654", "#5fea22"]

    const xScale = d3.scaleLinear()
        .domain([0, data_total])
        .range([0, width])
    svg.append("g")
        .selectAll("rect")
        .data(data_x)
        .join("rect")
        .attr("x", (d, i) => xScale(d))
        .attr("y", 0)
        .attr("height", rectHeight)
        .attr("width", (d, i) => xScale(data_width[i]))
        .attr("fill", (d, i) => color[i])

}

function paraDistributionLineV(that) {
    let id = "#svg_" + that.id
    const svg = d3.select(id);
    svg.selectAll("*").remove()
    const width = parseInt(svg.style("width"))
    const height = parseInt(svg.style("height"))

    const rect_w = width
    const data = that.parameterDis
    const data_num = []
    for (let key in data) {
        data_num.push(data[key])
    }

    const data_total = data["ero"] + data["suc"] + data["suc_filter"]
    const data_width = d3.cumsum(data_num)

    const data_x = data_width.map((d, i) => d - data_num[i])
    // const color = ["#312c2c", "#eea654", "#5fea22"]
    let color_temp = 'rgb(150,245,114)'
    const color = ['rgba(207,217,223,0.5)','rgba(253,150,53,0.85)','rgba(150,245,114,0.9)']

    const yScale = d3.scaleLinear()
        .domain([0, data_total])
        .range([0, height])
    svg.append("g")
        .selectAll("rect")
        .data(data_x)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d, i) => yScale(d))
        .attr("height", (d, i) => yScale(data_width[i]))
        .attr("width", rect_w)
        .attr("fill", (d, i) => color[i])

}


export {paraDistributionLine, paraDistributionLineV};