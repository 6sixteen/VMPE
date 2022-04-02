import * as d3 from "d3";


//
// function forceLayout(that) {
//     const data = that.graph_force_data
//     console.log("data", data)
//
//
//     const svg = d3.select('#' + that.id);
//     const width = parseInt(that.w)
//     const height = parseInt(that.h)
//
//     console.log("width", width)
//     console.log("height", height)
//
//     const nodes_num = data.nodes.length
//     const r_max = parseInt(Math.min(width, height) / (2 * nodes_num))
//
//
//     debugger
//     // const width = +svg.attr('width');
//     // const height = +svg.attr('height');
//     const links = data.links.map(d => Object.create(d));
//     const nodes = data.nodes.map(d => Object.create(d));
//
//     const simulation = d3.forceSimulation(nodes)
//             // .force("link", d3.forceLink(links)
//             //     // .id(d => {
//             //     //     // console.log("links",d)
//             //     // console.log("link id",d.id)
//             //     //     return d.id
//             //     // })
//             //         .distance(d => {
//             //             console.log(d.unionDec)
//             //             return d.unionDec
//             //         })
//             // )
//             // .force("charge", d3.forceManyBody())
//             .force("center", d3.forceCenter(width / 2, height / 2))
//         // .force("collide", d3.forceCollide().radius(d => d.unionNum / 1000 + 10))
//     ;
//     console.log("links", links)
//     console.log("nodes", nodes)
//     // simulation.tick(100)
//
//     const color = d3.scaleOrdinal(d3.schemeCategory10)
//
//     const drag = simulation => {
//
//         function dragstarted(event) {
//             if (!event.active) simulation.alphaTarget(0.3).restart();
//             event.subject.fx = event.subject.x;
//             event.subject.fy = event.subject.y;
//         }
//
//         function dragged(event) {
//             event.subject.fx = event.x;
//             event.subject.fy = event.y;
//         }
//
//         function dragended(event) {
//             if (!event.active) simulation.alphaTarget(0);
//             event.subject.fx = null;
//             event.subject.fy = null;
//         }
//
//         return d3.drag()
//             .on("start", dragstarted)
//             .on("drag", dragged)
//             .on("end", dragended);
//     }
//
//     const link = svg.append("g")
//         .attr("stroke", "#999")
//         .attr("stroke-opacity", 0.6)
//         .selectAll("line")
//         .data(links)
//         .join("line")
//         .attr("stroke-width", d => Math.sqrt(d.unionDec));
//
//     const node = svg.append("g")
//         .attr("stroke", "#fff")
//         .attr("stroke-width", 1.5)
//         .selectAll("circle")
//         .data(nodes)
//         .join("circle")
//         .attr("r", d => Math.sqrt(d.unionNum))
//         .attr("fill", d => color(d.id))
//         .attr("cx", d => d.x)
//         .attr("cy", d => d.y);
//     //.call(drag(simulation));
//
//     node.append("title")
//         .text(d => d.group);
//
//     simulation.on("tick", () => {
//         link
//             .attr("x1", d => d.source.x)
//             .attr("y1", d => d.source.y)
//             .attr("x2", d => d.target.x)
//             .attr("y2", d => d.target.y);
//
//         node
//             .attr("cx", d => d.x)
//             .attr("cy", d => d.y);
//     });
//     console.log(nodes)
//     console.log(links)
//     console.log(node)
//     //invalidation.then(() => simulation.stop());
// }

function forceLayout(that) {
    const data = that.graph_force_data
    const svg = d3.select('#' + that.id);
    const width = parseInt(that.w)
    const height = parseInt(that.h)

    // const width = +svg.attr('width');
    // const height = +svg.attr('height');


    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const unoinNumRange = d3.extent(data.nodes, d => parseInt(d.unionNum))
    const rChange = d3.scaleLinear()
        .domain(unoinNumRange)
        .range([3, 6])

    const unionDecRange = d3.extent(data.links, d => parseFloat(d.unionDec))
    const lwChange = d3.scaleLinear()
        .domain(unionDecRange)
        .range([3, 7])

    const colideChange = d3.scaleLinear()
        .domain(unoinNumRange)
        .range([5, 100])

    const linkDisChange = d3.scaleLinear()
        .domain(unionDecRange)
        .range([10, 60])

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

    simulation.tick(300)
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
        .attr("stroke-width", d => lwChange(d.unionDec))
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);


    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => rChange(d.unionNum))
        .attr("fill", d => color(d.id))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(drag(simulation));

    node.append("title")
        .text(d => d.id);

    svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(d => d.id)

    // simulation.on("tick", () => {
    //     link
    //         .attr("x1", d => d.source.x)
    //         .attr("y1", d => d.source.y)
    //         .attr("x2", d => d.target.x)
    //         .attr("y2", d => d.target.y);
    //
    //     node
    //         .attr("cx", d => d.x)
    //         .attr("cy", d => d.y);
    // });
    console.log(nodes)
    console.log(links)
    //invalidation.then(() => simulation.stop());
}

