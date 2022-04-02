import * as d3 from "d3";
import { timeThursdays } from "d3";
import { removeBracketList, list2str, deepCopy, getIds } from "./tool";


function riverSet3_one(that) {
    //riverSet based on pixel img
    //索引相对union 版本
    if (!that.flag) {
        return
    }

    let tooltip = d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('background-color', '#DCDCDC')
        .style('width', 'auto')
        .style('height', '20px')
        .style('color', '#696969')
        .style('border-radius', '5px')
        .style('box-shadow', '5px 5px 2px #888888')
        .style('padding', '2px 5px 2px 5px')
        .style('vertical', 'middle')
        .style('visibility', 'hidden')   // 是否可见（一开始设置为隐藏）
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('')

    const svg = d3.select('#' + that.id);
    svg.selectAll("*").remove()
    const width = parseInt(that.w)
    const height = parseInt(that.h)
    const margin = { "top": 5, "right": 5, "bottom": 5, "left": 5 }
    const layout_info = {
        "tree_part": {
            "h": height - margin.top - margin.bottom,
            "w": 0,
            "margin": { "top": 0, "right": 2, "bottom": 0, "left": 0 }
        },
        "pixel_img_part": {
            "h": height - margin.top - margin.bottom,
            "w": width,
            "margin": { "top": 0, "right": 0, "bottom": 0, "left": 5 }
        }
    }

    //data
    const pixel_img = that.pixel_img
    const parameter_setting_num = pixel_img["total"] //合并后的参数集合的大小
    const info_after_combine = that.info_after_combine
    const combine_indices = info_after_combine["re_combine"]
    const parameter_set_number = combine_indices.length + 1 //参数集合的个数
    const parameter_info = that.parameter_info
    const parameter_num = Object.keys(parameter_info).length
    const parameter_statistical_matrix = that.parameter_statistical_matrix
    const img_ids_total = Object.keys(parameter_statistical_matrix) // 所有id 包括交集的部分
    const img_ids = [] //所有单个的id
    for (let i = 0, len = img_ids_total.length; i < len; i++) {
        if (img_ids_total[i].indexOf("_") === -1) {
            img_ids.push(img_ids_total[i])
        }
    }

    //各个元素的大小
    const parameter_item_info = {
        "parameter_item_interval": 5,
        "parameter_item_h": Math.floor((layout_info.pixel_img_part.h - layout_info.pixel_img_part.margin.top -
            layout_info.pixel_img_part.margin.bottom) / 2), //同时展示4条，即2组不同的合并顺序
        "parameter_item_w": Math.floor(
            (layout_info.pixel_img_part.w - layout_info.pixel_img_part.margin.left
                - layout_info.pixel_img_part.margin.right) / parameter_set_number
        )
    }

    const index_item = {
        "num": parameter_set_number,
        "h": parameter_item_info.parameter_item_h - parameter_item_info.parameter_item_interval,
        "w": 20,
        "margin": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
    }

    const parameter_matrix_item = {
        "num": parameter_num,
        "h": parameter_item_info.parameter_item_h - parameter_item_info.parameter_item_interval,
        "w": 30,
        "margin": { "top": 0, "right": 0, "bottom": 0, "left": 0 }
    }

    const pixel_img_item = {
        "h": parameter_item_info.parameter_item_h - parameter_item_info.parameter_item_interval,
        "w": parameter_item_info.parameter_item_w - index_item.w - parameter_matrix_item.w,
        "margin": { "left": 2, "top": 2, "right": 2, "bottom": 2 }
    }

    //用一个二维数组表示parameter_item 的位置信息，数组的value是parameter_item的id
    let parameter_item_location = {
        "0": new Array(parameter_set_number).fill(0),
        "1": new Array(parameter_set_number).fill(0)
    }
    for (let i = 0, len = combine_indices.length; i < len; i++) {
        parameter_item_location["0"][i] = getIds([combine_indices[i][1][0]])
        parameter_item_location["1"][i] = getIds([combine_indices[i][1][1]])
        //先不做顺序的判断
    }
    let combine_res_id = [combine_indices[combine_indices.length - 1][1][0],
    combine_indices[combine_indices.length - 1][1][1]]
    parameter_item_location["1"][parameter_set_number - 1] = getIds(combine_res_id)


    let pixel_img_g = svg.append("g")
        .attr("id", "pixel_img_g")
        .attr('transform', `translate(${margin.left + layout_info.tree_part.w + layout_info.pixel_img_part.margin.left},
                ${margin.top + layout_info.pixel_img_part.margin.top})`)
    let color = d3.scaleOrdinal(d3.schemeCategory10) //像素图颜色
    console.log("parameter_item_location", parameter_item_location)
    let imgs_select = []
    for (let row in parameter_item_location) {
        for (let col = 0, len = parameter_item_location[row].length; col < len; col++) {
            let id = parameter_item_location[row][col]
            if (id === 0) {
                continue
                //总会有空的地方
            }
            //绘制parameter_item 包含三个部分
            let parameter_item_g = pixel_img_g.append("g")
                .attr("id", "parameter_item_" + id)
                .attr('transform', `translate(${col * parameter_item_info.parameter_item_w},
                ${parseInt(row) * parameter_item_info.parameter_item_h})`)

            //绘制像素图部分 pixel_img_item
            let pixel_img_item_g = parameter_item_g.append("g")
                .attr("id", "pixel_img_item_" + id)
                .on("click", function(event) {
                    if(d3.select(this).select("rect").attr("stroke") === "white") {
                        if(imgs_select.length === 0) {
                            imgs_select.push(id);
                            d3.select(this).select("rect").attr("stroke", "red");
                        } else if(imgs_select.length === 1) {
                            imgs_select.push(id);
                            // 发请求
                            that.that.$emit("compare_img", imgs_select);
                            d3.select(this).select("rect").attr("stroke", "red");
                        }
                    } else {
                        imgs_select = imgs_select.filter(item=>item !== id);
                        d3.select(this).select("rect").attr("stroke", "white");
                        console.log("imgs_select", imgs_select)
                    }
                })
                .on('mouseover', function () {
                    return tooltip.style('visibility', 'visible').text(id.split("_").join(","))
                })
                .on('mousemove', function (event) {
                    return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
                })
                .on('mouseout', function () {
                    return tooltip.style('visibility', 'hidden')
                })
            //pixel_img_item-像素部分边框
            let pixel_img_item_box_g = pixel_img_item_g.append("g")
            pixel_img_item_box_g.append("rect")
                .attr("fill", "white")
                .attr("stroke", "white")
                .attr("stroke-width", "0.2")
                .attr("width", pixel_img_item.w - 0.2)
                .attr("height", pixel_img_item.h)
            //pixel_img_item-像素部分
            let pixel_img_item_img_g = pixel_img_item_g.append("g")
                .attr('transform', `translate(${pixel_img_item.margin.left},${pixel_img_item.margin.right})`)

            let pixel_img_item_img_w = pixel_img_item.w - pixel_img_item.margin.left - pixel_img_item.margin.right
            let pixel_img_item_img_h = pixel_img_item.h - pixel_img_item.margin.top - pixel_img_item.margin.bottom
            let indices2pixelImg2_res = indices2pixelImg2(pixel_img[id][1], pixel_img_item_img_w, pixel_img_item_img_h, parameter_setting_num)
            let pixel_img_location = indices2pixelImg2_res[2]
            // pixel_img_location [[number,row,col]]
            let pixel_info = indices2pixelImg2_res[1]
            pixel_img_item_img_g.selectAll("rect")
                .data(pixel_img_location)
                .enter()
                .append("rect")
                .attr("id", d => "x_" + d[2] + "y_" + d[1])
                .attr("fill", "rgb(210,241,135)")
                // .attr("stroke","black")
                // .attr("stroke","2")
                .attr("width", pixel_info.w)
                .attr("height", pixel_info.h)
                .attr("x", d => d[2] * pixel_info.w)
                .attr("y", d => d[1] * pixel_info.h)


            //绘制parameter matrix 部分
            let parameter_matrix_g = parameter_item_g.append("g")
                .attr("id", "parameter_matrix_g_" + id)
                .attr('transform', `translate(${pixel_img_item.w},${0})`)
            //parameter matrix 边框
            // let parameter_matrix_box_g = parameter_matrix_g.append("g")
            // parameter_matrix_box_g.append("rect")
            //     .attr("fill", "white")
            //     .attr("stroke", "black")
            //     .attr("stroke", "1")
            //     .attr("width", parameter_matrix_item.w)
            //     .attr("height", parameter_matrix_item.h)
            //parameter matrix
            let parameter_matrix_content_g = parameter_matrix_g.append("g")
                .attr("id", "parameter_matrix_content_g_" + id)
                .attr('transform', `translate(${parameter_matrix_item.margin.left},${parameter_matrix_item.margin.top})`)

            let statistical_matrix = parameter_statistical_matrix[id]
            const color_m = d3.scaleLinear().domain([0, 1]).range(["#ace1fa", "#025884"]) //参数集合统计矩阵的颜色
            for (let i = 0, len = statistical_matrix.length; i < len; i++) {
                //画一列 z代表列数
                let value_num = statistical_matrix[i].length //这个参数取值的个数
                let m_h = (parameter_matrix_item.h - parameter_matrix_item.margin.top - parameter_matrix_item.margin.bottom) / value_num
                let m_w = (parameter_matrix_item.w - parameter_matrix_item.margin.left - parameter_matrix_item.margin.right) / len

                parameter_matrix_content_g.append("g")
                    .attr("id", "row_" + i)
                    .selectAll("rect")
                    .data(statistical_matrix[i])
                    .enter()
                    .append("rect")
                    .attr("width", m_w)
                    .attr("height", m_h)
                    .attr("x", m_w * i)
                    .attr("y", (d, i) => {
                        return i * m_h
                    })
                    .attr("fill", d => color_m(d[1]))
                // if (j == 0) {
                //     debugger
                //     console.log(intervals_parameter_matrix[j][z])
                // }
            }

            //绘制index 部分
            let index_g = parameter_item_g.append("g")
                .attr("id", "index_g_" + id)
                .attr('transform', `translate(${pixel_img_item.w + parameter_matrix_item.w},${0})`)
            //边框 todo

            //index content --circle
            let index_content_g = index_g.append("g")
                .attr("id", "index_content_g_" + id)
                .attr('transform', `translate(${index_item.margin.left},${index_item.margin.top})`)
            let circle_h_avg = (index_item.h - index_item.margin.top - index_item.margin.bottom) / parameter_set_number
            let circle_r = Math.min(Math.floor(circle_h_avg / 2), index_item.w / 2.5)
            console.log("img_ids", img_ids)
            for (let i = 0; i < parameter_set_number; i++) {
                index_content_g
                    .append("circle")
                    .attr("fill", d => {
                        let id_array = id.split("_")
                        if (id_array.indexOf(img_ids[i]) !== -1) {
                            return "#999999"
                        } else {
                            return "white"
                        }
                    })
                    .attr("stroke", "black")
                    .attr("stroke-width", "1")
                    .attr("cx", index_item.w / 2)
                    .attr("cy", () => (i + 0.5) * circle_h_avg)
                    .attr("r", circle_r)
                    .on('mouseover', function () {
                        return tooltip.style('visibility', 'visible').text(img_ids[i])
                    })
                    .on('mousemove', function (event) {
                        return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px')
                    })
                    .on('mouseout', function () {
                        return tooltip.style('visibility', 'hidden')
                    })


            }
        }
    }

}

