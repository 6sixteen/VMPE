import * as d3 from "d3";
import '../css/parameterExp.css'

// function parameterMatricesOrigin(that) {
//     //最简单的版本 数据也没有经过合并处理 直接画出来
//     const svg = d3.select('#' + that.id);
//     const width = parseInt(that.w)
//     const height = parseInt(that.h)


//     const parameterStep = that.parameterStep
//     const parameterSets = that.parameterSets
//     const view3dataOrigin = that.view3dataOrigin
//     const line_color = {"0": "#39d4f3", "1": "#f81b59"}
//     const column_num = Object.keys(parameterStep).length //矩形列数
//     let p_step_max = 0
//     for (let key in parameterStep) {
//         if (p_step_max < parameterStep[key].length) {
//             p_step_max = parameterStep[key].length
//         }
//     }// 突然觉得矩形的高度可以不一样大

//     //确定每一列的y轴比例尺
//     //要确定矩形的长宽
//     //要遍历每一列确定范围
//     let y_range = {} //每一列y轴的实际范围
//     for (let imgs_indice in view3dataOrigin) {
//         let imgs_object = view3dataOrigin[imgs_indice]
//         let y_range_object = {}
//         for (let p_indice in imgs_object) {
//             let p_object = imgs_object[p_indice]
//             let max_value = 0
//             for (let p_value in p_object) {
//                 let max_t = d3.max(p_object[p_value])
//                 if (max_value < max_t) {
//                     max_value = max_t
//                 }
//             }
//             y_range_object[p_indice] = [0, max_value]
//         }
//         y_range[imgs_indice] = y_range_object
//     }
//     //要把两个参数集合的坐标轴统一
//     let y_range_object_0 = y_range["0"]
//     let y_range_object_1 = y_range["1"]

//     for (let p_indice in y_range_object_0) {
//         if (y_range_object_0[p_indice][1] < y_range_object_1[p_indice][1]) {
//             y_range["0"][p_indice][1] = y_range_object_1[p_indice][1]
//         } else {
//             y_range["1"][p_indice][1] = y_range_object_0[p_indice][1]
//         }
//     }
//     //空间重复了，但是后面的代码就不用改了

//     //y_range:{"0":{"0":[0,20],"1":[0,4]...},...}
//     //画矩形
//     let matrixH_all = {}
//     const matrixW = width / (column_num - 1) // 矩形weight
//     for (let p_indice in parameterStep) {
//         if (parseInt(p_indice) + 1 == column_num) {
//             break
//         } else {
//             let p_num = parameterStep[p_indice].length
//             let matrixH = rect_height / p_num
//             matrixH_all[p_indice] = matrixH
//             let matrices_column = svg.append("g")
//                 .attr("id", "parameter" + p_indice)
//             for (let j = 0; j < p_num; j++) {
//                 matrices_column.append("rect")
//                     .attr("x", parseInt(p_indice) * matrixW)
//                     .attr("y", j * matrixH)
//                     .attr("width", matrixW)
//                     .attr("height", matrixH)
//                     .attr("fill", "white")
//                     .attr("stroke", "black")
//                     .attr("stroke-width", "2px")
//             }
//         }
//     }

//     //画折线
//     for (let imgs_indice in view3dataOrigin) {
//         let imgs_object = view3dataOrigin[imgs_indice]
//         let imgs_range = y_range[imgs_indice]
//         for (let p_indice in imgs_object) {
//             let p_object = imgs_object[p_indice] //一列
//             let i = 0
//             let y_scale = d3.scaleLinear()
//                 .domain(imgs_range[p_indice])
//                 .range([0, matrixH_all[p_indice]])
//             let x_scale = d3.scaleLinear()
//                 .domain([0, parameterStep[(parseInt(p_indice) + 1) + ""].length - 1])
//                 .range([0, matrixW])
//             let line = d3.line()
//                 //.defined(d => !isNaN(d.value))
//                 .x((d, i) => {
//                     return x_scale(i)
//                 })
//                 .y(d => -y_scale(d))
//             for (let p_value in p_object) {

