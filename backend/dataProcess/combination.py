'''
Description: 用来获得图片组合数据
Writer = "plh"
Data:2021/8/29
'''

from itertools import combinations
import numpy as np
from tool import calCnmSum
from ILP import runILP


def combineN(temp_list, n):
    '''
    列出列表中含有n个元素的组合可能
    :param temp_list: [1,2,3,4,5]
    :param n:元素个数
    :return: []
    '''
    temp_list2 = []
    for c in combinations(temp_list, n):
        temp_list2.append(c)
    return temp_list2


def combineD(temp_list, num_list):
    '''
    列出num_list中要求的个数的所有元素的组合可能
    :param temp_list: [1,2,3,4,5]
    :param num_list: [2,3,4,5]
    :return:
    '''
    end_list = []
    for i in num_list:
        end_list.extend(combineN(temp_list, i))
    return end_list


def getIntersectionFromComb(combList):
    '''
    返回所有組合兩兩組合的交集,并且返回組合信息
    :param combList: [[1,2,3],[1,2,4],[2,3,4]]
    :return:
    [[[1,2],0,1],[[2,3],0,2],[[2,4],1,2]]
    '''
    res = []
    number = len(combList[0])
    for i, item in enumerate(combList):
        for j in range(i + 1, number + 1):
            print("item", item)
            print("item2", combList[j])
            intersection = list(set(item).intersection(set(combList[j])))
            if len(intersection) + 1 == number:
                res.append([intersection, i, j])
    return res


def getIntersectionFromMatrixs(matrices):
    '''
    得到多个矩阵的交集
    :param matrixs: [np,np,...]
    :return:
    matrix: 交集np
    '''
    num = len(matrices)
    matrix = matrices[0].copy()
    n, m = np.shape(matrix)
    for i in range(1, num):
        matrixTemp = matrices[i]
        if (matrixTemp.size == 0):  # 處理np.array([])
            matrixTemp = np.zeros((1, m))
        res = (matrix[:, None] == matrixTemp).all(-1).any(-1)
        pos = np.where(res == True)
        matrix = matrix[pos]
    return matrix


def getUnionFromMatrces(matrices):

    '''
    reference: https://stackoverflow.com/questions/53949850/efficient-way-to-get-union-of-set-of-vectors-in-numpy
    得到多个矩阵的并集
    :param matrices:
    :return:
    '''
    num = len(matrices)
    matrix = matrices[0].copy()
    for i in range(1, num):
        if matrices[i].size != 0:
            #method 2
            if matrix.size == 0:
                matrix = matrices[i]
            else:
                # method 1
                # temp = np.vstack((matrix, matrices[i]))
                # matrix = np.unique(temp,axis=0)
                temp = np.vstack((matrix, matrices[i]))
                m,n = np.shape(temp)
                matrix = set([tuple(temp[j,:]) for j in range(m)])
                matrix = np.array([list(item) for item in matrix])
    return matrix


def getSubtractionFromMatrixs(matrixs):
    '''
    这个函数应该是求 A-B 吧 我忘了
    :param matrixs:
    :return:
    '''
    num = len(matrixs)
    matrix = matrixs[0].copy()
    n, m = np.shape(matrix)
    for i in range(1, num):
        matrixTemp = matrixs[i]
        a1_rows = matrix.view([('', matrix.dtype)] * matrix.shape[1])
        a2_rows = matrixTemp.view([('', matrixTemp.dtype)] * matrixTemp.shape[1])
        matrix = np.setdiff1d(a1_rows, a2_rows).view(matrix.dtype).reshape(-1, matrix.shape[1])
    return matrix


def getNodeAndLinks(data):
    '''
    第一個版本combination視圖所需要的數據
    :param data:
        {"imgName":
            [[1,2,..],...]:list
        "imgName1":
            ...
        }
    :return:
    '''
    imgNames = list(data.keys())
    number = len(data)
    l = range(0, number, 1)
    # l2 = range(1, number + 1, 1)
    l2 = range(2, number + 1, 1)
    nodeIds = combineD(l, l2)
    nodeIdsLen = len(nodeIds)
    nodes = []  # 记录nodes
    # 获得nodes
    for i, item in enumerate(nodeIds):
        matrixs = []
        for obj in item:
            matrixs.append(np.array(data[imgNames[obj]]))
        matrix = getIntersectionFromMatrixs(matrixs)
        unionNum = np.shape(matrix)[0]
        nodes.append({"id": i, "group": item, "unionNum": unionNum})
    # nodes 获得完毕

    # 获得links
    links = []
    for i, item in enumerate(nodeIds):
        itemLen = len(item)
        # indexS = calCnmSum(number, itemLen)
        # indexF = calCnmSum(number, itemLen+1)

        indexS = calCnmSum(number, itemLen) - number
        indexF = calCnmSum(number, itemLen + 1) - number

        for j in range(indexS, indexF):
            intersection = list(set(item).intersection(set(nodeIds[j])))
            if (len(intersection) == len(item)):
                links.append({"source": i, "target": j, "sourceItem": item, "targetItem": nodeIds[j],
                              "unionDec": nodes[i]["unionNum"] - nodes[j]["unionNum"]})

    res = {"nodes": nodes, "links": links}
    return res