function forceLayoutCluster(that) {
    //有聚类信息的View1


    const svg = d3.select('#' + that.id);
    const width = parseInt(that.w)
    const height = parseInt(that.h)

    const cluster_res = that.cluster_res
    const n_cluster = cluster_res.length //聚类个数
    let node_n = 0 //节点个数
    for (let i in cluster_res) {
        node_n = node_n + cluster_res[i].length
    }//计算节点个数

    const result_type = ["n_fail", "n_success_filter", "n_success_out_filter"] //固定 3种执行结果的名称
    const node_area_rect = width * height / node_n //给每个节点分配的最大大小
    const node_l_rect = Math.floor(Math.sqrt(node_area_rect)) //节点最大的直径
    const node_inner_radius = Math.floor(0.15 * 0.5 * node_l_rect)
    const node_outter_radius = Math.floor(0.4 * 0.5 * node_l_rect)
    const node_farest_radius = [node_outter_radius + 5, node_outter_radius + 0.2 * 0.5 * node_l_rect]
    const node_r = node_farest_radius[1]

    let donut_info = {} //存储每一个dounut的位置信息

    //先假定n_cluster = 3 的情况下的布局把
    const
        center_cluster = {
            "0": [0.25 * width, 0.25 * height],
            "1": [0.75 * width, 0.3 * height],
            "2": [0.5 * width, 0.6 * height]
        }

    const cluster_element_force_data = that.cluster_element_force_data
    const img_features = that.img_feature


    //对cluster_element_force_data 进行转换处理，方便后续增删的操作
    let element_force_data = {"nodes": {}, "links": {}} //links: "source_id":[{},{}...]
    for (let cluster in cluster_element_force_data) {
        let cluster_object = cluster_element_force_data[cluster]
        let nodes = cluster_object["nodes"]
        for (let node in nodes) {
            element_force_data["nodes"][nodes[node]["id"]] = deepCopy(nodes[node])
        }
        let links = cluster_object["links"]
        for (let link in links) {
            if (element_force_data["links"].hasOwnProperty(links[link]["source"])) {
                element_force_data["links"][links[link]["source"]].push(links[link])
            } else {
                element_force_data["links"][links[link]["source"]] = [links[link]]
            }

        }
    }
    let hist_range = []
    for (let i in img_features) {
        hist_range.push(d3.extent(img_features[i]["5_pin_histo"]))
    }
    // 观察 然后定义 比例尺
    const histo_r_change = d3.scaleLinear()
        .domain([0, 10000]) //通过观察hist_range 定义的 这样比较方便
        .range(node_farest_radius)

    const histo_angle_change = d3.scaleLinear()
        .domain([0, 255]) //通过观察hist_range 定义的 这样比较方便
        .range([0, Math.PI])


    //遍历所有节点，得到所有节点的 unionNum （参数集合大小）
    // 观察 然后定义 比例尺
    let unionNum_range = []
    for (let i in cluster_element_force_data) {
        let cluster_element_nodes = cluster_element_force_data[i]["nodes"]
        unionNum_range.push(d3.extent(cluster_element_nodes.map(d => d["unionNum"])))
    }
    const k_r = d3.scaleLinear()
        .domain([0, 5000])
        .range([0.5, 1])
    //node 要乘的系数


    for (let key_cluster in cluster_element_force_data) {
        const data = cluster_element_force_data[key_cluster]

        const links = data.links.map(d => Object.create(d));
        const nodes = data.nodes.map(d => Object.create(d));

        const unoinNumRange = d3.extent(data.nodes, d => parseInt(d.unionNum))
        const rChange = d3.scaleLinear()
            .domain(unoinNumRange)
            .range([3, 6])

        const unionDecRange = d3.extent(data.links, d => parseFloat(d.unionDec))
        const lwChange = d3.scaleLinear()
            .domain(unionDecRange)
            .range([3, 7])

        // const colideChange = d3.scaleLinear()
        //     .domain(unoinNumRange)
        //     .range([5, 60])

        const colideChange = d3.scaleLinear()
            .domain([0.5, 1])
            .range([0.5 * node_r, node_r]) // colideChange 关键是要映射成圆的实际半径吗 ！！
        //可能要加一个表示 cluster 数量的值

        const linkDisChange = d3.scaleLinear()
            .domain(unionDecRange)
            .range([10, 50])

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
            .force("center", d3.forceCenter(center_cluster[key_cluster][0], center_cluster[key_cluster][1]))
            .force("collide", d3.forceCollide().radius(d => colideChange(k_r(d.unionNum))))
        ;

        simulation.tick(300)

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


        //绘制节点

        //三种执行结果的颜色
        const colors = ['#323131', '#76f378', '#f5e188']
        const result_color = d3.scaleOrdinal(result_type, colors)


        for (let i in nodes) {
            let node = nodes[i]
            const arc = d3.arc()
                .innerRadius(node_inner_radius * k_r(node["unionNum"]))
                .outerRadius(node_outter_radius * k_r(node["unionNum"]))
            let nodeid = "img_" + node.id
            let pie_data = [{type: result_type[0], value: node[result_type[0]]},
                {type: result_type[1], value: node[result_type[1]]},
                {type: result_type[2], value: node[result_type[2]]}]
            let pie = d3.pie().value(d => d.value)
            let pieArcs = pie(pie_data)
            // console.log("pie_data", pie_data)
            // console.log("pieArcs", pieArcs)

            donut_info[node.id] = {}
            donut_info[node.id]["center"] = [node.x, node.y]
            donut_info[node.id]["r"] = node_outter_radius * k_r(node["unionNum"])

            svg.append('g')
                .attr('id', nodeid)
                // The donut arcs will be centered around this point
                .attr('transform', `translate(${node.x},${node.y})`)
                // .on("click", function (d) {
                //     debugger
                //     console.log(d)
                //     console.log(this)
                // })
                //在外面定义一个变量收集点击的对象 重复点击取消 最后在设置一个事件传数据
                .selectAll('path')
                // Our data is the arcs, rather than the data object
                // so that we have access to the arc data for rendering the paths
                .data(pieArcs)
                .join('path')
                .style('stroke', 'white')
                .style('stroke-width', 2)
                .style('fill', d => result_color(d.data.type))
                // here we pass the arc generator. Remember, an accessor function
                // receives the data (d) as the first argument, so rather than doing (d) => arc(d)
                // we can just pass it like below. In this case, our data is the arc descriptor object
                // so the d attribute will be set to the arc's path string. Take a minute to let that sink in
                .attr('d', arc)

            let img_feature = img_features[node.id]
            let angle = img_feature["5_pin_angle"] * Math.PI / 180
            let node_g = svg.select('#' + nodeid)

            //方向特征
            node_g.append("line")
                .attr("x1", -(node_inner_radius) * Math.cos(angle) * k_r(node["unionNum"]))
                .attr("y1", -(node_inner_radius) * Math.sin(angle) * k_r(node["unionNum"]))
                .attr("x2", (node_inner_radius) * Math.cos(angle) * k_r(node["unionNum"]))
                .attr("y2", (node_inner_radius) * Math.sin(angle) * k_r(node["unionNum"]))
                .style('stroke-width', 4)
                .style("stroke", "black")

            node_g.append("text")
                .attr("font-size", "30")
                .text(nodeid.split("_")[1])

            //光照特征
            let histo = img_feature["5_pin_histo"]

            const histo_line = d3.line()
                //.defined(d => !isNaN(d.value))
                .x((d, i) => {

                    let x = histo_r_change(d) * Math.cos(histo_angle_change(i)) * k_r(node["unionNum"])
                    // console.log("d", d, " i", i, " x", x," histo_r_change(d)",histo_r_change(d) )
                    return x
                })
                .y((d, i) => {
                    let y = -histo_r_change(d) * Math.sin(histo_angle_change(i)) * k_r(node["unionNum"])
                    return y
                })

            node_g.append("path")
                .datum(histo)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", histo_line);

        }


        let brush_start_time;
        let brush_end_time;
        let brush_img = [];
        let brush_flag = false;

        function brushStart({selection}) {
            brush_flag = false;
            brush_start_time = new Date();
        }

        //这个版本条件响应为什么不及时呢 还是有点问题
        // function brushend({selection}) {
        //     brush_end_time = new Date();
        //     console.log(parseInt(brush_end_time - brush_start_time) / 1000)
        //     console.log(!brush_flag)
        //     if (parseInt((brush_end_time - brush_start_time) / 1000) > 1 && !brush_flag) {
        //         console.log("123")
        //         let target = svg.selectAll("g").filter(function (d, i) {
        //             if (this.id.indexOf("img_") != -1) {
        //                 if(this.transform.animVal['0'].matrix.e <selection[1][0] && this.transform.animVal['0'].matrix.e >selection[0][0]
        //                 && this.transform.animVal['0'].matrix.f <selection[1][1] && this.transform.animVal['0'].matrix.e > selection[0][1]) {
        //                     brush_img.push(this.id.split("_")[1])
        //                     return true
        //                 }
        //
        //             }
        //         })
        //
        //         //进行组件之间的通信
        //         brush_flag = true
        //         that.$emit("brush_img",brush_img)
        //         console.log("brush_img",brush_img)
        //     }
        // }


        //节流放到app.vue 里面去做
        function brushend({selection}) {
            if (selection[1][0] - selection[0][0] < 5 && selection[1][1] - selection[0][1] < 5) { //点击空白处的判断
                return
            } else {
                let brush_temp = []
                let target = svg.selectAll("g").filter(function (d, i) {
                    if (this.id.indexOf("img_") != -1) {
                        if (this.transform.animVal['0'].matrix.e < selection[1][0] && this.transform.animVal['0'].matrix.e > selection[0][0]
                            && this.transform.animVal['0'].matrix.f < selection[1][1] && this.transform.animVal['0'].matrix.e > selection[0][1]) {
                            let img_temp = this.id.split("_")[1]
                            // if(brush_img.indexOf(img_temp)==-1)
                            //     brush_img.push(this.id.split("_")[1])
                            brush_temp.push(img_temp)
                        }

                    }
                })
                //进行组件之间的通信
                brush_img = brush_temp

                //给view2 在传点额外的信息
                let brush_img_info = {}
                brush_img_info["brush_img"] = brush_img
                let graph = {"nodes": [], "links": []}
                //我要通过遍历原始数据的方式 找到brush_img 对应的一些数据
                let unique_link = []
                for (let indice in brush_img) {
                    if(indice==="equals")
                        continue
                    let img_indice = brush_img[indice]
                    //放点
                    let node = deepCopy(element_force_data["nodes"][img_indice])
                    graph["nodes"].push(node)
                    //放边 而且边连接的节点要在brush_img 中
                    let links = element_force_data["links"][img_indice]
                    for (let link_indice in links) {
                        if (brush_img.indexOf(links[link_indice].target) !== -1) {
                            //在brush_img 中

                            //判断link是否重复 7-17 和 17-7 是一样的
                            let link_id;
                            if (parseInt(links[link_indice].source) < parseInt(links[link_indice].target)) {
                                link_id = links[link_indice].source + "_" + links[link_indice].target
                            } else {
                                link_id = links[link_indice].target + "_" + links[link_indice].source
                            }
                            if (unique_link.indexOf(link_id) === -1) {
                                graph["links"].push(deepCopy(links[link_indice]))
                                unique_link.push(link_id)
                            }
                        }
                    }
                }
                brush_img_info["graph"] = graph
                // debugger
                that.$emit("brush_img_info", brush_img_info)
                console.log("brush_img", brush_img_info)
            }


        }

        const brush = d3
            .brush()
            .on("start", brushStart)
            .on("end", brushend);

        // create svg group element for brush
        const gBrush = svg.append("g").attr("class", "gBrush");
        gBrush.call(brush)

        // 绘制边
        // 绘制cluster内的边
        // 直接绘制所有边
        let line_draw = [] //记录 防止1-2 2-1重复绘画
        let line_draw_data = {}
        const line = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveCatmullRom.alpha(0.5));

        const g_line = svg.append("g")
            .attr("id", "lines_group")


        let cluster_links = cluster_element_force_data[key_cluster]["links"]
        for (let i = 0, len = cluster_links.length; i < len; i++) {
            let link = cluster_links[i]
            let source = link["source"]
            let target = link["target"]
            if (parseInt(source) > parseInt(target)) {
                let temp = source
                source = target
                target = temp
            }
            let tag = source + "_" + target
            if (line_draw.indexOf(tag) === -1) {
                //绘制
                if (line_draw_data.hasOwnProperty(source)) {
                    line_draw_data[source][target] = {"dec": link["unionDec"]}
                    //计算一下线的坐标
                    let source_donut = donut_info[source]
                    let target_donut = donut_info[target]
                    let donut_info_copy = deepCopy(donut_info)
                    delete (donut_info_copy[source])
                    delete (donut_info_copy[target])
                    // console.log("source", source)
                    // console.log("target", target)
                    let line_points = getPointsLinkFromTwoCircle(source_donut, target_donut, donut_info_copy)
                    // line_points.sort(function (a, b) {
                    //     return a[0] - b[0]
                    // })

                    //绘制
                    // if (source === "6" && target === "16") {
                    //     g_line.append("path")
                    //         .datum(line_points)
                    //         .attr("fill", "none")
                    //         .attr("stroke", "steelblue")
                    //         .attr("stroke-width", 1.5)
                    //         .attr("stroke-linejoin", "round")
                    //         .attr("stroke-linecap", "round")
                    //         .attr("d", line)
                    //     debugger
                    // }

                    g_line.append("path")
                        .datum(line_points)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5) //link["unionDec"] 进行映射
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("d", line)

                } else {
                    line_draw_data[source] = {}
                }
            }
        }


        console.log("donut_info", donut_info)

        // const link = svg.append("g")
        //     .attr("stroke", "#999")
        //     .attr("stroke-opacity", 0.6)
        //     .selectAll("line")
        //     .data(links)
        //     .join("line")
        //     .attr("stroke-width", d => lwChange(d.unionDec))
        //     .attr("x1", d => d.source.x)
        //     .attr("y1", d => d.source.y)
        //     .attr("x2", d => d.target.x)
        //     .attr("y2", d => d.target.y);


        // debugger
        // const node = svg.append("g")
        //     .attr("stroke", "#fff")
        //     .attr("stroke-width", 1.5)
        //     .selectAll("circle")
        //     .data(nodes)
        //     .join("circle")
        //     .attr("r", d => rChange(d.unionNum))
        //     .attr("fill", d => color(d.id))
        //     .attr("cx", d => d.x)
        //     .attr("cy", d => d.y)
        //     .call(drag(simulation));
        //
        // node.append("title")
        //     .text(d => d.id);
        //
        // svg.append("g")
        //     .selectAll("text")
        //     .data(nodes)
        //     .join("text")
        //     .attr("x", d => d.x)
        //     .attr("y", d => d.y)
        //     .text(d => d.id)
    }


}

