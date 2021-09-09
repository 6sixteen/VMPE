import * as d3 from "d3";
import combination from "./combination";
import * as tool from "./tool"
import axis from "axios";

function combinationRing(data, that) {
    // console.log(that.imgNames)
    if (that.imgNames.length == 0 || data=="combData") {
        return
    }
    const svg = d3.select('#' + that.svgId);
    if (svg._groups[0][0] == null) {
        return
    }
    svg.selectAll("*").remove()
    // svg.remove()
    Array.prototype.extend = function (other_array) {
        other_array.forEach(function (v) {
            this.push(v)
        }, this)
    }


    const width = parseInt(svg.style("width"))
    const height = parseInt(svg.style("height"))
    const margin = {top: 20, right: 20, bottom: 20, left: 20}
    const circle = [(width - margin.right - margin.left) / 2, (height - margin.top - margin.bottom) / 2] //x , y
    const r = d3.min(circle) / 2


    //const nodes = data["nodes"].map(d => Object.create(d))
    //这个咋不能复制{}对象呢

    const nodes = data["nodes"]
    const outNodes = nodes.filter(d => d.type == "outside")
    const innerNodes = nodes.filter(d => d.type == "inner")
    const circleNodes = nodes.filter(d => d.type == "circle")
    const outNodesNum = outNodes.length

    const nodeColor = ["#5de2f8", "#99f3a3", "#ef80a8"] //outNode,innerNode,circleNode
    const nodeR = [10, 8, 5] //outNode,innerNode,circleNode


    const links = data["links"]

    outNodes.map(d => {
        // console.log("parents",d["group"][1],d["group"][2])
    })


    function getXYInCircle(x, y, r) {
        return function (angle) {
            return [x + r * Math.cos(angle * Math.PI / 180), y + r * Math.sin(angle * Math.PI / 180)]
        }
    }

    let getXY = getXYInCircle(circle[0], circle[1], r)

    function getXYInnerTemplate(nodes, links) {
        return function (innerNode) {
            const relatedLinks = links.filter(d => d.target == innerNode.id)
            // const linkNumber = relatedLinks.length
            // for (var i=0;i<linkNumber;i++){
            //
            // }
            //通过links 找到上层节点坐标的位置
            const parentsNodes = relatedLinks.map(d => nodes.filter(d1 => d1.id == d.source)[0])

            //console.log("parentsNodes", parentsNodes)
            const point1 = [parentsNodes[0]["cx"], parentsNodes[0]["cy"]]
            const point2 = [parentsNodes[1]["cx"], parentsNodes[1]["cy"]]

            //确定比值关系
            const delta = 10
            const d1 = relatedLinks[0]["targetUnionNum"] - relatedLinks[0]["sourceUnionNum"] + delta
            const d2 = relatedLinks[1]["targetUnionNum"] - relatedLinks[0]["sourceUnionNum"] + delta
            const ratio = d1 / (d1 + d2)
            const point3 = tool.quantilePointinLine(point1, point2, ratio)
            //越近差值越小
            return point3
        }
    }

    let getXYInner = getXYInnerTemplate(nodes, links)

    //绘制outside点
    const outNodesSvg = svg.append("g")
        .attr("class", "outerNode")
        .selectAll("circle")
        .data(outNodes)
        .enter()
        .append("circle")
        .attr("r", nodeR[0])
        .attr("fill", nodeColor[0])
        .attr("cx", d => {
            // console.log("d",d)
            d["cx"] = getXY(d.order * 360 / outNodesNum)[0]
            // console.log("d",d)
            return d["cx"]
            // return getXY(d.order*360/outNodesNum)[0]
        })
        .attr("cy", d => {
            d["cy"] = getXY(d.order * 360 / outNodesNum)[1]
            return d["cy"]

            // return getXY(d.order*360/outNodesNum)[1]
        })
        .on("click", (d, data) => {
            // console.log("click outNode",d)
            // console.log("data", data)
            //添加点

            const userSearchTreeTemp = that.userSearchTree
            const clickNode = {
                "id": data.id,
                "group": data.group,
                "imgNames": data.imgNames
            }
            if (!(clickNode.id in userSearchTreeTemp["nodes"])) {
                //修改中心点
                userSearchTreeTemp["centerNode"] = clickNode
                userSearchTreeTemp["nodes"][clickNode.id] = {
                    "group": data.group,
                    "imgNames": data.imgNames
                }
                //添加边
                const link = links.filter(d => d.target == data.id)
                userSearchTreeTemp["links"].extend(link)
                that.$emit('update:userSearchTree', userSearchTreeTemp)

                const clickData = {
                    "imgNames": clickNode.imgNames,
                    "filterConfig": {
                        "minValue": 18000,
                        "maxValue": 25000
                    },
                    "index": clickNode["id"].split("_")[1]
                }

                axis.defaults.baseURL = "http://localhost:4999"
                axis.post('/combinationRing', clickData
                    , {
                        headers: {"Content-Type": "application/json"}
                    })
                    .then(function (response) {
                        const data = response.data.res
                        that.$emit('update:imgNames', clickNode.imgNames)
                        console.log("outer node drawcombinationRing")
                        that.combData = data
                        // combinationRing(data, that)
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }

        })
    outNodesSvg.append("title")
        .text(d => d.id);
    //绘制inner点
    const innerNodesSvg = svg.append("g")
        .attr("class", "innerNode")
        .selectAll("circle")
        .data(innerNodes)
        .enter()
        .append("circle")
        .attr("r", nodeR[1])
        .attr("fill", nodeColor[1])
        .attr("cx", d => {
            // console.log("d",d)
            d["cx"] = getXYInner(d)[0]
            // console.log("d",d)
            return d["cx"]
            // return getXY(d.order*360/outNodesNum)[0]
        })
        .attr("cy", d => {
            d["cy"] = getXYInner(d)[1]
            return d["cy"]

            // return getXY(d.order*360/outNodesNum)[1]
        })
        .on("click", (d, data) => {
                const userSearchTreeTemp = that.userSearchTree
                const nodesPrevious = JSON.parse(JSON.stringify(userSearchTreeTemp["nodes"]))
                const clickNode = {
                    "id": data.id,
                    "group": data.group[0],
                    "imgNames": data.imgNames
                }
                if (!(clickNode.id in userSearchTreeTemp["nodes"])) {
                    //修改中心点

                    userSearchTreeTemp["nodes"][clickNode.id] = {
                        "group": data["group"][0],
                        "imgNames": data.imgNames
                    } //添加点击点
                    //添加点
                    const link = links.filter(d => d.target == data.id)
                    // console.log("link", link)
                    link.forEach(function (value, index, array) {
                            const nodeT = nodes.filter(d => d.id == value.source)[0]
                            userSearchTreeTemp["nodes"][value.source] = {
                                "group": nodeT["group"],
                                "imgNames": nodeT.imgNames
                            }
                        }
                    )
                    userSearchTreeTemp["links"].extend(link)
                    const centerNode = userSearchTreeTemp["centerNode"]
                    links.forEach(function (value, index, array) {
                        link.forEach(function (value1) {
                            // console.log("value1.source",value1.source,"value.target",value.target,"value.source",value.source," centerNode.id", centerNode.id)
                            if (value1.source == value.target && value.source == centerNode.id) {
                                // console.log("value", value)
                                // debugger
                                if (value1.source in nodesPrevious) {
                                    // value有可能在userSearchTreeTemp["links"] 已经存在
                                    let temp = userSearchTreeTemp["links"].filter(d => d.source == value.source && d.target == value.target)
                                    // debugger
                                    if (temp.length == 0) {
                                        userSearchTreeTemp["links"].push(value)
                                    }
                                } else {
                                    userSearchTreeTemp["links"].push(value)
                                }
                            }
                        })
                    })
                    //
                    userSearchTreeTemp["centerNode"] = clickNode
                    that.$emit('update:userSearchTree', userSearchTreeTemp)

                    const clickData = {
                        "imgNames": clickNode.imgNames,
                        "filterConfig": {
                            "minValue": 18000,
                            "maxValue": 25000
                        },
                        "index": clickNode["id"].split("_")[1]
                    }

                    axis.defaults.baseURL = "http://localhost:4999"
                    axis.post('/combinationRing', clickData
                        , {
                            headers: {"Content-Type": "application/json"}
                        })
                        .then(function (response) {
                            const data = response.data.res
                            that.$emit('update:imgNames', clickNode.imgNames)
                            console.log("outer node drawcombinationRing")
                            that.combData = data
                            // combinationRing(data, that)
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                }

            }
        )

    innerNodesSvg.append("title")
        .text(d => d.id);

//绘制圆心点
    const circleNodesSvg = svg.append("g")
        .attr("class", "circleNode")
        .selectAll("circle")
        .data(circleNodes)
        .enter()
        .append("circle")
        .attr("r", nodeR[2])
        .attr("cx", d => {
            // console.log("d",d)
            d["cx"] = circle[0]
            // console.log("d",d)
            return d["cx"]
            // return getXY(d.order*360/outNodesNum)[0]
        })
        .attr("cy", d => {
            d["cy"] = circle[1]
            return d["cy"]
            // return getXY(d.order*360/outNodesNum)[1]
        })
        .attr("fill", nodeColor[2])

    circleNodesSvg.append("title")
        .text(d => d.id);

}


export default combinationRing;