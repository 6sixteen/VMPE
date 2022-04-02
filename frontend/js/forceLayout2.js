import * as d3 from "d3";
import { postRequest } from "../js/dataRequest"
import { BubbleSet, PointPath, ShapeSimplifier, BSplineShapeGenerator } from './bubblesets'

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
        .range([25, 50])

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
    // console.log(nodes)
    // console.log(links)
    //invalidation.then(() => simulation.stop());
}

let nodeList = [];
let donut_info = {}

function forceLayoutCluster(that) {
    //有聚类信息的View1


    const svg = d3.select('#' + that.id);
    const svg_1 = d3.select('#' + that.id + "_1");
    const width = parseInt(that.w)
    const height = parseInt(that.h)

    svg.selectAll("*").remove();
    svg_1.selectAll("*").remove();

    const img_address = deepCopy(that.img_address)
    const cluster_res = deepCopy(that.cluster_res)
    cluster_res[Object.keys(cluster_res).length] = deepCopy(that.no_parameter_image)
    let node_n = 0 //节点个数
    for (let i in cluster_res) {
        node_n = node_n + cluster_res[i].length
    }//计算节点个数

    // 保存每个节点的坐标及半径，用作节点移动判断
    nodeList = [];

    const group_data = deepCopy(that.group_data)
    const group_num = deepCopy(that.filter_config.group_number)
    let failGroup = new Array()
    let successGroup = new Array()
    group_data.forEach((item) => {
        let failSum = 0
        item.failNum.forEach((e) => (failSum += e))
        failGroup.push(failSum ? item.failNum.map((e) => (e / failSum)) : item.failNum.map((e) => (0)))

        let successSum = 0
        item.successNum.forEach((e) => (successSum += e))
        successGroup.push(successSum ? item.successNum.map((e) => (e / successSum)) : item.successNum.map((e) => (0)))
    })
    // console.log("failGroup", failGroup);
    // console.log("successGroup", successGroup);

    // const result_type = ["n_fail", "n_success_filter", "n_success_out_filter"] //固定 3种执行结果的名称
    const node_area_rect = width * height / node_n //给每个节点分配的最大大小
    const node_l_rect = Math.floor(Math.sqrt(node_area_rect)) //节点最大的直径
    const node_inner_radius = Math.floor(0.15 * 0.5 * node_l_rect)
    const node_outter_radius = Math.floor(0.35 * 0.5 * node_l_rect)
    const node_middle_radius = (node_inner_radius + node_outter_radius) / 2
    const node_farest_radius = [node_outter_radius + 5, node_outter_radius + 0.2 * 0.5 * node_l_rect]
    const node_r = node_farest_radius[1]

    donut_info = {} //存储每一个dounut的位置信息
    let class_info = {} // 存储每一个类的位置信息（用于类与类之间的连线）

    //先假定n_cluster = 3 的情况下的布局把
    const
        center_cluster = {
            "0": [0.15 * width, 0.3 * height],
            "1": [0.65 * width, 0.25 * height],
            "2": [0.4 * width, 0.55 * height],
            "3": [0.8 * width, 0.6 * height]
        }

    const cluster_element_force_data = deepCopy(that.cluster_element_force_data)
    const cluster_force_data = deepCopy(that.cluster_force_data)
    const img_features = deepCopy(that.img_feature)


    //对cluster_element_force_data 进行转换处理，方便后续增删的操作
    let element_force_data = { "nodes": {}, "links": {} } //links: "source_id":[{},{}...]
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
        .range([0.6, 1])
    //node 要乘的系数

    // 类的颜色
    let maxUnionNum = cluster_force_data.nodes[0].unionNum;
    let minUnionNum = cluster_force_data.nodes[0].unionNum;
    cluster_force_data.nodes.forEach((item) => {
        if (item.unionNum > maxUnionNum) maxUnionNum = item.unionNum;
        if (item.unionNum < minUnionNum) minUnionNum = item.unionNum;
    })
    // let classInfo = [];
    const class_color = d3.scaleLinear().domain([minUnionNum, maxUnionNum]).range(["rgba(55,126,184,0.2)", "rgba(55,126,184,1)"]);

    if (that.showZero) {
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
                .range([0.5 * node_r, node_r * 2]) // colideChange 关键是要映射成圆的实际半径吗 ！！
            //可能要加一个表示 cluster 数量的值

            const linkDisChange = d3.scaleLinear()
                .domain(unionDecRange)
                .range([10, 50])

            const simulation = d3.forceSimulation(nodes)
                // 链接力
                .force("link", d3.forceLink(links).id(d => {
                    return d.id
                })
                    .distance(d => {
                        // console.log(d.unionDec)
                        return linkDisChange(d.unionDec)
                    })
                )
                // 万有引力
                .force("charge", d3.forceManyBody().strength(500))
                // 居中力
                .force("center", d3.forceCenter(center_cluster[key_cluster][0], center_cluster[key_cluster][1]))
                // 碰撞力
                .force("collide", d3.forceCollide().radius(d => colideChange(k_r(d.unionNum))))

            simulation.tick(300)

            nodes.forEach((item) => {
                item["r"] = node_outter_radius * k_r(item["unionNum"]) * 2.5
            })
            nodeList.push(nodes);

            const drag = (simulation, nodes, id, svg, cluster_element_force_data, key_cluster, donut_info) => {

                let isDragged = false
                function dragstarted(event) {
                    console.log("dragstarted")
                    // console.log("id", id);
                    // console.log("key_cluster", key_cluster)
                    // console.log(event.x, event.y);
                }

                function dragged(event) {
                    console.log("dragged")
                    isDragged = true
                    // d3.select(this)
                    //     .attr('transform', `translate(${event.x},${event.y})`)
                    donut_info[id]["center"] = [event.x, event.y]
                    svg.selectAll("#lines_group" + key_cluster).remove()
                    draw_line(svg, cluster_element_force_data, key_cluster);
                }

                function dragended(event) {
                    console.log("dragended")
                    if (isDragged) {
                        let flag = -1; // 判断点是否在别的椭圆内（-1: 不在，x: 在并且在第 x 类中）
                        nodeList.forEach((item, index) => {
                            let a = false;
                            item.forEach((i) => {
                                if (Math.sqrt((event.x - i.x) * (event.x - i.x) + (event.y - i.y) * (event.y - i.y)) < i.r) {
                                    a = true;
                                }
                            })
                            if (a) {
                                flag = index;
                            }
                        })
                        if (flag >= 0 && Number(key_cluster) !== Number(flag) && Number(key_cluster) !== (nodeList.length - 1) && Number(flag) !== (nodeList.length - 1)) {
                            console.log("点", id, "原来在", key_cluster, "类中，现在移到", flag, "类中");
                            let newClusterRes = deepCopy(that.cluster_res);
                            newClusterRes[key_cluster].forEach((item, index) => {
                                if (Number(item) === id) newClusterRes[key_cluster].splice(index, 1);
                            })
                            newClusterRes[flag].push(id + '');
                            newClusterRes[flag].sort((a, b) => (Number(a) - Number(b)));
                            // 后端还没有做类增加减少，故暂时在前端拦截将类滞空的操作
                            if (newClusterRes[key_cluster].length > 0) {
                                getView11MoveImg(newClusterRes, that);
                            }
                            else {
                                alert("该类只存在一张图片，故不允许移动！")
                                svg.selectAll('*').remove();
                                svg_1.selectAll('*').remove();
                                that.$forceUpdate();
                            }
                            // 重新绘制
                            svg.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                        } else if (flag >= 0 && Number(key_cluster) === Number(flag) && Number(key_cluster) !== (nodeList.length - 1) && Number(flag) !== (nodeList.length - 1)) {
                            // 重新绘制
                            svg.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                            that.$forceUpdate();
                        } else {
                            if (Number(key_cluster) === (nodeList.length - 1)) {
                                alert("不允许移动这个类中的图片！")
                            } else if (Number(flag) === (nodeList.length - 1)) {
                                alert("不允许移动到这个类中！")
                            } else {
                                let newClusterRes = deepCopy(that.cluster_res);
                                let addNum = Object.keys(newClusterRes).length;
                                newClusterRes[key_cluster].forEach((item, index) => {
                                    if (Number(item) === id) newClusterRes[key_cluster].splice(index, 1);
                                })
                                newClusterRes[addNum + ''] = [id + ''];
                                // 后端还没有做类增加减少，故暂时在前端拦截将类滞空的操作
                                if (newClusterRes[key_cluster].length > 0) {
                                    getView11MoveImg(newClusterRes, that);
                                }
                                else {
                                    alert("该类只存在一张图片，故不允许移动！")
                                    svg.selectAll('*').remove();
                                    svg_1.selectAll('*').remove();
                                    that.$forceUpdate();
                                }
                            }
                            // 重新绘制
                            svg.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                            that.$forceUpdate();
                        }
                    } else {
                        console.log("没有移动！", "展示了：", id);
                        // console.log("select", d3.select("#images_2")["_groups"]["0"][0] === null)
                        if (d3.select("#images_" + id)["_groups"]["0"][0] === null) {
                            svg.append("image")
                                .attr('class', "images")
                                .attr("id", "images_" + id)
                                .attr("xlink:href", img_address[Number(id)])
                                .attr("x", event.x)
                                .attr("y", event.y)
                                .attr("width", "100px")
                                .attr("height", "75px")
                                .call(imgDag(event.x, event.y))
                        }

                        svg.on("contextmenu", function (d) {
                            d.preventDefault();
                            svg.selectAll(".images").remove();
                        })
                    }

                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            }

            for (let i in nodes) {
                let node = nodes[i];
                donut_info[node.id] = {}
                donut_info[node.id]["center"] = [node.x, node.y]
                donut_info[node.id]["r"] = node_outter_radius * k_r(node["unionNum"])
            }

            // 画类
            // classInfo.push(draw_class(svg, width, height, node_outter_radius, class_color, nodes, cluster_force_data["nodes"][Number(key_cluster)], class_info));
            draw_class2(svg, nodes, key_cluster, node_outter_radius, k_r, class_color, cluster_force_data["nodes"][Number(key_cluster)], cluster_element_force_data);


            //绘制节点

            // 两种执行结果的颜色
            const result_insider_color = d3.scaleLinear().domain([0, 1]).range(["rgba(250,250,210,1)", "rgba(218,165,32,1)"])
            const result_outer_color = d3.scaleLinear().domain([0, 1]).range(["rgba(152,251,152,1)", "rgba(0,100,0,1)"])

            for (let i in nodes) {
                let node = nodes[i]
                let id = Number(data.nodes[i].id)
                const arcInside = d3.arc()
                    .innerRadius(node_inner_radius * k_r(node["unionNum"]))
                    .outerRadius(node_middle_radius * k_r(node["unionNum"]))
                const arcOuter = d3.arc()
                    .innerRadius(node_middle_radius * k_r(node["unionNum"]))
                    .outerRadius(node_outter_radius * k_r(node["unionNum"]))
                let nodeid = "img_" + node.id
                let pie_inside_data = [{ "failValue": failGroup[id][0] },
                { "failValue": failGroup[id][1] },
                { "failValue": failGroup[id][2] }]
                let pie_outer_data = new Array()
                for (let j = 0; j < group_num; j++) {
                    pie_outer_data.push({
                        "successValue": successGroup[id][j]
                    })
                }
                let pie = d3.pie().value((d) => (1))
                let pieArcsInside = pie(pie_inside_data)
                let pieArcsOuter = pie(pie_outer_data)
                // console.log("pie_data", pie_data)
                // console.log("pieArcs", pieArcs)

                // donut_info[node.id] = {}
                // donut_info[node.id]["center"] = [node.x, node.y]
                // donut_info[node.id]["r"] = node_outter_radius * k_r(node["unionNum"])

                // 里圈（黄色）
                let circle_node = svg.select(".class-path-" + key_cluster).append('g')
                    .attr('id', nodeid)
                    // The donut arcs will be centered around this point
                    .attr('transform', `translate(${node.x},${node.y})`)
                    .call(drag(simulation, nodes, id, svg, cluster_element_force_data, key_cluster, donut_info))
                //在外面定义一个变量收集点击的对象 重复点击取消 最后在设置一个事件传数据

                circle_node.selectAll('path')
                    .data(pieArcsOuter)
                    .join('path')
                    .style('stroke', 'rgba(255, 255, 255, 1)')
                    .style('stroke-width', 0.5)
                    .style('fill', d => result_outer_color(d.data.successValue))
                    .attr('d', arcOuter)

                circle_node.append('g')
                    .selectAll('path')
                    // Our data is the arcs, rather than the data object
                    // so that we have access to the arc data for rendering the paths
                    .data(pieArcsInside)
                    .join('path')
                    .style('stroke', 'rgba(255, 255, 255, 1)')
                    .style('stroke-width', 0.5)
                    .style('fill', d => result_insider_color(d.data.failValue))
                    // here we pass the arc generator. Remember, an accessor function
                    // receives the data (d) as the first argument, so rather than doing (d) => arc(d)
                    // we can just pass it like below. In this case, our data is the arc descriptor object
                    // so the d attribute will be set to the arc's path string. Take a minute to let that sink in
                    .attr('d', arcInside)



                let img_feature = img_features[node.id]
                let angle = img_feature["5_pin_angle"] * Math.PI / 180
                let node_g = svg.select('#' + nodeid)

                //方向特征
                node_g.append("line")
                    .attr("class", "line-direction-" + id)
                    .attr("x1", (node_inner_radius) * Math.cos(angle) * k_r(node["unionNum"]))
                    .attr("y1", -(node_inner_radius) * Math.sin(angle) * k_r(node["unionNum"]))
                    .attr("x2", -(node_inner_radius) * Math.cos(angle) * k_r(node["unionNum"]))
                    .attr("y2", (node_inner_radius) * Math.sin(angle) * k_r(node["unionNum"]))
                    .style('stroke-width', 2)
                    .style("stroke", "black")

                // 标号
                // node_g.append("text")
                //     .attr("font-size", "30")
                //     .text(nodeid.split("_")[1])

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

                // 外面一圈的线
                // node_g.append("path")
                //     .datum(histo)
                //     .attr("fill", "none")
                //     .attr("stroke", "steelblue")
                //     .attr("stroke-width", 1.5)
                //     .attr("stroke-linejoin", "round")
                //     .attr("stroke-linecap", "round")
                //     .attr("d", histo_line);

            }


            let brush_start_time;
            let brush_end_time;
            let brush_img = [];
            let brush_flag = false;

            function brushStart({ selection }) {
                brush_flag = false;
                brush_start_time = new Date();
            }

            function brushend({ selection }) {
                if (selection[1][0] - selection[0][0] < 5 && selection[1][1] - selection[0][1] < 5) { //点击空白处的判断
                    return
                } else {
                    let brush_temp = []
                    let target = svg.selectAll("g").filter(function (d, i) {
                        if (this.id.indexOf("img_") != -1) {
                            if (donut_info[this.id.split("_")[1]]["center"][0] < selection[1][0] && donut_info[this.id.split("_")[1]]["center"][0] > selection[0][0]
                                && donut_info[this.id.split("_")[1]]["center"][1] < selection[1][1] && donut_info[this.id.split("_")[1]]["center"][1] > selection[0][1]) {
                                let img_temp = this.id.split("_")[1]
                                brush_temp.push(img_temp)
                            }

                        }
                    })
                    //进行组件之间的通信
                    brush_img = brush_temp

                    //给view2 在传点额外的信息
                    let brush_img_info = {}
                    brush_img_info["brush_img"] = brush_img
                    let graph = { "nodes": [], "links": [] }
                    //我要通过遍历原始数据的方式 找到brush_img 对应的一些数据
                    let unique_link = []
                    for (let indice in brush_img) {
                        if (indice === "equals")
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
                    // console.log("brush_img", brush_img_info)
                }


            }

            const brush = d3.brush()
                .on("start", brushStart)
                .on("end", brushend);

            // create svg group element for brush
            svg.on("dblclick", function () {
                if (d3.select(".gBrush")["_groups"]["0"][0] === null) {
                    const gBrush = svg.append("g").attr("class", "gBrush");
                    gBrush.call(brush)
                } else {
                    svg.select(".gBrush").remove();
                }
            })

            // 绘制边
            // 绘制cluster内的边
            // 直接绘制所有边
            draw_line(svg, cluster_element_force_data, key_cluster);

        }
    } else {
        let lastNum = Object.keys(cluster_element_force_data).length;
        for (let key_cluster in cluster_element_force_data) {
            if ((lastNum - 1) === Number(key_cluster)) break;
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
                .range([0.5 * node_r, node_r * 2]) // colideChange 关键是要映射成圆的实际半径吗 ！！
            //可能要加一个表示 cluster 数量的值

            const linkDisChange = d3.scaleLinear()
                .domain(unionDecRange)
                .range([10, 50])

            const simulation = d3.forceSimulation(nodes)
                // 链接力
                .force("link", d3.forceLink(links).id(d => {
                    return d.id
                })
                    .distance(d => {
                        // console.log(d.unionDec)
                        return linkDisChange(d.unionDec)
                    })
                )
                // 万有引力
                .force("charge", d3.forceManyBody().strength(500))
                // 居中力
                .force("center", d3.forceCenter(center_cluster[key_cluster][0], center_cluster[key_cluster][1]))
                // 碰撞力
                .force("collide", d3.forceCollide().radius(d => colideChange(k_r(d.unionNum))))

            simulation.tick(300)

            nodes.forEach((item) => {
                item["r"] = node_outter_radius * k_r(item["unionNum"]) * 2.5
                item["xDiff"] = 0
                item["yDiff"] = 0
            })
            nodeList.push(nodes);

            const drag = (simulation, nodes, id, svg, cluster_element_force_data, key_cluster, donut_info) => {

                let isDragged = false
                function dragstarted(event) {
                    console.log("dragstarted")
                    // console.log("id", id);
                    // console.log("key_cluster", key_cluster)
                    // console.log(event.x, event.y);
                }

                function dragged(event) {
                    console.log("dragged")
                    isDragged = true
                    d3.select(this)
                        .attr('transform', `translate(${event.x},${event.y})`)
                    donut_info[id]["center"] = [event.x, event.y]
                    svg.selectAll("#lines_group" + key_cluster).remove()
                    draw_line(svg, cluster_element_force_data, key_cluster);
                }

                function dragended(event) {
                    console.log("dragended")
                    if (isDragged) {
                        let flag = -1; // 判断点是否在别的椭圆内（-1: 不在，x: 在并且在第 x 类中）
                        console.log(event.x, event.y, "ppp")
                        console.log(nodeList, "pp")
                        nodeList.forEach((item, index) => {
                            let a = false;
                            item.forEach((i) => {
                                if (Math.sqrt((event.x + i.xDiff - i.x) * (event.x + i.xDiff - i.x) + (event.y + i.yDiff - i.y) * (event.y + i.yDiff - i.y)) <= i.r) {
                                    a = true;
                                }
                            })
                            if (a) {
                                flag = index;
                            }
                        })
                        if (flag >= 0 && Number(key_cluster) !== Number(flag)) {
                            console.log("点", id, "原来在", key_cluster, "类中，现在移到", flag, "类中");
                            let newClusterRes = deepCopy(that.cluster_res);
                            newClusterRes[key_cluster].forEach((item, index) => {
                                if (Number(item) === id) newClusterRes[key_cluster].splice(index, 1);
                            })
                            newClusterRes[flag].push(id + '');
                            newClusterRes[flag].sort((a, b) => (Number(a) - Number(b)));
                            // 后端还没有做类增加减少，故暂时在前端拦截将类滞空的操作
                            if (newClusterRes[key_cluster].length > 0) {
                                getView11MoveImg(newClusterRes, that);
                            }
                            else {
                                let newClusterRes2 = {};
                                let i = 0;
                                for(let item in newClusterRes) {
                                    if(newClusterRes[item].length !== 0) {
                                        newClusterRes2[i + ''] = newClusterRes[item]
                                        i++
                                    }
                                }
                                getView11MoveImg(newClusterRes2, that);
                            }
                            // 重新绘制
                            svg.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                        } else if (flag >= 0 && Number(key_cluster) === Number(flag)) {
                            // 重新绘制
                            svg.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                            that.$forceUpdate();
                        } else {
                            let newClusterRes = deepCopy(that.cluster_res);
                            let addNum = Object.keys(newClusterRes).length;
                            newClusterRes[key_cluster].forEach((item, index) => {
                                if (Number(item) === id) newClusterRes[key_cluster].splice(index, 1);
                            })
                            newClusterRes[addNum + ''] = [id + ''];
                            // 后端还没有做类增加减少，故暂时在前端拦截将类滞空的操作
                            if (newClusterRes[key_cluster].length > 0) {
                                getView11MoveImg(newClusterRes, that);
                            }
                            else {
                                alert("该类只存在一张图片，故不允许移动！")
                                svg.selectAll('*').remove();
                                svg_1.selectAll('*').remove();
                                that.$forceUpdate();
                            }

                            // 重新绘制
                            svg.selectAll('*').remove();
                            svg_1.selectAll('*').remove();
                            that.$forceUpdate();
                        }
                    } else {
                        console.log("没有移动！", "展示了：", id);
                        // console.log("select", d3.select("#images_2")["_groups"]["0"][0] === null)
                        if (d3.select("#images_" + id)["_groups"]["0"][0] === null) {
                            svg.append("image")
                                .attr('class', "images")
                                .attr("id", "images_" + id)
                                .attr("xlink:href", img_address[Number(id)])
                                .attr("x", event.x)
                                .attr("y", event.y)
                                .attr("width", "100px")
                                .attr("height", "75px")
                                .call(imgDag(event.x, event.y))
                        }

                        svg.on("contextmenu", function (d) {
                            d.preventDefault();
                            svg.selectAll(".images").remove();
                        })
                    }

                }

                return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended);
            }

            for (let i in nodes) {
                let node = nodes[i];
                donut_info[node.id] = {}
                donut_info[node.id]["center"] = [node.x, node.y]
                donut_info[node.id]["r"] = node_outter_radius * k_r(node["unionNum"])
            }

            // 画类
            // classInfo.push(draw_class(svg, width, height, node_outter_radius, class_color, nodes, cluster_force_data["nodes"][Number(key_cluster)], class_info));
            draw_class2(svg, nodes, key_cluster, node_outter_radius, k_r, class_color, cluster_force_data["nodes"][Number(key_cluster)], cluster_element_force_data);


            //绘制节点

            // 两种执行结果的颜色
            const result_insider_color = d3.scaleLinear().domain([0, 1]).range(["rgba(250,250,210,1)", "rgba(218,165,32,1)"])
            const result_outer_color = d3.scaleLinear().domain([0, 1]).range(["rgba(152,251,152,1)", "rgba(0,100,0,1)"])

            for (let i in nodes) {
                let node = nodes[i]
                let id = Number(data.nodes[i].id)
                const arcInside = d3.arc()
                    .innerRadius(node_inner_radius * k_r(node["unionNum"]))
                    .outerRadius(node_middle_radius * k_r(node["unionNum"]))
                const arcOuter = d3.arc()
                    .innerRadius(node_middle_radius * k_r(node["unionNum"]))
                    .outerRadius(node_outter_radius * k_r(node["unionNum"]))
                let nodeid = "img_" + node.id
                let pie_inside_data = [{ "failValue": failGroup[id][0] },
                { "failValue": failGroup[id][1] },
                { "failValue": failGroup[id][2] }]
                let pie_outer_data = new Array()
                for (let j = 0; j < group_num; j++) {
                    pie_outer_data.push({
                        "successValue": successGroup[id][j]
                    })
                }
                let pie = d3.pie().value((d) => (1))
                let pieArcsInside = pie(pie_inside_data)
                let pieArcsOuter = pie(pie_outer_data)
                // console.log("pie_data", pie_data)
                // console.log("pieArcs", pieArcs)

                // donut_info[node.id] = {}
                // donut_info[node.id]["center"] = [node.x, node.y]
                // donut_info[node.id]["r"] = node_outter_radius * k_r(node["unionNum"])

                // 里圈（黄色）
                let circle_node = svg.select(".class-path-" + key_cluster).append('g')
                    .attr('id', nodeid)
                    // The donut arcs will be centered around this point
                    .attr('transform', `translate(${node.x},${node.y})`)
                    .call(drag(simulation, nodes, id, svg, cluster_element_force_data, key_cluster, donut_info))
                //在外面定义一个变量收集点击的对象 重复点击取消 最后在设置一个事件传数据

                circle_node.selectAll('path')
                    .data(pieArcsOuter)
                    .join('path')
                    .style('stroke', 'rgba(255, 255, 255, 0.5)')
                    .style('stroke-width', 1)
                    .style('fill', d => result_outer_color(d.data.successValue))
                    .attr('d', arcOuter)

                circle_node.append('g')
                    .selectAll('path')
                    // Our data is the arcs, rather than the data object
                    // so that we have access to the arc data for rendering the paths
                    .data(pieArcsInside)
                    .join('path')
                    .style('stroke', 'rgba(255, 255, 255, 0.5)')
                    .style('stroke-width', 1)
                    .style('fill', d => result_insider_color(d.data.failValue))
                    // here we pass the arc generator. Remember, an accessor function
                    // receives the data (d) as the first argument, so rather than doing (d) => arc(d)
                    // we can just pass it like below. In this case, our data is the arc descriptor object
                    // so the d attribute will be set to the arc's path string. Take a minute to let that sink in
                    .attr('d', arcInside)



                let img_feature = img_features[node.id]
                let angle = img_feature["5_pin_angle"] * Math.PI / 180
                let node_g = svg.select('#' + nodeid)

                //方向特征
                node_g.append("line")
                    .attr("class", "line-direction-" + id)
                    .attr("x1", (node_inner_radius) * Math.cos(angle) * k_r(node["unionNum"]))
                    .attr("y1", -(node_inner_radius) * Math.sin(angle) * k_r(node["unionNum"]))
                    .attr("x2", -(node_inner_radius) * Math.cos(angle) * k_r(node["unionNum"]))
                    .attr("y2", (node_inner_radius) * Math.sin(angle) * k_r(node["unionNum"]))
                    .style('stroke-width', 2)
                    .style("stroke", "black")

                // 标号
                // node_g.append("text")
                //     .attr("font-size", "30")
                //     .text(nodeid.split("_")[1])

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

                // 外面一圈的线
                // node_g.append("path")
                //     .datum(histo)
                //     .attr("fill", "none")
                //     .attr("stroke", "steelblue")
                //     .attr("stroke-width", 1.5)
                //     .attr("stroke-linejoin", "round")
                //     .attr("stroke-linecap", "round")
                //     .attr("d", histo_line);

            }


            let brush_start_time;
            let brush_end_time;
            let brush_img = [];
            let brush_flag = false;

            function brushStart({ selection }) {
                brush_flag = false;
                brush_start_time = new Date();
            }

            function brushend({ selection }) {
                if (selection[1][0] - selection[0][0] < 5 && selection[1][1] - selection[0][1] < 5) { //点击空白处的判断
                    return
                } else {
                    let brush_temp = []
                    let target = svg.selectAll("g").filter(function (d, i) {
                        if (this.id.indexOf("img_") != -1) {
                            let id = this.id.split("_")[1]
                            let node = {}
                            nodeList.forEach(item => {
                                item.forEach((ite) => {
                                    if(ite.id === id) node = ite
                                })
                            })
                            if ((donut_info[this.id.split("_")[1]]["center"][0] + node["xDiff"]) < selection[1][0] && (donut_info[this.id.split("_")[1]]["center"][0] + node["xDiff"]) > selection[0][0]
                                && (donut_info[this.id.split("_")[1]]["center"][1] + node["yDiff"]) < selection[1][1] && (donut_info[this.id.split("_")[1]]["center"][1] + node["yDiff"]) > selection[0][1]) {
                            // if (donut_info[this.id.split("_")[1]]["center"][0] < selection[1][0] && donut_info[this.id.split("_")[1]]["center"][0] > selection[0][0]
                            //     && donut_info[this.id.split("_")[1]]["center"][1] < selection[1][1] && donut_info[this.id.split("_")[1]]["center"][1] > selection[0][1]) {
                                let img_temp = this.id.split("_")[1]
                                brush_temp.push(img_temp)
                            }

                        }
                    })
                    //进行组件之间的通信
                    brush_img = brush_temp

                    //给view2 在传点额外的信息
                    let brush_img_info = {}
                    brush_img_info["brush_img"] = brush_img
                    let graph = { "nodes": [], "links": [] }
                    //我要通过遍历原始数据的方式 找到brush_img 对应的一些数据
                    let unique_link = []
                    for (let indice in brush_img) {
                        if (indice === "equals")
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
                    // console.log("brush_img", brush_img_info)
                }


            }

            const brush = d3.brush()
                .on("start", brushStart)
                .on("end", brushend);

            // create svg group element for brush
            svg.on("dblclick", function () {
                if (d3.select(".gBrush")["_groups"]["0"][0] === null) {
                    const gBrush = svg.append("g").attr("class", "gBrush");
                    gBrush.call(brush)
                } else {
                    svg.select(".gBrush").remove();
                }
            })

            // 绘制边
            // 绘制cluster内的边
            // 直接绘制所有边
            draw_line(svg, cluster_element_force_data, key_cluster);

        }
    }

    // 类与类之间的连线
    // let classLineDrawData = {}
    // const line = d3.line()
    //     .x(d => d[0])
    //     .y(d => d[1])
    //     .curve(d3.curveCatmullRom.alpha(0.5));

    // const g_class_line = svg.append("g")
    //     .attr("id", "class_lines_group")

    // let class_links = cluster_force_data["links"]
    // for (let i = 0, len = class_links.length; i < len; i++) {
    //     let link = class_links[i]
    //     let source = link["source"]
    //     let target = link["target"]
    //     if (parseInt(source) > parseInt(target)) {
    //         let temp = source
    //         source = target
    //         target = temp
    //     }
    //     //绘制
    //     if (classLineDrawData.hasOwnProperty(source)) {
    //         classLineDrawData[source][target] = { "dec": link["unionDec"] }
    //         //计算一下线的坐标
    //         let source_donut = class_info[source]
    //         let target_donut = class_info[target]

    //         let linePoints = getPointsLinkFromTwoEllipse(source_donut, target_donut)

    //         g_class_line.append("line")
    //             .attr('x1', linePoints[0])
    //             .attr('y1', linePoints[1])
    //             .attr('x2', linePoints[2])
    //             .attr('y2', linePoints[3])
    //             .attr("fill", "none")
    //             .attr("stroke", "steelblue")
    //             .attr("stroke-width", 1.5) //link["unionDec"] 进行映射
    //             .attr("stroke-linejoin", "round")
    //             .attr("stroke-linecap", "round")

    //     } else {
    //         classLineDrawData[source] = {}
    //     }
    // }

    // 记录圆内线的位置
    let x_y = [];
    // 方向特征与标号的转换
    svg.on("click", function (d) {
        if (d.altKey) {
            if (d3.select(".line-direction-0")["_groups"]["0"][0] !== null) {
                for (let i = 0; i < img_address.length; i++) {
                    let nodeid = "img_" + i
                    let node_g = svg.select('#' + nodeid)
                    let line = d3.select(".line-direction-" + i);
                    if (x_y.length !== img_address.length) {
                        let temp = []
                        if (line["_groups"]["0"][0] !== null) {
                            temp.push(line["_groups"][0][0]["x1"]["animVal"]["value"])
                            temp.push(line["_groups"][0][0]["y1"]["animVal"]["value"])
                            temp.push(line["_groups"][0][0]["x2"]["animVal"]["value"])
                            temp.push(line["_groups"][0][0]["y2"]["animVal"]["value"])
                        } else {
                            temp.push(0)
                            temp.push(0)
                            temp.push(0)
                            temp.push(0)
                        }
                        x_y.push(temp);
                    }
                    line.remove();
                    node_g.append("text")
                        .attr("class", "text-number-" + i)
                        .attr("x", -4)
                        .attr("y", 2)
                        .attr("font-size", "10")
                        .text(i)
                }
            } else {
                for (let i = 0; i < img_address.length; i++) {
                    let nodeid = "img_" + i
                    let node_g = svg.select('#' + nodeid)
                    let text = d3.select(".text-number-" + i);
                    text.remove();
                    if (!(x_y[i][0] === 0 && x_y[i][1] === 0 && x_y[i][2] === 0 && x_y[i][3] === 0)) {
                        node_g.append("line")
                            .attr("class", "line-direction-" + i)
                            .attr("x1", Number(x_y[i][0]))
                            .attr("y1", Number(x_y[i][1]))
                            .attr("x2", Number(x_y[i][2]))
                            .attr("y2", Number(x_y[i][3]))
                            .style('stroke-width', 2)
                            .style("stroke", "black")
                    }
                }
            }
        }
    })

    // 键盘事件，按 Z 显示有向无环图
    d3.select("body").on("keypress", function (event) {
        if (event.keyCode === 122) {
            if (d3.select(".angle_line")["_groups"]["0"][0] === null) {
                // 画角度的有向无环图
                draw_angle_line(svg, img_features, donut_info);
            } else {
                svg.selectAll(".angle_line").remove();
            }
        }
    })

}

// 图片移动函数
function imgDag() {
    let xDiff = 0, yDiff = 0;

    function dragstarted(event) {
        xDiff = event.x - this.x["animVal"]["value"];
        yDiff = event.y - this.y["animVal"]["value"];
    }

    function dragged(event) {
        d3.select(this)
            .attr('x', event.x - xDiff)
            .attr('y', event.y - yDiff)
    }

    function dragended(event) {
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

}

function draw_line(svg, cluster_element_force_data, key_cluster) {
    let line_draw = [] //记录 防止1-2 2-1重复绘画
    let line_draw_data = {}
    const line = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveCatmullRom.alpha(0.5));

    const g_line = svg.select(".class-path-" + key_cluster)
        .append("g")
        .attr("id", "lines_group" + key_cluster)

    const lineWidth = d3.scaleLinear()
        .domain([0, 1])
        .range([0.5, 3])

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
            // 第二次就不画了
            line_draw.push(tag);
            //绘制
            line_draw_data[source] = {}
            line_draw_data[source][target] = { "dec": link["unionDec"] }
            //计算一下线的坐标
            let donut_info_copy = deepCopy(donut_info)
            let source_donut = donut_info_copy[source]
            let target_donut = donut_info_copy[target] // nodeList[key_cluster]["y"]
            // console.log("source", source)
            // console.log("target", target)
            let line_points = getPointsLinkFromTwoCircle0(source_donut, target_donut)
            // line_points.sort(function (a, b) {
            //     return a[0] - b[0]
            // })

            g_line.append("path")
                .datum(line_points)
                .attr("fill", "none")
                .attr("stroke", "rgba(105,105,105,0.3)")
                .attr("stroke-width", lineWidth(link["unionDec"])) //link["unionDec"] 进行映射
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("d", line)
        }
    }
}