function riverSet3(that) {

    //riverSet based on pixel img
    //索引相对union 版本
    if (!that.flag) {
        return
    }

    let graph_data = {
        "flag": that.flag, "id": that.id, "h": document.querySelector(".view2-svg").clientHeight, "w": document.querySelector(".view2-svg").clientWidth - 10, "pixel_img": that.pixel_img,
        "info_after_combine": that.info_after_combine, "parameter_info": that.parameter_info,
        "parameter_statistical_matrix": that.parameter_statistical_matrix, "combine": that.combine, "that": that 
    }
    riverSet3_one(graph_data)

    let graph_data_1 = {
        "flag": that.flag, "id": that.id_1, "h": document.querySelector(".view2-svg-1").clientHeight, "w": document.querySelector(".view2-svg-1").clientWidth - 10, "pixel_img": that.pixel_img_1,
        "info_after_combine": that.info_after_combine_1, "parameter_info": that.parameter_info,
        "parameter_statistical_matrix": that.parameter_statistical_matrix_1, "combine": that.combine_1, "that": that 
    }
    riverSet3_one(graph_data_1)

    let tree_data = {
        "re_combine": that.info_after_combine["re_combine"], "combine": that.combine, "re_combine_1": that.info_after_combine_1["re_combine"], "combine_1": that.combine_1,
        "canTwoCluster": that.canTwoCluster, "newCluster": that.newCluster
    }
    console.log(tree_data)
    that.$emit("draw_tree", tree_data)
}

