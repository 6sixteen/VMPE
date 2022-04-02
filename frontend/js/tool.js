function quantilePointinLine(point1, point2, ratio) {
    /*
    *point1:array;[x1,y1]
    *point2:array;[x2,y2]
    * ratio:dis(point1,point3)/dis(point3,point2)
    *
    * return:
    *   point3:array;[x3,y3]
    * */
    const x = (point1[0] + point2[0] * ratio) / (1 + ratio)
    const y = (point1[1] + point2[1] * ratio) / (1 + ratio)
    return [x, y]
}

function proxyArray2Array(obj) {
    const res = []
    obj.forEach(function (value, key, array) {
        res[key] = value

    })
    return res
}

function arrayEqual(arr1, arr2) {
    if (arr1.length != arr2.length) {
        return false
    }
    let flag = true
    arr1.forEach(function (value, key, arr) {
        if (value != arr2[key]) {
            flag = false
        }
    })
    return flag
}

function removeBracketList(l) {
    if (l instanceof Array) {

        let new_l = []
        for (let i = 0, len = l.length; i < len; i++) {
            if (l[i] instanceof Array) {
                let temp = removeBracketList(l[i])
                for (let j = 0, len1 = temp.length; j < len1; j++) {
                    new_l.push(temp[j])
                }
            } else {
                new_l.push(l[i])
            }
        }
        return new_l
    } else {
        return l
    }

}

function list2str(l, connector = '_') {
    let res = ""
    if (l instanceof Array) {
        for (let i = 0, len = l.length; i < len; i++) {
            res = res + (l[i] + "") + connector
        }
    } else {
        return l + ""
    }
    return res.substr(0, res.length - 1)
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

function getIds(l, sort = true) {
    //input l [1,3,4]
    //return "1_3_4"
    let l_c = deepCopy(l)
    let id_l = removeBracketList(l_c)
    if (sort) {
        id_l = id_l.sort(function (a, b) {
            return a - b
        })
    }
    let id = list2str(id_l)
    return id
}

export {quantilePointinLine, proxyArray2Array, arrayEqual, removeBracketList, list2str, deepCopy, getIds}