function intersectLineCircle(p1, p2, center, r) {
    let sign = function (x) {
        return x < 0.0 ? -1 : 1;
    };
    let x1 = []
    x1.push(p1[0] - center[0])
    x1.push(p1[1] - center[1])
    let x2 = []
    x2.push(p2[0] - center[0])
    x2.push(p2[1] - center[1])

    let dv = []
    dv.push(x2[0] - x1[0])
    dv.push(x2[1] - x1[1])

    let dr = Math.sqrt(dv[0] * dv[0] + dv[1] * dv[1])
    let D = x1[0] * x2[1] - x2[0] * x1[1]

    // evaluate if there is an intersection
    let di = r * r * dr * dr - D * D
    if (di < 0.0)
        return []

    let t = Math.sqrt(di)
    let ip = []
    ip.push([(D * dv[1] + sign(dv[1]) * dv[0] * t) / (dr * dr) + center[0], (-D * dv[0] + Math.abs(dv[1]) * t) / (dr * dr) + center[1]])
    if (di > 0.0) {
        ip.push([(D * dv[1] - sign(dv[1]) * dv[0] * t) / (dr * dr) + center[0],
            (-D * dv[0] - Math.abs(dv[1]) * t) / (dr * dr) + center[1]])
    }
    return ip
}