function indices2pixelImg(indices, k, w, h) {
    //返回的坐标索引从0开始
    let res = {}
    for (let i = 0, len = indices.length; i < len; i++) {
        let temp = Math.floor(indices[i] / k)
        let temp1 = indices[i] - temp * k //是否有单独多出来一格
        let row = Math.floor(temp / w) //
        row = Math.max(0, row)
        let temp2 = temp - w * row//整行排满之后，是否多出来一行
        let col = -1
        if (temp2 === 0 && temp1 === 0) {
            row = row - 1
            col = w - 1
        }
        if (temp2 !== 0 && temp1 === 0) {
            col = temp2 - 1
        }
        if (temp2 === 0 && temp1 !== 0) {
            col = 0
        }
        if (temp2 !== 0 && temp1 !== 0) {
            col = temp2 + 1 - 1
        }
        row = Math.max(0, row)
        let location_id = row + "_" + col
        // console.log("index",indices[i])
        // console.log("row col",row," ",col)
        if (location_id in res) {
            res[location_id][0] = res[location_id][0] + 1
        } else {
            res[location_id] = [1, row, col]
        }
    }
    return Object.values(res)
}

function indices2pixelImg2(indices, w, h, parameter_setting_num, shape = "square") {
    //函数功能：根据信息，给出每个pixel的大小以及indices转换后的位置
    //indices:[[],[],[]....]
    //w 画布的w
    //h 画布的h
    //parameter_setting_num 参数集合的最大个数
    const total_area = w * h
    const pixel_area_per_setting = (total_area / parameter_setting_num).toFixed(2)
    //这里应该分两种情况讨论
    //total_area > parameter_setting_num (union 应该基本都是这种)
    //total_area < parameter_setting_num  (sample 应该是这种) todo
    if (pixel_area_per_setting >= 1) {
        let pixel_info = {}
        pixel_info["shape"] = shape
        if (shape === "square") {
            // let edge = Math.floor(Math.sqrt(pixel_area_per_setting))
            let edge = Math.sqrt(pixel_area_per_setting).toFixed(2)
            pixel_info["w"] = edge
            pixel_info["h"] = edge
            debugger
        }
        if (shape === "rect") {
            let edge = Math.floor(Math.sqrt(pixel_area_per_setting))
            let edge2 = (pixel_area_per_setting / edge).toFixed(1)
            if (edge > edge2) {
                pixel_info["w"] = edge
                pixel_info["h"] = edge2
            } else {
                pixel_info["w"] = edge2
                pixel_info["h"] = edge
            }
        }
        // todo 其他形状
        const col = Math.floor(w / pixel_info.w)
        const row = Math.floor(h / pixel_info.h)
        const w_waste = w - col * pixel_info.w
        const h_waste = h - row * pixel_info.h
        const area_waste = w * h - col * row * pixel_info.w * pixel_info.h
        const area_waste_percent = area_waste / total_area
        let res = indices2pixelImg(indices, 1, col, row)
        return [true, pixel_info, res]
    } else {
        const setting_per_pixel_area = Math.ceil(parameter_setting_num / total_area) //每个像素对应的个数
        let edge = Math.sqrt((w * h * setting_per_pixel_area) / parameter_setting_num)
        edge = Math.floor(edge * 100) / 100
        let pixel_info = {}
        pixel_info["shape"] = "point"
        pixel_info["w"] = edge
        pixel_info["h"] = edge
        let res = indices2pixelImg(indices, setting_per_pixel_area, Math.floor(w / pixel_info["w"]), Math.floor(h / pixel_info["h"]))
        return [true, pixel_info, res]
    }


}

//https://observablehq.com/@d3/tree


export { riverSet3 };
