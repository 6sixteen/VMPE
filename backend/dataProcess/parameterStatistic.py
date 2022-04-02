'''
Description:
Writer = "plh"
Data:2021/10/20
'''
import numpy as np
import math
import copy
from combination import combineD, combineN, getIntersectionFromMatrixs, getUnionFromMatrces
from tool import getIds


def getParameterStep(caseConfig):
    '''
    得到参数取值的情况
    :param caseConfig:
    :return:
    res：{
    0：[20,21,22,...40],
    1: [40,41,...60]
    }
    #参数0 取值
    #参数1 取值
    '''
    parameterConfig = caseConfig["parameterConfig"]
    res = {}
    j = 0
    for key in parameterConfig.keys():
        p = parameterConfig[key]
        if p["use"] == True:
            if p["type"] == "int":
                p_range = list(range(p["minValue"], p["maxValue"] + 1, p["step"]))
            elif p["type"] == "float":
                factor = 1 / p["step"]
                p_range_temp = list(
                    range(int(p["minValue"] * factor), int(p["maxValue"] * factor) + 1, int(p["step"] * factor)))
                p_range = [i / factor for i in p_range_temp]
            res[j] = p_range
            j += 1
    return res


def getParameterMatrix(matrix, caseConfig):
    parameterConfig = caseConfig["parameterConfig"]
    res = []
    i = 0
    for key in parameterConfig.keys():
        res_p = []
        p = parameterConfig[key]
        if p["type"] == "int" and p["use"]:
            p_range = list(range(p["minValue"], p["maxValue"] + 1, p["step"]))
        elif p["type"] == "float" and p["use"]:
            factor = 1 / p["step"]
            p_range_temp = list(
                range(int(p["minValue"] * factor), int(p["maxValue"] * factor) + 1, int(p["step"] * factor)))
            p_range = [i / factor for i in p_range_temp]
        else:
            # print("parameter type error")
            pass

        if p["use"]:
            for item in p_range:
                if np.size(matrix) == 0:
                    res_p.append([item, 0, 0])
                else:
                    m, n = np.shape(matrix)
                    res_p.append(
                        [item, len(np.where(matrix[:, i] == item)[0]) / m, len(np.where(matrix[:, i] == item)[0])])

            i += 1
            res.append(res_p)
    return res


def getParameterMatrixComprison(matrix, matrix1, caseConfig):
    res_m = getParameterMatrix(matrix, caseConfig)
    res_m1 = getParameterMatrix(matrix1, caseConfig)
    res_compare = []
    for i, item in enumerate(res_m):
        res_compare_child = []
        for j, item1 in enumerate(item):
            res_compare_child.append([item1[0], item1[1] - res_m1[i][j][1]])
        res_compare.append(res_compare_child)
    return res_compare


def getParameterView3Origin(matrices_dict, parameterStep):
    '''

    :param matrices_dict:
    :param parameterStep:
    :return:
    res:{
    "0"(代表参数集合,图片):{
    "0"(代表参数0):
    {
    "20"(代表取值):[411,520,162,123...](代表相应取值个数)
    。。。
    }
    。。。
    }
    "1":
    }
    '''
    res_total = {}
    for key in matrices_dict.keys():
        matrix = np.array(matrices_dict[key])
        if matrix.size == 0:
            res_total[key] = 0
        else:
            m, n = np.shape(matrix)
            res_imgs = {}
            for key2 in parameterStep.keys():
                if key2 + 1 == n:
                    break
                else:
                    parameterRange = parameterStep[key2]
                    parameterRange_next = parameterStep[key2 + 1]
                    res_parameter = {}
                    for item in parameterRange:
                        # print(item)
                        # print(type(item))
                        # print(key2)
                        # print(type(key2))
                        # print("matrix", matrix)
                        # print(type(matrix))
                        # print(np.where(matrix[:,key2]==item))
                        data = matrix[np.where(matrix[:, key2] == item)[0], :]
                        res_parameter_range = []
                        for item2 in parameterRange_next:
                            res_parameter_range.append(len(np.where(data[:, key2 + 1] == item2)[0]))
                        res_parameter[item] = res_parameter_range
                res_imgs[int(key2)] = res_parameter
            res_total[key] = res_imgs
    return res_total