function draw_angle_line(svg, img_features) {
    let angleList = [];
    let links = [];
    const line = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveCatmullRom.alpha(0.5));
    for (let i in img_features) {
        if(donut_info.hasOwnProperty(i)) {
            angleList.push(Number(img_features[i]["5_pin_angle"]));
        }
    }
    angleList.sort(function (a, b) { return a - b });
    for (let i = 0; i < angleList.length - 1; i++) {
        let obj = {}
        for (let j in img_features) {
            if (angleList[i] === img_features[j]["5_pin_angle"]) {
                obj["source"] = j;
            }
            if (angleList[i + 1] === img_features[j]["5_pin_angle"]) {
                obj["target"] = j;
            }
        }
        links.push(obj);
    }
    for (let i = 0; i < links.length; i++) {
        let link = links[i]
        let source = link["source"]
        let target = link["target"]
        let source_donut = donut_info[source]
        let target_donut = donut_info[target]

        let line_points = getPointsLinkFromTwoCircle0(source_donut, target_donut)

        svg.append("path")
            .datum(line_points)
            .attr("class", "angle_line")
            .attr("fill", "none")
            .attr("stroke", "rgba(252,126,67,1)")
            .attr("stroke-width", 2) // 后期考虑根据光照进行映射，暂时设置定值
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line)
    }
    let pie = d3.pie().value((d) => (1))
    const arc1 = d3.arc()
        .innerRadius(donut_info[links[0]["source"]]["r"])
        .outerRadius(donut_info[links[0]["source"]]["r"] * 1.2)

    const arc2 = d3.arc()
        .innerRadius(donut_info[links[links.length - 1]["target"]]["r"])
        .outerRadius(donut_info[links[links.length - 1]["target"]]["r"] * 1.2)

    svg.append('path')
        .data(pie([{ key: 1, value: 1 }]))
        .attr("class", "angle_line")
        .attr("fill", "rgba(252,126,67,1)")
        .attr('transform', `translate(${donut_info[links[0]["source"]]["center"][0]},${donut_info[links[0]["source"]]["center"][1]})`)
        .attr('d', arc1)

    svg.append('path')
        .data(pie([{ key: 1, value: 1 }]))
        .attr("class", "angle_line")
        .attr("fill", "rgba(252,126,67,1)")
        .attr('transform', `translate(${donut_info[links[links.length - 1]["target"]]["center"][0]},${donut_info[links[links.length - 1]["target"]]["center"][1]})`)
        .attr('d', arc2)
}

