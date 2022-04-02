import * as d3 from "d3";

function cla2str(cla, s = "") {
    if (typeof (cla) === "number") {
        return cla + ""
    } else {
        for (let i = 0; i < cla.length; i++) {
            if (typeof (cla[i]) === "object") {
                let temp = cla2str(cla[i], "")
                s += "_"
                s += (temp + "")
            } else {
                if (s == "") {
                    s += (cla[i] + "")
                } else {
                    s += "_"
                    s += (cla[i] + "")
                }
            }
        }
    }
    return s
}

function drawGreedyMatrix(data, that) {
    console.log("data",data)
    const layer_num = data.length
    let id = "#" + that.id
    const svg = d3.select(id);
    svg.selectAll("*").remove()
    const width = parseInt(svg.style("width"))
    const height = parseInt(svg.style("height"))
    for (let i = 0; i < layer_num; i++) {
        let layer_data = data[i]
        svg.append("g")
            .selectAll("rect")
            .data(layer_data)
            .join("rect")
            .attr("x", (d, i) => d[1])
            .attr("y", d => d[2])
            .attr("width", (d, i) => d[3])
            .attr("height", d => d[4])
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", "2px")

        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("text")
            .data(layer_data)
            .join("text")
            .attr("x", d => d[1] + d[3] / 2)
            .attr("y", d => d[2] + d[4] / 2)
            .attr("dy", "0.35em")
            .text(d => {
                console.log("d[0]",d[0])
                console.log(cla2str(d[0]))
                return cla2str(d[0])
            });
    }
}

export {drawGreedyMatrix}