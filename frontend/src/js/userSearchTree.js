import * as d3 from "d3"
import * as tool from "./tool"

function findRootNode(nodes) {
    //找到根节点 是通过id（7_0）字符串处理判断谁是根节点
    //nodes ：{ "7_0": { "group": [ 0, 1, 2, 3, 4, 5, 6 ],
    // "imgNames": [ "Image_20210812150340363.bmp", "Image_20210812150343338.bmp", "Image_20210812150345651.bmp",
    // "Image_20210812150348106.bmp", "Image_20210812150439515.bmp", "Image_20210812150442099.bmp", "Image_20210812150446018.bmp" ] } }
    // 返回的是id
    let rootNodeId = ""
    let rootLevel = -1
    for (let key in nodes) {
        let level = key.split("_")[0]
        if (level > rootLevel) {
            rootNodeId = key
            rootLevel = level
        }
    }
    return {
        "id": rootNodeId,
        "group": nodes[rootNodeId]["group"],
        "imgNames": nodes[rootNodeId]["imgNames"]
    }
}

function findNodes(targetNode, links, nodes, type = "source") {
    //找到和目标点相连接的点 type决定目标点是source or target

    const connectedNodes = []
    const target = type == "source" ? "target" : "source"
    links.forEach(function (value, index, array) {
        if (value[type] == targetNode.id) {
            connectedNodes.push({
                "id": value[target],
                "group": nodes[value[type]]["group"],
                "imgNames": nodes[value[type]]["imgNames"]
            })
        }
    })
    return connectedNodes
}

// createTree
function createTree(node, nodes, links) {
    node["lower"] = findNodes(node, links, nodes)
    node["lower"].forEach(function (value, key, array) {
        createTree(value, nodes, links)
    })
}

//traverse
function traverseTree(tree, level) {
    // console.log("nodeId", tree["id"], "_level", level)
    const lower = tree["lower"]
    const lowerNumber = lower.length
    lower.forEach(function (value, key, array) {
        traverseTree(value, level + 1)
    })
}

//生成树的层级order表
function levelOrder(table, tree, level) {
    if (!(level in table)) {
        table[level] = {}
        table[level][tree["id"]] = 1
    } else {
        if (!(tree["id"] in table[level])) {
            const order = Object.keys(table[level])
            table[level][tree["id"]] = order.length + 1
        }
    }
    const lower = tree["lower"]
    lower.forEach(function (value, key, array) {
        levelOrder(table, value, level + 1)
    })
}

//生成userSearchTree 的坐标
function layoutUserSearchTree(tree, level, brotherNum, x, y, levelOrder, treeH = 15,) {
    //生成userSearchTree 的坐标
    // 方法：平均分法
    // tree:{
    //     "id":"7_0",
    //         "group":[],
    //         "imgName":[],
    //         "lower":[tree]
    // }
    // level：树高
    // localOrder:在同一层的顺序
    // brotherNum: 该层有多少个点
    // x：画布的width
    // y: 画布的height
    // treeH:树高
    const localOrder = levelOrder[level][tree["id"]]
    tree["x"] = (x / (brotherNum + 1)) * localOrder
    tree["y"] = y - level * treeH
    // console.log("treeId", tree["id"], tree["x"], " ", tree["y"])
    const lower = tree["lower"]
    const lowerNumber = lower.length
    lower.forEach(function (value, key, array) {
        const nodeNum = Object.keys(levelOrder[level + 1]).length
        layoutUserSearchTree(value, level + 1, nodeNum, x, y, levelOrder, treeH)
    })
}

function userSearchTree(data) {
    // console.log("userSearchTree")
    const svg = d3.select('#userSearchTree');
    //这个条件判断是为了解决Vue 渲染顺序的问题

    if (svg._groups[0][0] != null) {
        const width = parseInt(svg.style("width"))
        const height = parseInt(svg.style("height"))

        const margin = {top: 20, right: 20, bottom: 20, left: 20}
        const baseCenter = [(width - margin.right - margin.left) / 2, height - margin.bottom]


        const links = data["links"]
        const nodes = data["nodes"]

        //findNodes() 测试
        // const targetNode = {
        //     "id": "7_0"
        // }
        // const connectedNodes = findNodes(targetNode, links, nodes)
        // console.log("connectNodes", connectedNodes)

        //createTree
        const tree = findRootNode(nodes)
        createTree(tree, nodes, links)
        // console.log("tree", tree)
        // traverseTree(tree, 0)

        //生成树结构各个节点的order表
        const table = {}
        levelOrder(table, tree, 0)
        // console.log("table", table)
        layoutUserSearchTree(tree, 0, 1, (width - margin.right - margin.left), height - margin.bottom, table)
        return tree
    }
}

function getLeaf2Root(userSearchTree) {
    const res = []
    // 先把leaf点放入
    let tempNode = userSearchTree["centerNode"]
    let group = tool.proxyArray2Array(tempNode.group)
    let imgNames = tool.proxyArray2Array(tempNode.imgNames)
    res.push({
        "id": tempNode.id,
        "group": group,
        "imgNames": imgNames,

    })
    const links = JSON.parse(JSON.stringify((userSearchTree["links"])))
    const nodes = userSearchTree["nodes"]
    let tempLinks = links.filter(d => d.target == tempNode.id)
    while (tempLinks.length != 0) {
        //这里先只简单地取第一个点
        let group = tool.proxyArray2Array(nodes[tempLinks[0].source].group)
        let imgNames = tool.proxyArray2Array(nodes[tempLinks[0].source].imgNames)
        tempNode = {
            "id": tempLinks[0].source,
            "group": group,
            "imgNames": imgNames
        }
        res.push(tempNode)
        tempLinks = links.filter(d => d.target == tempNode.id)
    }
    return res
}

function userSearchTree2Nodes(tree, nodes) {
    // 把userSearchTree变成[{},{}],方便绘制
    nodes.push({
        "id": tree["id"],
        "groups": tree["group"],
        "imgNames": tree["imgNames"],
        "x": tree["x"],
        "y": tree["y"]
    })
    const lower = tree["lower"]
    lower.forEach(function (value, key, array) {
        userSearchTree2Nodes(value, nodes)
    })
}

function drawUserSearchTree(data, that) {
    // console.log("drawUserSearchTree")
    // console.log("data", data)
    const svg = d3.select('#' + that.svgId);
    if (svg._groups[0][0] != null) {
        // console.log("drawUserSearchTree-data", data)
        const tree = userSearchTree(data)
        // console.log("drawUserSearchTree-tree", tree)
        const nodes = []
        userSearchTree2Nodes(tree, nodes)
        const width = parseInt(svg.style("width"))
        const height = parseInt(svg.style("height"))

        const margin = {top: 20, right: 20, bottom: 20, left: 20}
        // console.log("drawUserSearchTree-drawNodes ", nodes)
        svg.selectAll("*").remove()
        const userTree = svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", d => d["x"])
            .attr("cy", d => d["y"])
            .attr("fill", "black")

        userTree.append("title")
            .text(d => d.id);

    }


}

export {userSearchTree, drawUserSearchTree, getLeaf2Root}