def getParameterView3Cluster(view3dataOrigin, parameterStep, p):
    '''

    :param view3dataOrigin:
    :param p:
    :return:
    '''
    data0 = view3dataOrigin["0"]
    data1 = view3dataOrigin["1"]
    # 遍历一遍 计算相邻矩形的相似度
    p_dis_all = {}
    for p_indice in data0:
        p_object0 = data0[p_indice]
        p_object1 = data1[p_indice]
        p_range = parameterStep[p_indice]
        p_diff = round(p_range[1] - p_range[0], 2)
        p_dis = []
        for i, p_value in enumerate(p_range):
            if i == len(p_range) - 1:
                break
            else:
                p_line0_f = copy.deepcopy(p_object0[p_value])
                p_line1_f = copy.deepcopy(p_object1[p_value])
                p_line0_f.extend(p_line1_f)
                p_line0_n = copy.deepcopy(p_object0[int((p_value + p_diff) * 100) / 100])
                p_line1_n = copy.deepcopy(p_object1[int((p_value + p_diff) * 100) / 100])
                p_line0_n.extend(p_line1_n)
                p_dis.append(calEuclidDis(p_line0_f, p_line0_n))
        p_dis_unique = list(set(p_dis))
        p_dis_unique.sort()
        num = len(p_dis_unique)
        slide = int(num * p)
        threshold = p_dis_unique[slide]
        p_dis_all[p_indice] = {
            "p_dis": p_dis,
            "threshold": threshold
        }

    print("p_dis_all", p_dis_all)
    # 获得合并后的数据
    res = {}
    for p_indice in p_dis_all:
        p_value = parameterStep[p_indice]  # 参数取值
        cluster = []
        data = []
        temp = [p_value[0]]
        data_temp = {"baseline0": data0[p_indice][p_value[0]], "baseline1": data0[p_indice][p_value[0]],
                     "line0other": [], "line1other": []}
        # 合并的数据先单纯地存放在一起吧
        for i, dis in enumerate(p_dis_all[p_indice]["p_dis"]):
            if dis <= p_dis_all[p_indice]["threshold"]:
                temp.append(p_value[i + 1])
                data_temp["line0other"].append(data0[p_indice][p_value[i + 1]])
                data_temp["line1other"].append(data1[p_indice][p_value[i + 1]])
                if i == len(p_dis_all[p_indice]["p_dis"]) - 1:
                    cluster.append(temp)
                    data.append(data_temp)
            else:
                cluster.append(temp)
                data.append(data_temp)
                temp = []
                temp.append(p_value[i + 1])
                data_temp = {}
                data_temp["baseline0"] = data0[p_indice][p_value[i + 1]]
                data_temp["baseline1"] = data1[p_indice][p_value[i + 1]]
                data_temp["line0other"] = []
                data_temp["line1other"] = []
                if i == (len(p_dis_all[p_indice]["p_dis"]) - 1):
                    cluster.append(temp)
                    data.append(data_temp)
        res[p_indice] = {
            "cluster": cluster,
            "data": data
        }
        print("res", res)
    return res