function deepCopy(obj) {
    // 只拷贝对象
    if (typeof obj !== 'object') return obj;
    // 根据obj的类型判断是新建一个数组还是一个对象
    var newObj = obj instanceof Array ? [] : {};
    for (var key in obj) {
        // 遍历obj,并且判断是obj的属性才拷贝
        if (obj.hasOwnProperty(key)) {
            // 判断属性值的类型，如果是对象递归调用深拷贝
            newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
        }
    }
    return newObj;
}

function dis(p1, p2 = [0, 0]) {
    //计算两个点之间的距离，默认p2=[0,0]
    return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]))
}

function getMinDistancePoint(p1, p2, p3) {
    //计算p1-p3距离 p2-p3距离 返回距离近的点
    let dis1 = dis(p1, p3)
    let dis2 = dis(p2, p3)
    return dis1 < dis2 ? p1 : p2
}

function getMaxDistancePoint(p1, p2, p3) {
    //计算p1-p3距离 p2-p3距离 返回距离近的点
    let dis1 = dis(p1, p3)
    let dis2 = dis(p2, p3)
    return dis1 < dis2 ? p2 : p1
}

function getLine(p1, p2) {
    //给出两点，返回直线的a,b,c
    //直线方程 ax+by+c = 0
    let a = p2[1] - p1[1]
    let b = p1[0] - p2[0]
    let c = p2[0] * p1[1] - p1[0] * p2[1]
    return [a, b, c]
}

