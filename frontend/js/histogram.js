import * as d3 from "d3";


function histogram(indexes, that) {
    console.log("indexes", indexes)
    let id = "#" + that.id
    const svg = d3.select(id);
    svg.selectAll("*").remove()
    const width = parseInt(svg.style("width"))
    const height = parseInt(svg.style("height"))

    const margin = {top: 20, right: 30, bottom: 30, left: 40}
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom


    let bin = that.bin

    let indexes_len = indexes.length
    let point_max = 0
    for (let i = 0; i < indexes_len; i++) {
        point_max = d3.max([point_max, d3.max(that[indexes[i]], d => d[1])])
    }

    let line_color = ["#fa5151", "#efcf6e", "#67f6f6", "#6eee83"]
    let xScale = d3.scaleLinear()
        .domain([0, bin - 1])
        .range([margin.left, margin.left + innerWidth / 2])
    let yScale = d3.scaleLinear()
        .domain([point_max, 0])
        .range([margin.top, margin.top + innerHeight])

    let line = d3.line()
        //.defined(d => !isNaN(d.value))
        .x((d, i) => {
            console.log(xScale(d[0]))
            return xScale(d[0])
        })
        .y(d => yScale(d[1]))

    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
            //.text(data.y))
        )
    let xAxis = g => g
        .attr("transform", `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale))

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    for (let i = 0; i < indexes_len; i++) {
        svg.append("path")
            .datum(that[indexes[i]])
            .attr("fill", "none")
            .attr("stroke", line_color[i])
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line);
    }

}

export {histogram}