//                 svg.append("g")
//                     .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(i + 1) * matrixH_all[p_indice]})`)
//                     .append("path")
//                     .datum(p_object[p_value])
//                     .attr("fill", "none")
//                     .attr("stroke", line_color[imgs_indice])
//                     .attr("stroke-width", 1.5)
//                     .attr("stroke-linejoin", "round")
//                     .attr("stroke-linecap", "round")
//                     .attr("d", line);
//                 debugger
//                 i = i + 1
//             }
//         }
//     }


// }

function parameterMatricesCluster(that) {
    //最简单的版本 数据也没有经过合并处理 直接画出来
    if (!that.flag)
        return

    const svg = d3.select('#' + that.id);
    svg.selectAll("*").remove()
    const width = parseInt(document.querySelector('.view3-main').clientWidth)
    const height = parseInt(document.querySelector('.view3-main').clientHeight)

    const title_height = 25
    const operation_height = 20
    const rect_height = height - title_height - operation_height

    const parameterStep = that.parameterStep
    const parameterSets = that.parameterSets
    const view3dataCluster = that.view3dataCluster
    const view3dataOrigin = that.view3dataOrigin
    const parameterInfo = that.parameterInfo
    const operationInfo = that.operationInfo
    const img_indices = that.img_indices

    //layout_info 拟定分成3块 每一块的左上角x，y位置
    const layout_info = {
        "title": {
            "x": width / (Object.keys(parameterStep).length - 1),
            "y": 0,
            "width": width,
            "height": title_height,
            "margin": {
                "left": 5,
                "top": 1,
                "right": 5,
                "bottom": 1
            }
        },
        "operation": {
            "x": 0,
            "y": title_height,
            "width": width,
            "height": operation_height,
            "margin": {
                "left": 2,
                "top": 2,
                "right": 2,
                "bottom": 2
            }
        },
        "parameter": {
            "x": 0,
            "y": title_height + operation_height,
            "width": width,
            "height": rect_height,
            "margin": {
                "left": 2,
                "right": 2,
                "top": 2,
                "bottom": 2
            }
        }
    }

    const line_color = { "0": "rgba(255, 153, 0, 1)", "1": "rgba(0, 153, 153, 0.6)" }
    const column_num = Object.keys(parameterStep).length //矩形列数


    //确定每一列的y轴比例尺
    //要确定矩形的长宽
    //要遍历每一列确定范围
    let y_range = {} //每一列y轴的实际范围
    for (let imgs_indice in view3dataOrigin) {
        let imgs_object = view3dataOrigin[imgs_indice]
        let y_range_object = {}
        for (let p_indice in imgs_object) {
            let p_object = imgs_object[p_indice]
            let max_value = 0
            for (let p_value in p_object) {
                let max_t = d3.max(p_object[p_value])
                if (max_value < max_t) {
                    max_value = max_t
                }
            }
            y_range_object[p_indice] = [0, max_value]
        }
        y_range[imgs_indice] = y_range_object
    }
    // 要把两个参数集合的坐标轴统一
    let y_range_object_0 = y_range["0"]
    let y_range_object_1 = y_range["1"]

    for (let p_indice in y_range_object_0) {
        if (y_range_object_0[p_indice][1] < y_range_object_1[p_indice][1]) {
            y_range["0"][p_indice][1] = y_range_object_1[p_indice][1]
        } else {
            y_range["1"][p_indice][1] = y_range_object_0[p_indice][1]
        }
    }
    console.log("y_range", y_range)
    // 空间重复了，但是后面的代码就不用改了

    //y_range:{"0":{"0":[0,20],"1":[0,4]...},...}
    //画矩形
    let parameter_layout = svg.append("g")
        .attr("id", "view3_parameter")
        .attr('transform', `translate(${layout_info["parameter"]["x"]},${layout_info["parameter"]["y"]})`)

    let matrixH_all = {}
    const matrixW = (layout_info.parameter.width - layout_info.parameter.margin.left - layout_info.parameter.margin.right) / (column_num - 1) // 矩形weight
    let xDiffList = {}
    let yDiffList = {}
    for (let p_indice in parameterStep) {
        if (parseInt(p_indice) + 1 == column_num) {
            break
        } else {
            let parameter = parameterStep[(Number(p_indice) + 1) + '']
            let cluster = view3dataCluster[p_indice]["cluster"]
            let p_num = view3dataCluster[p_indice]["cluster"].length
            let matrixH = (layout_info.parameter.height - layout_info.parameter.margin.top - layout_info.parameter.margin.bottom) / p_num
            matrixH_all[p_indice] = matrixH
            let matrices_column = parameter_layout.append("g")
                .attr("id", "parameter" + p_indice)
                .attr('transform', `translate(${layout_info["parameter"]["margin"]["left"]},${layout_info["parameter"]["margin"]["top"]})`)

            for (let j = 0; j < p_num; j++) {
                matrices_column.append("rect")
                    .attr("x", parseInt(p_indice) * matrixW)
                    .attr("y", j * matrixH)
                    .attr("width", matrixW)
                    .attr("height", matrixH)
                    .attr("fill", "white")
                    .attr("stroke", "#A9A9A9")
                    .attr("stroke-width", "1px")

                // 画坐标轴刻度线
                let marksNum = parameter.length;
                console.log("marksNum", marksNum)
                let xDiff = matrixW / (marksNum + 1);
                let yDiff = matrixH / 5;
                xDiffList[p_indice] = xDiff
                yDiffList[p_indice] = yDiff
                for (let i = 1; i <= marksNum; i++) {
                    matrices_column.append("line")
                        .attr("x1", (parseInt(p_indice) * matrixW + xDiff * i))
                        .attr("y1", (j + 1) * matrixH)
                        .attr("x2", (parseInt(p_indice) * matrixW + xDiff * i))
                        .attr("y2", (j + 1) * matrixH - 3)
                        .attr("stroke-width", "1px")
                        .attr("stroke", "#A9A9A9")
                }
                for (let i = 1; i <= 4; i++) {
                    matrices_column.append("line")
                        .attr("x1", parseInt(p_indice) * matrixW)
                        .attr("y1", ((j * matrixH) + (yDiff * i)))
                        .attr("x2", parseInt(p_indice) * matrixW + 3)
                        .attr("y2", ((j * matrixH) + (yDiff * i)))
                        .attr("stroke-width", "1px")
                        .attr("stroke", "#A9A9A9")
                }


                const getTitle = (data) => {
                    if (data.length == 1) {
                        return data[0] + ""
                    } else {
                        return data[0] + "-" + data[data.length - 1]
                    }
                }

                let title = getTitle(cluster[j])


                matrices_column.append("text")
                    .attr("x", parseInt(p_indice) * matrixW + matrixW - (title.length + 1) * 5)
                    .attr("y", j * matrixH + 10)
                    .attr("fill", "rgba(0, 0, 0, 0.5)")
                    .attr("font-size", "10")
                    .text(title)

            }
        }
    }

    //画折线
    drawLine(view3dataCluster, xDiffList, yDiffList, y_range, matrixW, matrixH_all, parameterStep, line_color, parameter_layout, -1);

    //画title
    const title = svg.append("g")
        .attr("id", "view3_title")
        .attr('transform', `translate(${layout_info["title"]["x"]},${layout_info["title"]["y"]})`)

    //title rect 的大小
    const title_rect = {
        "width": 20,
        "height": 10
    }
    const title_text = {
        "interval": 3,
        "font-size": 13
    }
    const title_interval = 70 // 不同title之间的间隔

    //title_info 中的x y 都是相对其所属的layout
    const title_info = {
        "0": {
            "x": layout_info.title.margin.left,
            "y": layout_info.title.margin.top,
            "type": "rect",
            "width": title_rect.width,
            "height": title_rect.height,
            "color": line_color["0"],
            "text": {
                "content": img_indices['0'],
                "x": layout_info.title.margin.left + title_rect.width + title_text.interval,
                "y": layout_info.title.margin.top + title_rect.height,
                "font-size": title_text["font-size"]
            }
        },
        "1": {
            "x": layout_info.title.margin.left + title_rect.width + title_text.interval + title_text["font-size"] + title_interval,
            "y": layout_info.title.margin.top,
            "type": "rect",
            "width": title_rect.width,
            "height": title_rect.height,
            "color": line_color["1"],
            "text": {
                "content": img_indices['1'],
                "x": layout_info.title.margin.left + title_rect.width + title_text.interval + title_text["font-size"] + title_interval + title_rect.width + 2,
                "y": layout_info.title.margin.top + title_rect.height,
                "font-size": title_text["font-size"]
            }
        }
    }

    for (let i in title_info) {
        title.append("rect")
            .attr("x", title_info[i]["x"])
            .attr("y", title_info[i]["y"])
            .attr("width", title_info[i]["width"])
            .attr("height", title_info[i]["height"])
            .attr("fill", title_info[i]["color"])
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .on("click", function () {
                if (d3.select(this).attr("fill") === line_color[i]) {
                    d3.select(this).attr("fill", "white")
                    parameter_layout.selectAll(".line-" + i).remove()
                    parameter_layout.selectAll(".point-" + i).remove()
                }
                else {
                    d3.select(this).attr("fill", line_color[i])
                    drawLine(view3dataCluster, xDiffList, yDiffList, y_range, matrixW, matrixH_all, parameterStep, line_color, parameter_layout, i);
                }
            })

        title.append("text")
            .attr("x", title_info[i].text.x)
            .attr("y", title_info[i].text.y)
            .attr("font-size", title_info[i].text["font-size"])
            .text(title_info[i].text.content)
    }

    //画operation
    //先画parameter （circle）

    const operation_g = svg.append("g")
        .attr("id", "view3_operation")
        .attr('transform', `translate(${layout_info["operation"]["x"]},${layout_info["operation"]["y"]})`)

    const operation_info = {
        "r": 7,
        "interval": 12,
        "font-size": 14,
    }
    for (let i = 0, len = parameterInfo.length; i < len; i++) {
        if (i !== 0) {
            operation_g.append("circle")
                .datum(parameterInfo[i])
                .attr("cx", layout_info.parameter.margin.left + operation_info.r + matrixW * (i - 1))
                .attr("cy", layout_info.parameter.margin.top + operation_info.r)
                .attr("r", operation_info.r)
                .classed("parameter_no_select", true)
                .classed("parameter_select", false)
            // .attr("fill", "black")
            // .attr("stroke", "black")
            // .attr("stroke-width", "2px")

            operation_g.append("text")
                .attr("x", layout_info.parameter.margin.left + operation_info.r + matrixW * (i - 1) + operation_info.interval)
                .attr("y", layout_info.parameter.margin.top + operation_info.r + operation_info.r)
                .attr("font-size", operation_info["font-size"])
                .text(parameterInfo[i][0])

        } else {
            operation_g.append("circle")
                .datum(parameterInfo[i])
                .attr("cx", layout_info.parameter.margin.left + operation_info.r)
                .attr("cy", layout_info.parameter.margin.top + operation_info.r - 25)
                .attr("r", operation_info.r)
                .classed("parameter_no_select", true)
                .classed("parameter_select", false)
            // .attr("fill", "black")
            // .attr("stroke", "black")
            // .attr("stroke-width", "2px")

            operation_g.append("text")
                .attr("x", layout_info.parameter.margin.left + operation_info.r + operation_info.interval)
                .attr("y", layout_info.parameter.margin.top + operation_info.r + operation_info.r - 25)
                .attr("font-size", operation_info["font-size"])
                .text(parameterInfo[i][0])
        }
    }

    //添加operation 交互事件
    let parameter_select = []
    let parameter_select_object = []
    operation_g.selectAll("circle")
        .on("click", function (event, data) {
            let num = parameter_select.length
            let index = parameter_select.indexOf(data[0])
            if (num < 2) {
                //没有放满
                if (index === -1) {
                    //放入
                    parameter_select.push(data[0])
                    parameter_select_object.push(this)

                    d3.select(this).classed("parameter_no_select", false)
                    d3.select(this).classed("parameter_select", true)
                } else {
                    parameter_select.pop()
                    parameter_select_object.pop()
                    d3.select(this).classed("parameter_no_select", true)
                    d3.select(this).classed("parameter_select", false)
                }
            } else {
                if (index === -1) {
                    parameter_select[0] = parameter_select[1]
                    parameter_select[1] = data[0]

                    d3.select(parameter_select_object[0]).classed("parameter_no_select", true)
                    d3.select(parameter_select_object[0]).classed("parameter_select", false)

                    parameter_select_object[0] = parameter_select_object[1]
                    parameter_select_object[1] = this

                    d3.select(this).classed("parameter_no_select", false)
                    d3.select(this).classed("parameter_select", true)

                } else {
                    //删除
                    parameter_select.splice(index, 1)
                    let temp = parameter_select_object.splice(index, 1)[0]

                    d3.select(temp).classed("parameter_no_select", true)
                    d3.select(temp).classed("parameter_select", false)
                    d3.select(this).classed("parameter_no_select", false)
                    d3.select(this).classed("parameter_select", true)
                }
            }

            let num_new = parameter_select.length
            if (num_new === 2) {

                let order_change = {}
                order_change["parameter_order"] = "no_default"
                let order_temp = []
                let temp1 = -1
                let temp2 = -2
                for (let i = 0, len = parameterInfo.length; i < len; i++) {
                    if (parameterInfo[i][0] === parameter_select[0]) {
                        temp1 = i
                    } else if (parameterInfo[i][0] === parameter_select[1]) {
                        temp2 = i
                    }
                    order_temp.push(parameterInfo[i][1])//parameterInfo[i] ["thresholdMax",1,0] id 当前索引
                }

                let t = order_temp[temp1]
                order_temp[temp1] = order_temp[temp2]
                order_temp[temp2] = t

                order_change["order"] = order_temp
                console.log("order_change")
                that.$emit("order_change", order_change)
            }

        })
}