function getVerticalPoints(p1, p2, p3) {
    //求p3到p1，p2构成直线的垂点
    let line = getLine(p1, p2)
    console.log("line", line)
    return [
        (line[1] * line[1] * p3[0] - line[0] * line[1] * p3[1] - line[0] * line[2]) / (line[0] * line[0] + line[1] * line[1]),
        (line[0] * line[0] * p3[1] - line[0] * line[1] * p3[0] - line[1] * line[2]) / (line[0] * line[0] + line[1] * line[1])
    ]
}

function judgeExtension(p1, p2, p3) {
    //前提：三点构成直线 判断p3是在线段内还是延长线上
    //1 是在线段内
    if (p1[0] === p2[0]) {
        //是一条直线 x = p1[0]
        let y_min = p1[1] < p2[1] ? p1[1] : p2[1]
        let y_max = p1[1] < p2[1] ? p2[1] : p1[1]
        if (p3[1] < y_max && p3[1] > y_min) {
            return 1
        } else return -1
    }

    if (p1[1] === p2[1]) {
        //是一条直线 y = p1[1]
        let x_min = p1[0] < p2[0] ? p1[0] : p2[0]
        let x_max = p1[0] < p2[0] ? p2[0] : p1[0]
        if (p3[0] < x_max && p3[0] > x_min) {
            return 1
        } else return -1
    }

    //不和坐标轴平行
    let x_min = p1[0] < p2[0] ? p1[0] : p2[0]
    let x_max = p1[0] < p2[0] ? p2[0] : p1[0]
    if (p3[0] < x_max && p3[0] > x_min) {
        return 1
    } else return -1
}