def changeParameterOrder(matrices_dict, parameterStep, order):
    '''

    :param matrices_dict: {"":参数集合}
    :param parameterStep:
    {
    0：[20,21,22,...40],
    1: [40,41,...60]
    }
    //0 1 2 对应的是当前顺序
    :param order: [1,0,2,3]
    :return:
    '''

    # 做映射把 order 和 matrices_dict、parameterStep 关联起来
    order_temp = []
    for item1 in order:
        k = len(order) - 1
        for item2 in order:
            if item2 > item1:
                k -= 1
        order_temp.append(k)
    order = order_temp

    matrices_dict_res = {}
    parameterStep_res = {}
    for key in matrices_dict:
        matrix_list = matrices_dict[key]
        matrix_np = np.array(matrix_list)
        m, n = np.shape(matrix_np)  # 没有考虑空数组的情况
        matrix_copy = np.zeros((m, n))
        print(np.shape(matrix_copy))
        for i, item in enumerate(order):
            matrix_copy[:, i] = matrix_np[:, item]
        matrices_dict_res[key] = matrix_copy.tolist()
    for i, item in enumerate(order):
        parameterStep_res[i] = parameterStep[item]

    # print("matrices_dict_res", matrices_dict_res)
    # print("parameterStep_res", parameterStep_res)
    return matrices_dict_res, parameterStep_res


def calEuclidDis(a, b):
    '''
    计算欧几里得距离
    :param a:list 
    :param b:list
    :return: 
    
    '''
    res = 0
    for i, item in enumerate(a):
        res = res + (a[i] - b[i]) * (a[i] - b[i])
    return math.sqrt(res)


def sortParameterMatrix(parameter_matrix):
    '''
    根据参数统计集合中每一列的方差作为参数重要程度的指标
    :param parameter_matrix:
    :return:
    '''
    variance = []
    temp_total = []
    for col_data in parameter_matrix:
        temp = []
        for value_data in col_data:
            temp.append(value_data[2])
        temp_total.append(temp)
        variance.append(np.var(np.array(temp)))
    importance_order = np.argsort(-np.array(variance))
    return importance_order, temp_total


def sortParameterMatrix(parameter_matrix, order):
    m, n = np.shape(parameter_matrix)
    quickSort(parameter_matrix, 0, m - 1, order)


def getIntersectionLocation(matrix1, matrix2):
    # 确保matrix1 是较大的
    if np.shape(matrix1)[0] < np.shape(matrix2)[0]:
        temp = matrix1
        matrix1 = matrix2
        matrix2 = temp
    pos = getIntersectionLocationFromMatrices(matrix1, matrix2)
    return pos, matrix1[pos]


def getIntersectionLocationFromMatrices(matrix1, matrix2):
    '''
    得到多个矩阵的交集
    :param matrixs: [np,np,...]
    :return:
    matrix: 交集np
    '''
    if matrix2.size == 0:
        return np.empty()
    res = (matrix1[:, None] == matrix2).all(-1).any(-1)
    pos = np.where(res == True)
    return pos[0]


def quickSort(parameter_matrix, left, right, order):
    if right <= left:
        return
    i = left
    j = right + 1
    key = copy.deepcopy(parameter_matrix[left])
    while True:
        i = i + 1
        while compare_d(parameter_matrix[i], key, order):
            if i == right:
                break
            i = i + 1
        j = j - 1
        while not compare_d(parameter_matrix[j], key, order):
            if j == left:
                break
            j = j - 1
        if i >= j:
            break
        temp = parameter_matrix[i]
        parameter_matrix[i] = parameter_matrix[j]
        parameter_matrix[j] = temp

    parameter_matrix[left] = parameter_matrix[j]
    parameter_matrix[j] = key

    quickSort(parameter_matrix, left, j - 1, order)
    quickSort(parameter_matrix, j + 1, right, order)


def sortParameterMatrix2(parameter_matrix, order):
    '''尝试的第二个快排'''
    m, n = np.shape(parameter_matrix)
    quickSort2(parameter_matrix,0,m-1,order)


def quickSort2(matrix,low,high,order):
    if low < high:
        pivot = paritition(matrix, low, high,order)
        quickSort2(matrix, low, pivot - 1,order)
        quickSort2(matrix, pivot + 1, high,order)

def paritition(matrix, low, high, order):
    pivot = copy.deepcopy(matrix[low])
    while low < high:
        while low < high and not compare_d(matrix[high], pivot, order):
            high = high - 1

        matrix[low] = matrix[high]
        while low < high and compare_d(matrix[low], pivot, order):
            low = low + 1
        matrix[high] = matrix[low]
    matrix[low] = pivot
    return low