def orderComb(data):
    '''
    計算邊緣點的順序
    :param data:
    [
        {
            "group" : ["Image_20210812150335027.bmp",...],
            "matrix": [[],[]...] (list),
            "type" : "outside",
            "unionNum" : 581
        },
        {


        },
        ....
    ]
    :return:
    每個dict對象都添加了order屬性
    '''
    data.sort(key=lambda x: x["unionNum"], reverse=True)
    for i, item in enumerate(data):
        item["order"] = i
    return data


# 優化方面 求并集部分可以優化 公共的部分求并集可以提取出來
def getRingCombinationData(data, comIndex):
    '''
    第二個版本combination視圖所需要的數據
    :param data:
            图片+参数集合+该组合的索引（如果是从Projection过来索引是0）
            {
            "imgName":
                参数集合
                np.array
                [[1,2,..],...]
            ,
            "imgName1":
                同上,
            ...
            }


            comIndex:
                索引
                int
    :return:
    '''
    imgNames = list(data.keys())
    imgNumber = len(imgNames)
    l = range(0, imgNumber, 1)
    ringPoint = combineN(l, imgNumber - 1)
    innerPoint = getIntersectionFromComb(ringPoint)

    # 計算ringPoint屬性
    ringPoints = []
    for i, point in enumerate(ringPoint):
        temp = {}
        temp["id"] = str(imgNumber - 1) + "_" + str(i)
        temp["group"] = point
        matrixs = []
        temp["imgNames"] = []
        for obj in point:
            matrixs.append(np.array(data[imgNames[obj]]))
            temp["imgNames"].append(imgNames[obj])
        temp["matrix"] = getIntersectionFromMatrixs(matrixs)
        temp["type"] = "outside"
        temp["unionNum"] = np.shape(temp["matrix"])[0]
        ringPoints.append(temp)
    # 計算ringPoint的order
    ringPoints = orderComb(ringPoints)

    # 計算内部點
    innerPoints = []
    for i, point in enumerate(innerPoint):
        temp = {}
        temp["id"] = str(imgNumber - 2) + "_" + str(i)
        temp["group"] = point
        matrixs = []
        temp["imgNames"] = []
        for obj in point[0]:
            matrixs.append(np.array(data[imgNames[obj]]))
            temp["imgNames"].append(imgNames[obj])
        temp["matrix"] = getIntersectionFromMatrixs(matrixs)
        temp["type"] = "inner"
        temp["unionNum"] = np.shape(temp["matrix"])[0]
        innerPoints.append(temp)

    # 計算圓心點
    circlePoint = {}
    circlePoint["id"] = str(imgNumber) + "_" + str(comIndex)
    circlePoint["imgNames"] = imgNames
    circlePoint["group"] = list(range(0, imgNumber))
    matrixs = []
    for obj in range(0, imgNumber):
        matrixs.append(np.array(data[imgNames[obj]]))
    circlePoint["matrix"] = getIntersectionFromMatrixs(matrixs)
    circlePoint["type"] = "circle"
    circlePoint["unionNum"] = np.shape(circlePoint["matrix"])[0]

    # 計算邊, 從上層作爲source
    # outside2inner
    out2innderLinks = []
    for i, point in enumerate(innerPoint):
        temp = {}
        temp["source"] = str(imgNumber - 1) + "_" + str(point[1])
        temp["target"] = str(imgNumber - 2) + "_" + str(i)
        temp["sourceUnionNum"] = ringPoints[point[1]]["unionNum"]
        temp["targetUnionNum"] = innerPoints[i]["unionNum"]

        temp2 = {}
        temp2["source"] = str(imgNumber - 1) + "_" + str(point[2])
        temp2["target"] = str(imgNumber - 2) + "_" + str(i)
        temp2["sourceUnionNum"] = ringPoints[point[2]]["unionNum"]
        temp2["targetUnionNum"] = innerPoints[i]["unionNum"]
        out2innderLinks.append(temp)
        out2innderLinks.append(temp2)

    # circle2outside
    circle2outsideLinks = []
    for i, point in enumerate(ringPoint):
        temp = {}
        temp["source"] = str(imgNumber) + "_" + str(comIndex)
        temp["target"] = str(imgNumber - 1) + "_" + str(i)
        temp["sourceUnionNum"] = ringPoints[i]["unionNum"]
        temp["targetUnionNum"] = circlePoint["unionNum"]
        circle2outsideLinks.append(temp)

    nodes = []
    nodes.extend(ringPoints)
    nodes.extend(innerPoints)
    nodes.append(circlePoint)

    links = []
    links.extend(out2innderLinks)
    links.extend(circle2outsideLinks)

    return {
        "nodes": nodes,
        "links": links
    }