function resultView(that) {

    const svg = d3.select('#' + that.id + "_1");
    const width = parseInt(that.w) / 10;
    const height = parseInt(that.h) / 5;

    svg.selectAll("*").remove();

    const cluster_force_data = that.cluster_force_data;
    let nodes = cluster_force_data["nodes"]
    let links = cluster_force_data["links"]

    let nodesX = []

    let circle_x = width / 2 * 2;
    let circle_y = height / 4;
    let circle_r = height / 8;
    nodesX.push({ circle_x, circle_y })
    svg.append("polygon")
        .attr("points", [circle_x, (circle_y + circle_r),
            (circle_x - 0.5 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 1.5 * circle_r),
            (circle_x + 0.5 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 1.5 * circle_r)])
        .attr("fill", "black")

    // 第一个类的值
    circle_x = width / 2 * 3;
    circle_y = height / 4 * 1.05;
    svg.append("text")
        .attr("x", circle_x)
        .attr("y", circle_y * 2)
        .attr("font-size", "10")
        .text(nodes[0]["unionNum"])

    circle_x = width / 2 * 5;
    circle_y = height / 4;
    circle_r = height / 8;
    svg.append("line")
        .attr("x1", circle_x)
        .attr("y1", circle_y * 2 - circle_r / 2)
        .attr("x2", circle_x)
        .attr("y2", circle_y * 2 + circle_r / 2)
        .attr("stroke-width", "2px")
        .attr("stroke", "black")
    svg.append("line")
        .attr("x1", circle_x - circle_r / 2)
        .attr("y1", circle_y * 2)
        .attr("x2", circle_x + circle_r / 2)
        .attr("y2", circle_y * 2)
        .attr("stroke-width", "2px")
        .attr("stroke", "black")


    circle_x = width / 2 * 6;
    circle_y = height / 4;
    circle_r = height / 8 * 0.7;
    nodesX.push({ circle_x, circle_y })
    svg.append("polygon")
        .attr("points", [circle_x, (circle_y + circle_r),
            (circle_x - 0.5 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 1.5 * circle_r),
            circle_x, (circle_y + circle_r + 3 * circle_r),
            (circle_x + 0.5 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 1.5 * circle_r)])
        .attr("fill", "black")

    // 第二个类的值
    circle_x = width / 2 * 7;
    circle_y = height / 4 * 1.05;
    svg.append("text")
        .attr("x", circle_x)
        .attr("y", circle_y * 2)
        .attr("font-size", "10")
        .text(nodes[1]["unionNum"])

    circle_x = width / 2 * 9;
    circle_y = height / 4;
    circle_r = height / 8;
    svg.append("line")
        .attr("x1", circle_x)
        .attr("y1", circle_y * 2 - circle_r / 2)
        .attr("x2", circle_x)
        .attr("y2", circle_y * 2 + circle_r / 2)
        .attr("stroke-width", "2px")
        .attr("stroke", "black")
    svg.append("line")
        .attr("x1", circle_x - circle_r / 2)
        .attr("y1", circle_y * 2)
        .attr("x2", circle_x + circle_r / 2)
        .attr("y2", circle_y * 2)
        .attr("stroke-width", "2px")
        .attr("stroke", "black")

    circle_x = width / 2 * 10;
    circle_y = height / 4;
    circle_r = height / 8;
    nodesX.push({ circle_x, circle_y })
    svg.append("polygon")
        .attr("points", [circle_x, (circle_y + circle_r),
            (circle_x - 1 * circle_r * Math.cos(Math.PI * 36 / 180)), (circle_y + circle_r + 1 * circle_r * Math.sin(Math.PI * 36 / 180)),
            (circle_x - 0.5 * circle_r), (circle_y + circle_r + 1 * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2 * circle_r),
            (circle_x + 0.5 * circle_r), (circle_y + circle_r + 1 * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2 * circle_r),
            (circle_x + 1 * circle_r * Math.cos(Math.PI * 36 / 180)), (circle_y + circle_r + 1 * circle_r * Math.sin(Math.PI * 36 / 180))])
        .attr("fill", "black")

    // 第三个类的值
    circle_x = width / 2 * 11;
    circle_y = height / 4 * 1.05;
    svg.append("text")
        .attr("x", circle_x)
        .attr("y", circle_y * 2)
        .attr("font-size", "10")
        .text(nodes[2]["unionNum"])

    if (nodes.length === 4) {
        circle_x = width / 2 * 13;
        circle_y = height / 4;
        circle_r = height / 8;
        svg.append("line")
            .attr("x1", circle_x - circle_r / 2)
            .attr("y1", circle_y * 2 - circle_r / 4)
            .attr("x2", circle_x + circle_r / 2)
            .attr("y2", circle_y * 2 - circle_r / 4)
            .attr("stroke-width", "2px")
            .attr("stroke", "black")
        svg.append("line")
            .attr("x1", circle_x - circle_r / 2)
            .attr("y1", circle_y * 2 + circle_r / 4)
            .attr("x2", circle_x + circle_r / 2)
            .attr("y2", circle_y * 2 + circle_r / 4)
            .attr("stroke-width", "2px")
            .attr("stroke", "black")

        // 总和
        circle_x = width / 2 * 14;
        circle_y = height / 4 * 1.05;
        svg.append("text")
            .attr("x", circle_x)
            .attr("y", circle_y * 2)
            .attr("font-size", "10")
            .text(nodes[0]["unionNum"] + nodes[1]["unionNum"] + nodes[2]["unionNum"])
    } else if (nodes.length === 5) {
        circle_x = width / 2 * 13;
        circle_y = height / 4;
        circle_r = height / 8;
        svg.append("line")
            .attr("x1", circle_x)
            .attr("y1", circle_y * 2 - circle_r / 2)
            .attr("x2", circle_x)
            .attr("y2", circle_y * 2 + circle_r / 2)
            .attr("stroke-width", "2px")
            .attr("stroke", "black")
        svg.append("line")
            .attr("x1", circle_x - circle_r / 2)
            .attr("y1", circle_y * 2)
            .attr("x2", circle_x + circle_r / 2)
            .attr("y2", circle_y * 2)
            .attr("stroke-width", "2px")
            .attr("stroke", "black")

        circle_x = width / 2 * 14;
        circle_y = height / 4;
        circle_r = height / 10;
        nodesX.push({ circle_x, circle_y })
        svg.append("polygon")
            .attr("points", [circle_x, circle_y + circle_r,
                (circle_x - 1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 0.5 * circle_r),
                (circle_x - 1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 1.5 * circle_r),
                circle_x, (circle_y + circle_r + 2 * circle_r),
                (circle_x + 1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 1.5 * circle_r),
                (circle_x + 1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 0.5 * circle_r)
            ])
            .attr("fill", "black")

        // 第三个类的值
        circle_x = width / 2 * 15;
        circle_y = height / 4 * 1.05;
        svg.append("text")
            .attr("x", circle_x)
            .attr("y", circle_y * 2)
            .attr("font-size", "10")
            .text(nodes[3]["unionNum"])

        circle_x = width / 2 * 17;
        circle_y = height / 4;
        circle_r = height / 8;
        svg.append("line")
            .attr("x1", circle_x - circle_r / 2)
            .attr("y1", circle_y * 2 - circle_r / 4)
            .attr("x2", circle_x + circle_r / 2)
            .attr("y2", circle_y * 2 - circle_r / 4)
            .attr("stroke-width", "2px")
            .attr("stroke", "black")
        svg.append("line")
            .attr("x1", circle_x - circle_r / 2)
            .attr("y1", circle_y * 2 + circle_r / 4)
            .attr("x2", circle_x + circle_r / 2)
            .attr("y2", circle_y * 2 + circle_r / 4)
            .attr("stroke-width", "2px")
            .attr("stroke", "black")

        // 总和
        circle_x = width / 2 * 18;
        circle_y = height / 4 * 1.05;
        svg.append("text")
            .attr("x", circle_x)
            .attr("y", circle_y * 2)
            .attr("font-size", "10")
            .text(nodes[0]["unionNum"] + nodes[1]["unionNum"] + nodes[2]["unionNum"] + nodes[3]["unionNum"])
    }

    if (links.length > 0) {
        let k = 1;
        for (let i = 0; i < links.length; i++) {
            let source = Number(links[i]["source"])
            let target = Number(links[i]["target"])
            if (source < target) {
                svg.append("line")
                    .attr("x1", nodesX[source]["circle_x"])
                    .attr("y1", nodesX[source]["circle_y"] + 5)
                    .attr("x2", nodesX[source]["circle_x"])
                    .attr("y2", nodesX[source]["circle_y"] + k)
                    .attr("stroke-width", "1px")
                    .attr("stroke", "red")
                svg.append("line")
                    .attr("x1", nodesX[source]["circle_x"])
                    .attr("y1", nodesX[source]["circle_y"] + k)
                    .attr("x2", nodesX[target]["circle_x"])
                    .attr("y2", nodesX[target]["circle_y"] + k)
                    .attr("stroke-width", "1px")
                    .attr("stroke", "red")
                svg.append("line")
                    .attr("x1", nodesX[target]["circle_x"])
                    .attr("y1", nodesX[target]["circle_y"] + 5)
                    .attr("x2", nodesX[target]["circle_x"])
                    .attr("y2", nodesX[target]["circle_y"] + k)
                    .attr("stroke-width", "1px")
                    .attr("stroke", "red")
                k -= 2;
            }
        }
    }


}