function getPointsLinkFromTwoCircle0(source_circle, target_circle, circles) {
    //这个版本被抛弃 line的起始点有问题 圆上的line应该固定 都取圆下面的点
    //而且没有做点的排序

    //source_circle:{"center":[x,y],"r":r}
    //circles:{"0":object like source_circle,...} circles 不能包括source 和 target
    //先得到起点和终点
    let source_center = source_circle["center"]
    let target_center = target_circle["center"]
    let source_r = source_circle["r"]
    let target_r = target_circle["r"]
    let source_intersect_points = intersectLineCircle(source_center, target_center, source_center, source_r)
    let target_intersect_points = intersectLineCircle(source_center, target_center, target_center, target_r)

    let source_line = getMinDistancePoint(source_intersect_points[0], source_intersect_points[1], target_center)
    let target_line = getMinDistancePoint(target_intersect_points[0], target_intersect_points[1], source_center)

    let res = []
    res.push(source_line)
    for (let key in circles) {
        let circle_temp = circles[key]
        let intersect_temp = intersectLineCircle(source_line, target_line, circle_temp["center"], circle_temp["r"])
        if (intersect_temp.length === 0) {

        } else if (intersect_temp.length === 1) {

        } else {
            //求圆心到直线的垂点
            let v_point = getVerticalPoints(intersect_temp[0], intersect_temp[1], circle_temp["center"])
            //因为线是会延长的，要判断点的位置
            if (judgeExtension(source_line, target_line, v_point) === 1) {
                //在延长线上
                let circle_points = intersectLineCircle(v_point, circle_temp["center"], circle_temp["center"], circle_temp["r"])
                let control_point = getMinDistancePoint(circle_points[0], circle_points[1], v_point)
                res.push(control_point)
            }
        }
    }
    res.push(target_line)
    return res

}