def compare_d(arr1, arr2, order):
    for i in order:
        if arr1[i] < arr2[i]:
            return True
        elif arr1[i] == arr2[i]:
            pass
        else:
            return False
    return True


def getParameterImportance(parameter_matrix):
    '''
    根据参数统计集合中每一列的方差作为参数重要程度的指标
    :param parameter_matrix:
    :return:
    '''
    variance = []
    temp_total = []
    for col_data in parameter_matrix:
        temp = []
        for value_data in col_data:
            temp.append(value_data[2])
        temp_total.append(temp)
        variance.append(np.var(np.array(temp)))
    importance_order = np.argsort(-np.array(variance))
    return importance_order, temp_total


def getParameterPairsMatrix(matrices):
    keys = list(matrices.keys())
    num = len(keys)
    combines = combineD(keys, range(2, 3))
    res = {}
    for combine in combines:
        temp = []  # （P1∩P2）/P1,（P1∩P2）/P2, P1/P2, （P1∩P2）/（P1UP2） {P1_id:P1,P2_id:P2}(P1<P2)
        id = getIds(list(combine))
        intersection = getIntersectionFromMatrixs([matrices[combine[0]], matrices[combine[1]]])
        if np.shape(matrices[combine[0]])[0] > np.shape(matrices[combine[1]])[0]:
            temp.extend([np.shape(intersection)[0] / np.shape(matrices[combine[1]])[0],
                         np.shape(intersection)[0] / np.shape(matrices[combine[1]])[0],
                         np.shape(matrices[combine[1]])[0] / np.shape(matrices[combine[0]])[0]
                         ])
        else:
            temp.extend([np.shape(intersection)[0] / np.shape(matrices[combine[0]])[0],
                         np.shape(intersection)[0] / np.shape(matrices[combine[0]])[0],
                         np.shape(matrices[combine[0]])[0] / np.shape(matrices[combine[1]])[0]])
        union = getUnionFromMatrces([matrices[combine[0]], matrices[combine[1]]])
        temp.append(np.shape(intersection)[0] / np.shape(union)[0])
        # temp.append({combine[0]:np.shape(matrices[combine[0]]),combine[1]:np.shape(matrices[combine[1]])})
        res[id] = temp
    return res


def parameterLine(matrix):
    """
    对经过排序的参数集合进行画直线表示，获得画直线所需要的数据
    :param matrix: np.array
    :return:
    """
    if isinstance(matrix, list):
        matrix = np.array(matrix)
    if np.size(matrix) == 0:
        return []
    m, n = np.shape(matrix)
    res = []
    for i in range(n):
        row = 0
        element = matrix[row, i]
        col = []
        for j in range(1, m):
            if element != matrix[j, i]:
                col.append([element, row, j - 1])
                row = j
                element = matrix[j, i]
        col.append([element, row, j])
        res.append(col)
    return res


if __name__ == '__main__':
    matrix = np.array([
    [
      20,
      41,
      9,
      0.8
    ],
    [
      20,
      41,
      9,
      0.81
    ],
    [
      20,
      41,
      9,
      0.82
    ],
    [
      20,
      41,
      9,
      0.83
    ],
    [
      20,
      41,
      9,
      0.84
    ],
    [
      20,
      41,
      10,
      0.8
    ],
    [
      20,
      41,
      10,
      0.81
    ],
    [
      20,
      41,
      10,
      0.82
    ],
    [
      20,
      41,
      10,
      0.83
    ],
    [
      20,
      41,
      10,
      0.84
    ],
    [
      20,
      42,
      9,
      0.8
    ]
  ])
    order = [
        2,
        1,
        0,
        3
    ]
    sortParameterMatrix2(matrix, order)
    print(matrix)
    Writer = "plh"