def getSankey(m_i):
    m, p_n = np.shape(m_i)
    p = []
    for i in range(p_n):
        p_i = list(set(m_i[:, i]))
        p.append(p_i)
    # p [[50,60,70],[0.1,0.2]...] 不同参数的所有取值
    nodes = []
    for i, item in enumerate(p):
        for j, item1 in enumerate(item):
            name = str(i) + "_" + str(item1)
            category = str(i) + "_" + str(j)
            nodes.append({
                "name": name,
                "category": category
            })
    print("nodes", nodes)

    links = []
    p_num = len(p)
    for i in range(p_num - 1):
        p_pre = p[i]
        p_last = p[i + 1]
        for item in p_pre:
            for item1 in p_last:
                source = str(i) + "_" + str(item)
                target = str(i + 1) + "_" + str(item1)
                indices = np.where(m_i[:, i] == item)[0]
                m_t = m_i[indices]
                indices1 = np.where(m_t[:, i + 1] == item1)[0]
                value = np.shape(indices1)[0]
                if value != 0:
                    links.append({
                        "source": source,
                        "target": target,
                        "value": value
                    })
    print("links", links)
    return {
        "nodes": nodes,
        "links": links
    }


def getSankeyILP(m_i):
    m, p_n = np.shape(m_i)
    p = []
    for i in range(p_n):
        p_i = list(set(m_i[:, i]))
        p_i.sort()
        p.append(p_i)
    # p [[50,60,70],[0.1,0.2]...] 不同参数的所有取值
    nodes = []
    for i, item in enumerate(p):
        nodes_temp = []
        for j, item1 in enumerate(item):
            name = str(i) + "_" + str(item1)
            category = str(i) + "_" + str(j)
            id = j
            size = len(np.where(m_i[:, i] == item1)[0])
            nodes_temp.append({
                "name": name,
                "category": category,
                "size": size,
                "id": id
            })
        nodes.append(nodes_temp)
    # print("nodes", nodes)

    links = []
    p_num = len(p)
    for i in range(p_num - 1):
        p_pre = p[i]
        p_last = p[i + 1]
        links_temp = []
        for j, item in enumerate(p_pre):
            for k, item1 in enumerate(p_last):
                source = str(i) + "_" + str(item)
                target = str(i + 1) + "_" + str(item1)
                indices = np.where(m_i[:, i] == item)[0]
                m_t = m_i[indices]
                indices1 = np.where(m_t[:, i + 1] == item1)[0]
                value = np.shape(indices1)[0]
                sourceId = j
                targetId = k
                if value != 0:
                    links_temp.append({
                        "source": source,
                        "target": target,
                        "value": value,
                        "sourceid": sourceId,
                        "targetid": targetId
                    })
        links.append(links_temp)
    # print("links", links)
    return {
        "nodes": nodes,
        "links": links
    }


if __name__ == '__main__':
    matrices = [
        np.array([[3,4,5]]),
        np.array([[1, 2, 3], [4, 5, 6]]),
        np.array([[1, 2, 3], [4, 5, 7]])
    ]

    m = getUnionFromMatrces(matrices)
    print(m)
    print(len(np.array(m)))
    input()
    # matrixs = [
    #     np.array([[1, 2, 3], [4, 5, 6]]),
    #     np.array([])
    # ]
    # matrix = getGraph(matrixs)
    # print(matrix)
    # matrix2 = getUnionFromMatrixs(matrixs)
    # print(matrix2)

    # imgNames = [0, 1, 2, 3, 4, 5, 6]
    # imgNumber = len(imgNames)
    # l = range(0, imgNumber, 1)
    # ringPoint = combineN(l, imgNumber - 1)
    # print("ringPoint", ringPoint)
    # innerPoint = getIntersectionFromComb(ringPoint)
    # print(innerPoint)
    # print(len(innerPoint))

    m = np.array([[50, 1, 0.1], [50, 2, 0.3], [50, 2, 0.3], [40, 3, 0.2], [40, 1, 0.2], [30, 1, 0.1]])
    # n = np.array([[50, 1, 0.1], [50, 2, 0.3], [50, 2, 0.3], [40, 3, 0.2], [40, 1, 0.2], [30, 1, 0.1]])
    #
    # getSankey(m)
    res = getSankeyILP(m)
    res_ILP = runILP(res, "test")
    print("res", res)
    print("res_ILP", res_ILP)
    # m = np.array([[50, 1, 0.1], [50, 2, 0.3], [50, 2, 0.3], [40, 3, 0.2], [40, 1, 0.2], [30, 1, 0.1]])
    # n = np.array([[50, 1, 0.1], [50, 2, 0.3], [50, 2, 0.3], [40, 3, 0.2], [40, 1, 0.2]])
    # res = getSubtractionFromMatrixs([m,n])
    # print("res",res)

    Writer = "plh"
