//关于userSearchTree 的数据结构 一开始用[] 存储 后续处理不是很方便
//App.vue bufen
userSearchTree: {
    "nodes"
:
    [{
        "id": "7_0",
        "group": [0, 1, 2, 3, 4, 5, 6],
        "imgNames": [
            "Image_20210812150340363.bmp",
            "Image_20210812150343338.bmp",
            "Image_20210812150345651.bmp",
            "Image_20210812150348106.bmp",
            "Image_20210812150439515.bmp",
            "Image_20210812150442099.bmp",
            "Image_20210812150446018.bmp"
        ]
    }],
        "links"
:
    [],
        "centerNode"
:
    {
        "id"
    :
        "7_0",
            "group"
    :
        [0, 1, 2, 3, 4, 5, 6],
            "imgNames"
    :
        [
            "Image_20210812150340363.bmp",
            "Image_20210812150343338.bmp",
            "Image_20210812150345651.bmp",
            "Image_20210812150348106.bmp",
            "Image_20210812150439515.bmp",
            "Image_20210812150442099.bmp",
            "Image_20210812150446018.bmp"
        ]
    }
}

//outNode 点击响应函数部分
const userSearchTreeTemp = that.userSearchTree
const clickNode = {
    "id": data.id,
    "group": data.group,
    "imgNames": data.imgNames
}
const flag = userSearchTreeTemp["nodes"].filter(d => d.id == clickNode.id).length
if (flag == 0) {
    userSearchTreeTemp["nodes"].push(clickNode)
    //添加边
    const link = links.filter(d => d.target == data.id)
    userSearchTreeTemp["links"].push(link)
    that.$emit('update:userSearchTree', userSearchTreeTemp)
}

//innderNode 点击响应函数部分
const userSearchTreeTemp = that.userSearchTree
const clickNode = {
    "id": data.id,
    "group": data.group,
    "imgNames": data.imgNames
}
const flag = userSearchTreeTemp["nodes"].filter(d => d.id == clickNode.id).length
if (flag == 0) {
    userSearchTreeTemp["nodes"].push(clickNode) //添加点击点
    const link = links.filter(d => d.target == data.id)
    const nodesTemp = []
    link.forEach(function (value, index, array) {
        nodes.forEach(function (value1) {
            if (value.source == value1.id) {
                nodesTemp.push({
                    "id": value1.id,
                    "group": data.group,
                    "imgNames": data.imgNames
                })
            }
        })
    })
    // const nodesTemp = nodes.filter(d => link.filter(d2 => d2.source == d.id))
    // 这个是错的，理解还不够

    Array.prototype.extend = function (other_array) {
        other_array.forEach(function (v) {
            this.push(v)
        }, this)
    }

    userSearchTreeTemp["nodes"].extend(nodesTemp)
    // console.log(userSearchTreeTemp["nodes"])
    userSearchTreeTemp["links"].extend(link)
    const centerNode = userSearchTreeTemp["centerNode"]
    links.forEach(function (value, index, array) {
        link.forEach(function (value1) {
            console.log("value", value)
            console.log("value1", value1)
            console.log("centerNode", centerNode)
            if (value1.source == value.target && value.source == centerNode.id) {
                userSearchTreeTemp["links"].push(value)
            }
        })
    })

}


//为array 添加extend 功能
Array.prototype.extend = function (other_array) {
    other_array.forEach(function (v) {
        this.push(v)
    }, this)
}