function drawLine(view3dataCluster, xDiffList, yDiffList, y_range, matrixW, matrixH_all, parameterStep, line_color, parameter_layout, num = -1) {
    // 鼠标悬浮
    let tooltip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('color', '#666666')
        .style('visibility', 'hidden')   // 是否可见（一开始设置为隐藏）
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('')

    for (let p_indice in view3dataCluster) {
        let p_object = view3dataCluster[p_indice]
        let cluster = p_object["cluster"]
        let data = p_object["data"]
        let imgs_range = y_range["0"]
        for (let j = 0, len = cluster.length; j < len; j++) {
            let data_cluster = data[j]
            let y_scale = d3.scaleLinear()
                .domain([imgs_range[p_indice][0], (imgs_range[p_indice][1] * 1.2)])
                .range([-1, matrixH_all[p_indice]])
            let x_scale = d3.scaleLinear()
                .domain([0, parameterStep[(parseInt(p_indice) + 1) + ""].length - 1])
                .range([xDiffList[p_indice] + 2, matrixW - xDiffList[p_indice] + 1])
            let line = d3.line()
                // .defined(d => !isNaN(d.value))
                // .defined(d => d != 0)
                .x((d, i) => {
                    return x_scale(i)
                })
                .y(d => -y_scale(d))
            if (num === 0) {
                parameter_layout.append("g")
                    .attr("class", "line-0")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .append("path")
                    .datum(data_cluster["baseline0"])
                    .attr("fill", "none")
                    .attr("stroke", line_color["0"])
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);

                parameter_layout.append("g")
                    .attr("class", "point-0")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .selectAll("circle")
                    .data(data_cluster["baseline0"])
                    .join("circle")
                    .attr("cx", (d, i) => {
                        return x_scale(i);
                    })
                    .attr("cy", (d) => {
                        if (d == 0) return -1000;
                        else return -y_scale(d);
                    })
                    .attr("r", 2)
                    .attr("fill", line_color["0"])
                    .on('mouseover', function (e, d) {
                        let xValue = parameterStep[(parseInt(p_indice) + 1) + ""][Number(d3.select(this).attr("i"))]
                        return tooltip.style('visibility', 'visible')
                            .style('color', line_color["0"])
                            .text("(" + xValue + ", " + d + ")")
                    })
                    .on('mousemove', function (d, i) {
                        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
                    })
                    .on('mouseout', function (d, i) {
                        return tooltip.style('visibility', 'hidden')
                    });
            } else if (num === 1) {
                parameter_layout.append("g")
                    .attr("class", "line-1")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .append("path")
                    .datum(data_cluster["baseline1"])
                    .attr("fill", "none")
                    .attr("stroke", line_color["1"])
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);

                parameter_layout.append("g")
                    .attr("class", "point-1")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .selectAll("circle")
                    .data(data_cluster["baseline1"])
                    .join("circle")
                    .attr("cx", (d, i) => {
                        return x_scale(i);
                    })
                    .attr("cy", (d) => {
                        if (d == 0) return -1000;
                        else return -y_scale(d);
                    })
                    .attr("r", 2)
                    .attr("fill", line_color["1"])
                    .on('mouseover', function (e, d) {
                        let xValue = parameterStep[(parseInt(p_indice) + 1) + ""][Number(d3.select(this).attr("i"))]
                        return tooltip.style('visibility', 'visible')
                            .style('color', line_color["1"])
                            .text("(" + xValue + ", " + d + ")")
                    })
                    .on('mousemove', function (d, i) {
                        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
                    })
                    .on('mouseout', function (d, i) {
                        return tooltip.style('visibility', 'hidden')
                    });
            } else {
                parameter_layout.append("g")
                    .attr("class", "line-0")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .append("path")
                    .datum(data_cluster["baseline0"])
                    .attr("fill", "none")
                    .attr("stroke", line_color["0"])
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);

                parameter_layout.append("g")
                    .attr("class", "point-0")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .selectAll("circle")
                    .data(data_cluster["baseline0"])
                    .join("circle")
                    .attr("i", (d, i) => (i))
                    .attr("cx", (d, i) => {
                        return x_scale(i);
                    })
                    .attr("cy", (d) => {
                        if (d == 0) return -1000;
                        else return -y_scale(d);
                    })
                    .attr("r", 2)
                    .attr("fill", line_color["0"])
                    .on('mouseover', function (e, d) {
                        let xValue = parameterStep[(parseInt(p_indice) + 1) + ""][Number(d3.select(this).attr("i"))]
                        return tooltip.style('visibility', 'visible')
                            .style('color', line_color["0"])
                            .text("(" + xValue + ", " + d + ")")
                    })
                    .on('mousemove', function () {
                        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
                    })
                    .on('mouseout', function () {
                        return tooltip.style('visibility', 'hidden')
                    });

                parameter_layout.append("g")
                    .attr("class", "line-1")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .append("path")
                    .datum(data_cluster["baseline1"])
                    .attr("fill", "none")
                    .attr("stroke", line_color["1"])
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("d", line);

                parameter_layout.append("g")
                    .attr("class", "point-1")
                    .attr('transform', `translate(${parseInt(p_indice) * matrixW},${(j + 1) * matrixH_all[p_indice]})`)
                    .selectAll("circle")
                    .data(data_cluster["baseline1"])
                    .join("circle")
                    .attr("cx", (d, i) => {
                        return x_scale(i);
                    })
                    .attr("cy", (d) => {
                        if (d == 0) return -1000;
                        else return -y_scale(d);
                    })
                    .attr("r", 2)
                    .attr("fill", line_color["1"])
                    .on('mouseover', function (e, d) {
                        let xValue = parameterStep[(parseInt(p_indice) + 1) + ""][Number(d3.select(this).attr("i"))]
                        return tooltip.style('visibility', 'visible')
                            .style('color', line_color["1"])
                            .text("(" + xValue + ", " + d + ")")
                    })
                    .on('mousemove', function (d, i) {
                        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
                    })
                    .on('mouseout', function (d, i) {
                        return tooltip.style('visibility', 'hidden')
                    });
            }
        }
    }
}

export { parameterMatricesCluster };