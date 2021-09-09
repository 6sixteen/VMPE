function quantilePointinLine(point1,point2,ratio){
    /*
    *point1:array;[x1,y1]
    *point2:array;[x2,y2]
    * ratio:dis(point1,point3)/dis(point3,point2)
    *
    * return:
    *   point3:array;[x3,y3]
    * */
    const x = (point1[0] + point2[0] *ratio) / (1+ratio)
    const y = (point1[1] + point2[1] *ratio) / (1+ratio)
    return [x,y]
}
function proxyArray2Array(obj){
    const res = []
    obj.forEach(function (value,key,array){
        res[key] = value

    })
    return res
}
function arrayEqual(arr1,arr2){
    if(arr1.length!=arr2.length){
        return false
    }
    let flag = true
    arr1.forEach(function(value,key,arr){
        if(value!=arr2[key]){
            flag = false
        }
    })
    return flag
}
export {quantilePointinLine,proxyArray2Array,arrayEqual}

