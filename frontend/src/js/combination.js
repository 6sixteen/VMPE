import * as d3 from "d3";

function combination(data) {
    console.log("data", data)
    const svg = d3.select('#combination');
    // const width = +svg.attr('width');
    // const height = +svg.attr('height');

    const width = 500
    const height = 500

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const unoinNumRange = d3.extent(data.nodes, d => d.unionNum)
    const rChange = d3.scaleLinear()
        .domain(unoinNumRange)
        .range([3, 7])

    const unionDecRange = d3.extent(data.links, d => d.unionDec)
    const lwChange = d3.scaleLinear()
        .domain(unionDecRange)
        .range([3, 7])

    const colideChange = d3.scaleLinear()
        .domain(unoinNumRange)
        .range([5, 15])

    const linkDisChange = d3.scaleLinear()
        .domain(unionDecRange)
        .range([10, 25])

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => {
                console.log(d)
                return d.id
            })
                .distance(d => {
                    // console.log(d.unionDec)
                    return linkDisChange(d.unionDec)
                })
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => colideChange(d.unionNum)))
    ;


    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const drag = simulation => {

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => lwChange(d.unionDec));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => rChange(d.unionNum))
        .attr("fill", d => color(d.group.length))
        .call(drag(simulation));

    node.append("title")
        .text(d => d.group);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
    console.log(nodes)
    console.log(links)
    //invalidation.then(() => simulation.stop());
}

export default combination;