// function draw_class(svg, width, height, node_outter_radius, class_color, nodes, classNode, class_info) {
//     let left = width;
//     let right = 0;
//     let top = height;
//     let down = 0;
//     for (let i in nodes) {
//         let x = Number(nodes[i].x);
//         let y = Number(nodes[i].y);
//         if (left > x) left = x;
//         if (right < x) right = x;
//         if (down < y) down = y;
//         if (top > y) top = y;
//     }
//     let circle_x = (left + right) / 2;
//     let circle_y = (down + top) / 2;
//     let circle_r = 0.8 * Math.max(Math.max((right - left), node_outter_radius * 2), Math.max((down - top), node_outter_radius * 2))

//     class_info[classNode["id"]] = {}
//     class_info[classNode["id"]]['center'] = { 'x': circle_x, "y": circle_y }
//     class_info[classNode["id"]]['r'] = { 'r_x': circle_r * 1.2, "r_y": circle_r }

//     svg.append("ellipse")
//         .attr("cx", circle_x)
//         .attr("cy", circle_y)
//         .attr("rx", circle_r * 1.2)
//         .attr("ry", circle_r)
//         .attr("fill", class_color(classNode["unionNum"]));

//     switch (Number(classNode["id"])) {
//         case 0:
//             svg.append("polygon")
//                 .attr("points", [circle_x, (circle_y + circle_r), (circle_x - 0.05 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 0.15 * circle_r), (circle_x + 0.05 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 0.15 * circle_r)])
//                 .attr("fill", "black")
//             break;
//         case 1:
//             svg.append("polygon")
//                 .attr("points", [circle_x, (circle_y + circle_r),
//                     (circle_x - 0.05 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 0.15 * circle_r),
//                     circle_x, (circle_y + circle_r + 0.3 * circle_r),
//                     (circle_x + 0.05 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 0.15 * circle_r)])
//                 .attr("fill", "black")
//             break;
//         case 2:
//             svg.append("polygon")
//                 .attr("points", [circle_x, (circle_y + circle_r),
//                     (circle_x - 0.1 * circle_r * Math.cos(Math.PI * 36 / 180)), (circle_y + circle_r + 0.1 * circle_r * Math.sin(Math.PI * 36 / 180)),
//                     (circle_x - 0.05 * circle_r), (circle_y + circle_r + 0.1 * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2 * circle_r),
//                     (circle_x + 0.05 * circle_r), (circle_y + circle_r + 0.1 * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2 * circle_r),
//                     (circle_x + 0.1 * circle_r * Math.cos(Math.PI * 36 / 180)), (circle_y + circle_r + 0.1 * circle_r * Math.sin(Math.PI * 36 / 180))])
//                 .attr("fill", "black")
//             break;
//         case 3:
//             svg.append("polygon")
//                 .attr("points", [circle_x, (circle_y + circle_r),
//                     (circle_x - 0.1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 0.05 * circle_r),
//                     (circle_x - 0.1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 0.15 * circle_r),
//                     circle_x, (circle_y + circle_r + 0.2 * circle_r),
//                     (circle_x + 0.1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 0.15 * circle_r),
//                     (circle_x + 0.1 * Math.sqrt(3) / 2 * circle_r), (circle_y + circle_r + 0.05 * circle_r)
//                 ])
//                 .attr("fill", "black")
//             break;
//         default:
//             svg.append("polygon")
//                 .attr("points", [circle_x, (circle_y + circle_r), (circle_x - 0.05 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 0.15 * circle_r), (circle_x + 0.05 * Math.sqrt(3) * circle_r), (circle_y + circle_r + 0.15 * circle_r)])
//                 .attr("fill", "black")
//     }