function getPointsLinkFromTwoCircle(source_circle, target_circle, circles) {


    //source_circle:{"center":[x,y],"r":r}
    //circles:{"0":object like source_circle,...} circles 不能包括source 和 target
    //先得到起点和终点
    let source_center = source_circle["center"]
    let target_center = target_circle["center"]
    let source_r = source_circle["r"]
    let target_r = target_circle["r"]

    let source_line = [source_center[0], source_center[1] + source_r] //直接取圆的正下方
    let target_line = [target_center[0], target_center[1] + target_r] //直接取圆的正下方

    let res = []
    res.push({"point": source_line, "indice": source_center[0]})
    //先求取圆本身上的点
    if (source_line[0] === target_line[0]) {
        //直线刚好相切 没有交点
    } else {
        //先判断在哪个圆上 （下面的圆）
        if (source_line[1] > target_line[1]) {
            //交点在source这个圆上
            //先求一下交点 （直线和圆）
            let circle_points = intersectLineCircle(source_line, target_line, source_center, source_r) //两个交点
            let circle_point = getMaxDistancePoint(circle_points[0], circle_points[1], source_line) //取两个交点中的另一个
            let v_point = getVerticalPoints(source_line, circle_point, source_center) //先得到垂点

            let circle_points_v = intersectLineCircle(v_point, source_center, source_center, source_r) //垂线的两个交点

            let control_point = getMinDistancePoint(circle_points_v[0], circle_points_v[1], v_point) //垂线的两个交点中取里垂点较近的那个点
            res.push({"point": control_point, "indice": v_point[0]})
        } else {
            //交点在target这个圆上
            //先求一下交点 （直线和圆）
            let circle_points = intersectLineCircle(source_line, target_line, target_center, target_r) //两个交点
            let circle_point = getMaxDistancePoint(circle_points[0], circle_points[1], target_line) //取两个交点中的另一个
            let v_point = getVerticalPoints(target_line, circle_point, target_center) //先得到垂点
            let circle_points_v = intersectLineCircle(v_point, target_center, target_center, target_r) //垂线的两个交点
            let control_point = getMinDistancePoint(circle_points_v[0], circle_points_v[1], v_point) //垂线的两个交点中取里垂点较近的那个点
            res.push({"point": control_point, "indice": v_point[0]})
        }
    }


    //路途中交点的情况
    for (let key in circles) {
        let circle_temp = circles[key]
        let intersect_temp = intersectLineCircle(source_line, target_line, circle_temp["center"], circle_temp["r"])
        if (intersect_temp.length === 0) {

        } else if (intersect_temp.length === 1) {

        } else {
            //求圆心到直线的垂点
            let v_point = getVerticalPoints(intersect_temp[0], intersect_temp[1], circle_temp["center"])
            //因为线是会延长的，要判断点的位置
            if (judgeExtension(source_line, target_line, v_point) === 1) {
                //在延长线上
                let circle_points = intersectLineCircle(v_point, circle_temp["center"], circle_temp["center"], circle_temp["r"])
                let control_point = getMinDistancePoint(circle_points[0], circle_points[1], v_point)
                res.push({"point": control_point, "indice": v_point[0]})
            }
        }
    }


    res.push({"point": target_line, "indice": target_center[0]})
    //排下序
    res.sort(function (a, b) {
        return a["indice"] - b["indice"]
    })

    let res_points = []
    for (let i = 0, len = res.length; i < len; i++) {
        res_points.push(res[i]["point"])
    }

    return res_points

}

export {forceLayout, forceLayoutCluster};