//     return {
//         "cx": circle_x,
//         "cy": circle_y,
//         "rx": circle_r * 1.2,
//         "ry": circle_r
//     }
// }

function draw_class2(svg, nodes, key_cluster, node_outter_radius, k_r, class_color, number, cluster_element_force_data) {
    let bubbles = new BubbleSet();
    let pad = 3;
    let sets1 = [];
    let sets2 = [];
    let sets22 = [];
    let nodeSets2 = [];
    let lineSets2 = [];
    let sets3 = [];
    let sets33 = [];
    let nodeSets3 = [];
    let lineSets3 = [];
    let maxUnionNum = 0;
    let minUnionNum = 50000;
    let line_draw = [] //记录 防止1-2 2-1重复绘画
    let line_draw_data = {}
    nodes.forEach((item) => {
        sets1.push({
            x: item.x - (node_outter_radius * k_r(item["unionNum"])),
            y: item.y - (node_outter_radius * k_r(item["unionNum"])),
            width: (node_outter_radius * k_r(item["unionNum"])) * 2,
            height: (node_outter_radius * k_r(item["unionNum"])) * 2
        })
        if (item.unionNum > maxUnionNum) maxUnionNum = item.unionNum;
        if (item.unionNum < minUnionNum) minUnionNum = item.unionNum;
    })
    let list = bubbles.createOutline(
        BubbleSet.addPadding(sets1, pad),
        BubbleSet.addPadding([{ x: 1, y: 1, width: 1, height: 1 }], pad)
    );
    var outline = new PointPath(list).transform([
        new ShapeSimplifier(0.0),
        new BSplineShapeGenerator(),
        new ShapeSimplifier(0.0),
    ]);
    svg.append("g")
        .attr("class", "class-path-" + key_cluster)
        .append("path")
        .attr("fill", class_color(number["unionNum"]))
        .attr("opacity", 0.5)
        // .attr("stroke", "black")
        .attr("d", outline.toString())

    // 含有三个节点及以上
    if (nodes.length > 2) {
        nodes.forEach((item) => {
            if (item.unionNum > ((maxUnionNum - minUnionNum) / 3 + minUnionNum)) {
                sets2.push({
                    x: item.x - (node_outter_radius * k_r(item["unionNum"])),
                    y: item.y - (node_outter_radius * k_r(item["unionNum"])),
                    width: (node_outter_radius * k_r(item["unionNum"])) * 2,
                    height: (node_outter_radius * k_r(item["unionNum"])) * 2
                })
                nodeSets2.push(item.id)
            } else {
                sets22.push({
                    x: item.x - (node_outter_radius * k_r(item["unionNum"]) / 2),
                    y: item.y - (node_outter_radius * k_r(item["unionNum"]) / 2),
                    width: (node_outter_radius * k_r(item["unionNum"])) * 2 / 2,
                    height: (node_outter_radius * k_r(item["unionNum"])) * 2 / 2
                })
            }
            if (item.unionNum > ((maxUnionNum - minUnionNum) / 3 * 2 + minUnionNum)) {
                sets3.push({
                    x: item.x - (node_outter_radius * k_r(item["unionNum"])),
                    y: item.y - (node_outter_radius * k_r(item["unionNum"])),
                    width: (node_outter_radius * k_r(item["unionNum"])) * 2,
                    height: (node_outter_radius * k_r(item["unionNum"])) * 2
                })
                nodeSets3.push(item.id)
            } else {
                sets33.push({
                    x: item.x - (node_outter_radius * k_r(item["unionNum"]) / 2),
                    y: item.y - (node_outter_radius * k_r(item["unionNum"]) / 2),
                    width: (node_outter_radius * k_r(item["unionNum"])) * 2 / 2,
                    height: (node_outter_radius * k_r(item["unionNum"])) * 2 / 2
                })
            }
        })

        // 处理连线的代码。实现后发现带上线的信息后，效果更差了，目前弃用
        // let cluster_links = cluster_element_force_data[key_cluster]["links"]
        // for (let i = 0, len = cluster_links.length; i < len; i++) {
        //     let link = cluster_links[i]
        //     let source = link["source"]
        //     let target = link["target"]
        //     if (parseInt(source) > parseInt(target)) {
        //         let temp = source
        //         source = target
        //         target = temp
        //     }
        //     let tag = source + "_" + target
        //     if (line_draw.indexOf(tag) === -1) {
        //         //绘制
        //         if (line_draw_data.hasOwnProperty(source)) {
        //             line_draw_data[source][target] = { "dec": link["unionDec"] }
        //             //计算一下线的坐标
        //             let source_donut = donut_info[source]
        //             let target_donut = donut_info[target]
        //             let donut_info_copy = deepCopy(donut_info)
        //             delete (donut_info_copy[source])
        //             delete (donut_info_copy[target])
        //             // console.log("source", source_donut)
        //             // console.log("target", target)
        //             let line_points = getPointsLinkFromTwoCircle0(source_donut, target_donut)
        //             // line_points.sort(function (a, b) {
        //             //     return a[0] - b[0]
        //             // })
        //             if (nodeSets2.indexOf(source) !== -1 && nodeSets2.indexOf(target) !== -1) {
        //                 lineSets2.push({
        //                     "x1": line_points[0][0],
        //                     "y1": line_points[0][1],
        //                     "x2": line_points[1][0],
        //                     "y2": line_points[1][1]
        //                 })
        //             }
        //             if (nodeSets3.indexOf(source) !== -1 && nodeSets3.indexOf(target) !== -1) {
        //                 lineSets3.push({
        //                     "x1": line_points[0][0],
        //                     "y1": line_points[0][1],
        //                     "x2": line_points[1][0],
        //                     "y2": line_points[1][1]
        //                 })
        //             }

        //         } else {
        //             line_draw_data[source] = {}
        //         }
        //     }
        // }

        let list2 = bubbles.createOutline(
            BubbleSet.addPadding(sets2, 2),
            BubbleSet.addPadding(sets22, 2)
        );
        let list3 = bubbles.createOutline(
            BubbleSet.addPadding(sets3, 2),
            BubbleSet.addPadding(sets33, 2)
        );
        var outline2 = new PointPath(list2).transform([
            new ShapeSimplifier(0.0),
            new BSplineShapeGenerator(),
            new ShapeSimplifier(0.0),
        ]);
        var outline3 = new PointPath(list3).transform([
            new ShapeSimplifier(0.0),
            new BSplineShapeGenerator(),
            new ShapeSimplifier(0.0),
        ]);
        svg.select(".class-path-" + key_cluster)
            .append("path")
            .attr("class", "class-path-" + key_cluster + '-2')
            .attr("fill", class_color(number["unionNum"] + 1000))
            .attr("opacity", 0.5)
            .attr("d", outline2.toString())

        svg.select(".class-path-" + key_cluster)
            .append("path")
            .attr("class", "class-path-" + key_cluster + '-3')
            .attr("fill", class_color(number["unionNum"] + 2000))
            .attr("opacity", 0.5)
            .attr("d", outline3.toString())

    }

    let y = 0, i = 0;
    let nodeList2 = outline.toString().split(" ");
    nodeList2.forEach((item, index) => {
        if (!window.isNaN(Number(item)) && y < Number(item)) {
            y = Number(item);
            i = index;
        }
    })
    let x = Number(nodeList2[i - 1].substring(1));
    let r = 10

    // 画类的标识图形
    const drag = () => {

        let x = 0;
        let y = 0;
        let xOld = 0;
        let yOld = 0;
        function dragstarted(event) {
            console.log("dragstarted")
            x = event.x;
            y = event.y;
        }

        function dragged(event) {
            console.log("dragged")
            xOld = Number(d3.select(this).attr("x"));
            yOld = Number(d3.select(this).attr("y"));
            d3.select(this)
                .attr('transform', `translate(${event.x - x + xOld},${event.y - y + yOld})`)

            d3.select(".class-path-" + key_cluster)
                .attr('transform', `translate(${event.x - x + xOld},${event.y - y + yOld})`)
        }

        function dragended(event) {
            console.log("dragended")
            d3.select(this)
                .attr("x", event.x - x + xOld)
                .attr("y", event.y - y + yOld)

            nodeList[key_cluster].forEach((item) => {
                // let donut_x = donut_info[item.id]["center"][0]
                // let donut_y = donut_info[item.id]["center"][1]
                item["x"] += (event.x - x);
                item["xDiff"] += (event.x - x);
                item["y"] += (event.y - y);
                item["yDiff"] += (event.y - y);
            })
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

    }
    switch (Number(key_cluster)) {
        case 0:
            svg.append("polygon")
                .attr("class", "polygon-" + key_cluster)
                .attr("x", 0)
                .attr("y", 0)
                .attr("points", [x, y,
                    (x - 0.5 * Math.sqrt(3) * r), (y + 1.5 * r),
                    (x + 0.5 * Math.sqrt(3) * r), (y + 1.5 * r)])
                .attr("fill", "black")
                .call(drag())
            break;
        case 1:
            svg.append("polygon")
                .attr("class", "polygon-" + key_cluster)
                .attr("x", 0)
                .attr("y", 0)
                .attr("points", [x, y,
                    (x - 0.5 * Math.sqrt(3) * r / 2), (y + 1.5 * r / 2),
                    x, y + 3 * r / 2,
                    (x + 0.5 * Math.sqrt(3) * r / 2), (y + 1.5 * r / 2)])
                .attr("fill", "black")
                .call(drag())
            break;
        case 2:
            svg.append("polygon")
                .attr("class", "polygon-" + key_cluster)
                .attr("x", 0)
                .attr("y", 0)
                .attr("points", [x, y,
                    (x - 1 * r * Math.cos(Math.PI * 36 / 180)), (y + 1 * r * Math.sin(Math.PI * 36 / 180)),
                    (x - 0.5 * r), (y + 1 * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2 * r),
                    (x + 0.5 * r), (y + 1 * Math.sqrt(5 + 2 * Math.sqrt(5)) / 2 * r),
                    (x + 1 * r * Math.cos(Math.PI * 36 / 180)), (y + 1 * r * Math.sin(Math.PI * 36 / 180))])
                .attr("fill", "black")
                .call(drag())
            break;
        case 3:
            svg.append("polygon")
                .attr("class", "polygon-" + key_cluster)
                .attr("x", 0)
                .attr("y", 0)
                .attr("points", [x, y,
                    (x - 1 * Math.sqrt(3) / 2 * r), (y + 0.5 * r),
                    (x - 1 * Math.sqrt(3) / 2 * r), (y + 1.5 * r),
                    x, (y + 2 * r),
                    (x + 1 * Math.sqrt(3) / 2 * r), (y + 1.5 * r),
                    (x + 1 * Math.sqrt(3) / 2 * r), (y + 0.5 * r)
                ])
                .attr("fill", "black")
                .call(drag())
            break;
        default:
            svg.append("polygon")
                .attr("class", "polygon-" + key_cluster)
                .attr("x", 0)
                .attr("y", 0)
                .attr("points", [x, y,
                    (x - 0.5 * Math.sqrt(3) * r), (y + 1.5 * r),
                    (x + 0.5 * Math.sqrt(3) * r), (y + 1.5 * r)])
                .attr("fill", "black")
                .call(drag())
    }

}

// 没有可行参数集的饼图（弃用）
function pieChart(that) {
    const svg = d3.select('#' + that.id + "1");
    const width = parseInt(that.w)
    const height = parseInt(that.h)

    // 饼图所需的分段数据
    const group_data = that.group_data
    const group_num = that.filter_config.group_number
    let failGroup = new Array()
    let successGroup = new Array()
    group_data.forEach((item) => {
        let failSum = 0
        item.failNum.forEach((e) => (failSum += e))
        failGroup.push(failSum ? item.failNum.map((e) => (e / failSum)) : item.failNum.map((e) => (0)))

        let successSum = 0
        item.successNum.forEach((e) => (successSum += e))
        successGroup.push(successSum ? item.successNum.map((e) => (e / successSum)) : item.successNum.map((e) => (0)))
    })

    // 图片信息
    const no_parameter_image = that.no_parameter_image
    const node_n = no_parameter_image.length

    const node_area_rect = width * height / node_n //给每个节点分配的最大大小
    const node_l_rect = Math.floor(Math.sqrt(node_area_rect)) //节点最大的直径
    const node_inner_radius = Math.floor(0.15 * 0.2 * node_l_rect)
    const node_outter_radius = Math.floor(0.4 * 0.2 * node_l_rect)
    const node_middle_radius = (node_inner_radius + node_outter_radius) / 2

    no_parameter_image.forEach((item, index) => {
        const arcInside = d3.arc()
            .innerRadius(node_inner_radius)
            .outerRadius(node_middle_radius)

        const arcOutside = d3.arc()
            .innerRadius(node_middle_radius)
            .outerRadius(node_outter_radius)

        let pie_inside_data = [{ "failValue": failGroup[item][0] },
        { "failValue": failGroup[item][1] },
        { "failValue": failGroup[item][2] }]
        let pie_outer_data = new Array()
        for (let j = 0; j < group_num; j++) {
            pie_outer_data.push({
                "successValue": successGroup[item][j]
            })
        }

        let pie = d3.pie().value((d) => (1))
        let pieArcsInside = pie(pie_inside_data)
        let pieArcsOuter = pie(pie_outer_data)

        // 两种颜色 线性映射
        const result_insider_color = d3.scaleLinear().domain([0, 1]).range(["rgba(255,165,0,0.2)", "rgba(255,165,0,1)"])
        const result_outer_color = d3.scaleLinear().domain([0, 1]).range(["rgba(34,139,34,0.2)", "rgba(34,139,34,1)"])

        // 里圈（黄色）
        svg.append('g')
            .attr('id', "img_" + item)
            // The donut arcs will be centered around this point
            .attr('transform', `translate(${node_outter_radius * 1.2},${node_outter_radius * 3 * (index + 1)})`)
            // .on("click", function (d) {
            //     debugger
            //     console.log(d)
            //     console.log(this)
            // })
            //在外面定义一个变量收集点击的对象 重复点击取消 最后在设置一个事件传数据
            .selectAll('path')
            // Our data is the arcs, rather than the data object
            // so that we have access to the arc data for rendering the paths
            .data(pieArcsInside)
            .join('path')
            .style('stroke', 'white')
            .style('stroke-width', 2)
            .style('fill', d => result_insider_color(d.data.failValue))
            // here we pass the arc generator. Remember, an accessor function
            // receives the data (d) as the first argument, so rather than doing (d) => arc(d)
            // we can just pass it like below. In this case, our data is the arc descriptor object
            // so the d attribute will be set to the arc's path string. Take a minute to let that sink in
            .attr('d', arcInside)

        // 外圈（绿色）
        svg.append('g')
            .attr("id", "img_" + item)
            .attr('transform', `translate(${node_outter_radius * 1.2},${node_outter_radius * 3 * (index + 1)})`)
            .selectAll('path')
            .data(pieArcsOuter)
            .join('path')
            .style('stroke', 'white')
            .style('stroke-width', 2)
            .style('fill', d => result_outer_color(d.data.successValue))
            .attr('d', arcOutside)

        let node_g = svg.select('#' + "img_" + item)
        node_g.append("text")
            .attr("font-size", "30")
            .text(item)


    })


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
    // console.log("line", line)
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

function getPointsLinkFromTwoCircle0(source_circle, target_circle) {
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
    res.push({ "point": source_line, "indice": source_center[0] })
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
            res.push({ "point": control_point, "indice": v_point[0] })
        } else {
            //交点在target这个圆上
            //先求一下交点 （直线和圆）
            let circle_points = intersectLineCircle(source_line, target_line, target_center, target_r) //两个交点
            let circle_point = getMaxDistancePoint(circle_points[0], circle_points[1], target_line) //取两个交点中的另一个
            let v_point = getVerticalPoints(target_line, circle_point, target_center) //先得到垂点
            let circle_points_v = intersectLineCircle(v_point, target_center, target_center, target_r) //垂线的两个交点
            let control_point = getMinDistancePoint(circle_points_v[0], circle_points_v[1], v_point) //垂线的两个交点中取里垂点较近的那个点
            res.push({ "point": control_point, "indice": v_point[0] })
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
                res.push({ "point": control_point, "indice": v_point[0] })
            }
        }
    }


    res.push({ "point": target_line, "indice": target_center[0] })
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

// 通过数学公式计算两个椭圆的连接线
function getPointsLinkFromTwoEllipse(source_donut, target_donut) {
    let sourceCenter = source_donut["center"]
    let sourceCircle = source_donut["r"]
    let targetCenter = target_donut["center"]
    let targetCircle = target_donut["r"]
    let res = []

    // 直线斜率
    let k = Math.abs(targetCenter["y"] - sourceCenter["y"]) / Math.abs(targetCenter["x"] - sourceCenter["x"])

    let sourceX1 = sourceCenter["x"] + (sourceCircle["r_x"] * sourceCircle["r_y"] /
        Math.sqrt(sourceCircle["r_y"] * sourceCircle["r_y"] + (sourceCircle["r_x"] * sourceCircle["r_x"] * k * k)))
    let sourceX2 = sourceCenter["x"] - (sourceCircle["r_x"] * sourceCircle["r_y"] /
        Math.sqrt(sourceCircle["r_y"] * sourceCircle["r_y"] + (sourceCircle["r_x"] * sourceCircle["r_x"] * k * k)))
    let sourceY1 = sourceCenter["y"] + (sourceCircle["r_x"] * sourceCircle["r_y"] * k /
        Math.sqrt(sourceCircle["r_y"] * sourceCircle["r_y"] + (sourceCircle["r_x"] * sourceCircle["r_x"] * k * k)))
    let sourceY2 = sourceCenter["y"] - (sourceCircle["r_x"] * sourceCircle["r_y"] * k /
        Math.sqrt(sourceCircle["r_y"] * sourceCircle["r_y"] + (sourceCircle["r_x"] * sourceCircle["r_x"] * k * k)))

    let targetX1 = targetCenter["x"] + (targetCircle["r_x"] * targetCircle["r_y"] /
        Math.sqrt(targetCircle["r_y"] * targetCircle["r_y"] + (targetCircle["r_x"] * targetCircle["r_x"] * k * k)))
    let targetX2 = targetCenter["x"] - (targetCircle["r_x"] * targetCircle["r_y"] /
        Math.sqrt(targetCircle["r_y"] * targetCircle["r_y"] + (targetCircle["r_x"] * targetCircle["r_x"] * k * k)))
    let targetY1 = targetCenter["y"] + (targetCircle["r_x"] * targetCircle["r_y"] * k /
        Math.sqrt(targetCircle["r_y"] * targetCircle["r_y"] + (targetCircle["r_x"] * targetCircle["r_x"] * k * k)))
    let targetY2 = targetCenter["y"] - (targetCircle["r_x"] * targetCircle["r_y"] * k /
        Math.sqrt(targetCircle["r_y"] * targetCircle["r_y"] + (targetCircle["r_x"] * targetCircle["r_x"] * k * k)))

    let xMax = Math.max(sourceCenter["x"], targetCenter["x"])
    let xMin = Math.min(sourceCenter["x"], targetCenter["x"])
    let yMax = Math.max(sourceCenter["y"], targetCenter["y"])
    let yMin = Math.min(sourceCenter["y"], targetCenter["y"])

    if (sourceX1 > xMin && sourceX1 < xMax) res.push(sourceX1)
    if (sourceX2 > xMin && sourceX2 < xMax) res.push(sourceX2)
    if (sourceY1 > yMin && sourceY1 < yMax) res.push(sourceY1)
    if (sourceY2 > yMin && sourceY2 < yMax) res.push(sourceY2)

    if (targetX1 > xMin && targetX1 < xMax) res.push(targetX1)
    if (targetX2 > xMin && targetX2 < xMax) res.push(targetX2)
    if (targetY1 > yMin && targetY1 < yMax) res.push(targetY1)
    if (targetY2 > yMin && targetY2 < yMax) res.push(targetY2)

    return res;


}

function getView11MoveImg(newClusterRes, that) {
    postRequest('/getView11MoveImg', {
        "img_names": that.img_names,
        "newClusterRes": newClusterRes,
        "filter_config": that.filter_config,
        "edge": that.edge,
        "process_method": that.process_method,
        "p": that.p,
        "group_data": that.group_data
    }, that, {
        "flag": "flag",
        "cluster_element_force_data": "cluster_element_force_data",
        "cluster_force_data": "cluster_force_data",
        "cluster_res": "cluster_res",
        "group_data": "group_data",
        "no_parameter_image": "no_parameter_image",
        "img_feature": "img_feature"
    }, true);
}

export { forceLayout, forceLayoutCluster, pieChart, resultView, deepCopy };