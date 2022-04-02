import numpy as np
import copy
import os.path as osp
from tool import getMarixFromCsv, getIds
from combination import getIntersectionFromMatrixs, getUnionFromMatrces
from filter import fileterSingleMatrix_case1
from parameterStatistic import getParameterMatrix, getParameterImportance, sortParameterMatrix, parameterLine
import json
from parameterStatistic import sortParameterMatrix2

def calScore(cluster_matrix):
    s = 0
    for item in cluster_matrix:
        if item[1] == 0:
            print(np.shape(item[0]))
            m, n = np.shape(item[0])
            s += m
    return s


def calSimilarity(m, m1, mi, mu, type=0):
    if type == 4 or type ==5:
        # P1∩P2 / min(P1,P2)
        if m == 0 or m1 == 0:
            return 0
        else:
            return mi / m if mi / m > mi / m1 else mi / m1
    if type == 0 or type ==1 or type ==2 or type ==3:
        # P1∩P2 / P1∪P2
        if mu == 0:
            return 0
        else:
            return mi / mu
    if type ==6:
        return m + m1
    if type ==7:
        return 1/(m+m1)


def combOneCluster(cluster, cluster_matrix, inter_matrix, type=0):
    '''

    :param cluster: [9, 10, 4, 2, 5, 8, 1, 7, 11, 3, 0, 6]
    :param cluster_matrix:[matrix,matrix,...]
    :param inter_matrix:空间换时间 {} key: 9_10
    :return:
    '''
    l = len(cluster)
    s = 0
    m_min = 0
    i_temp = 0
    j_temp = 0
    cluster_matrix_temp = []
    for item in cluster_matrix:
        cluster_matrix_temp.append([item, 0])
    for i in range(l):
        for j in range(l):
            if i >= j:
                continue
            inter_indice = getMatrixRecordIndice([cluster[i], cluster[j]], "")
            if inter_indice in inter_matrix.keys():
                matrix_i = inter_matrix[inter_indice]
            else:
                matrix_i = getIntersectionFromMatrixs([cluster_matrix[i], cluster_matrix[j]])
            cluster_matrix_temp[i][1] = 1
            cluster_matrix_temp[j][1] = 1
            cluster_matrix_temp.append([matrix_i, 0])
            # s_temp = calScore(cluster_matrix_temp)
            m, n = np.shape(cluster_matrix[i])
            m1, n1 = np.shape(cluster_matrix[j])
            union_matrix = getUnionFromMatrces([cluster_matrix[i], cluster_matrix[j]])
            mu, nu = np.shape(union_matrix)
            mi, ni = np.shape(matrix_i)
            s_temp = calSimilarity(m, m1, mi, mu, type)
            m_temp = max(m1, m)
            if s_temp > s:
                s = s_temp
                i_temp = i
                j_temp = j
                m_min = m_temp
            if s_temp == s:
                if m_min > m_temp:
                    i_temp = i
                    j_temp = j
            cluster_matrix_temp[i][1] = 0
            cluster_matrix_temp[j][1] = 0
            cluster_matrix_temp.pop(l)

    i_item = cluster.pop(i_temp)
    j_item = cluster.pop(j_temp - 1)
    # cluster.insert(i_temp,[i_item, j_item])
    cluster.append([i_item, j_item])
    i_matrix = cluster_matrix.pop(i_temp)
    j_matrix = cluster_matrix.pop(j_temp - 1)
    matrix_i_f = getIntersectionFromMatrixs([i_matrix, j_matrix])
    # cluster_matrix.insert(i_temp,matrix_i_f)
    cluster_matrix.append(matrix_i_f)
    return cluster, cluster_matrix, [i_item, j_item], i_item


def clusterImgbyParam(cluster_matrixs, type=0):
    l = len(cluster_matrixs)
    res = {}
    cluster = list(range(l))
    res["0"] = list(range(l))
    inter_matrix = {}
    for i in range(1, l):
        cluster, cluster_matrixs, cluster_item, cluster_item_i = combOneCluster(cluster, cluster_matrixs, inter_matrix,
                                                                                type)
        res[str(i)] = copy.deepcopy(cluster)
        # print("res",res)
        # judgeLocation(res,i,cluster_item,cluster_item_i
    res_c = moveLocation(res, str(l - 1))
    return res_c


def moveElementInList(list, i_p, i_n):
    list_c = copy.deepcopy(list)
    item = list_c.pop(i_p)
    list_c.insert(i_n, item)
    return list_c


def judgeLocationR(res, layer, cluster_item, cluster_item_i):
    '''
    用递归的方式 失败了
    :param res:
    :param layer:
    :param cluster_item:  当前cluster 合并的cluster
    :param cluster_item_i: 当前cluster 合并的cluster的索引
    :return:
    '''
    if layer == 0:
        return
    if isinstance(cluster_item, int):
        cluster_previous = res[str(layer - 1)]
        item_i = cluster_previous.index(cluster_item)
        cluster_previous = moveElementInList(cluster_previous, item_i, cluster_item_i)
        res[str(layer - 1)] = cluster_previous
        judgeLocationR(res, layer - 1, cluster_item, cluster_item_i)
    else:
        item = cluster_item[0]
        item1 = cluster_item[1]
        cluster_previous = res[str(layer - 1)]
        item_i = cluster_previous.index(item)
        item1_i = cluster_previous.index(item1)
        cluster_previous = moveElementInList(cluster_previous, item_i, cluster_item_i)
        cluster_previous = moveElementInList(cluster_previous, item1_i, cluster_item_i + 1)
        res[str(layer - 1)] = cluster_previous
        judgeLocationR(res, layer - 1, item, cluster_item_i)
        judgeLocationR(res, layer - 1, item1, cluster_item_i + 1)


def removeListParenthess(l):
    if isinstance(l, int):
        return l
    else:
        res = []
        for item in l:
            temp = removeListParenthess(item)
            if isinstance(temp, int):
                res.append(temp)
            else:
                res.extend(removeListParenthess(item))
        return res


def differenceL(l1, l2):
    '''求l1-l2 集合'''
    d = []
    for i, item in enumerate(l1):
        if item not in l2:
            d.append(item)
    return d


def judgeLocationLayer(cluster, cluster_f_s):
    # print("cluster",cluster)
    # print("cluster_f_s",cluster)
    difference1 = differenceL(cluster_f_s, cluster)
    difference2 = differenceL(cluster, cluster_f_s)
    # print(difference1)
    print("difference2", difference2)
    if len(difference1) == 0:
        return cluster_f_s
    else:
        T = []
        for item in difference2:
            d2 = removeListParenthess(item)
            T.append([cluster_f_s.index(d2[0]), cluster_f_s.index(d2[0]) + len(d2) - 1, item])
        T.sort(key=lambda x: x[0], reverse=False)
        res = []
        k = 0
        for i, item in enumerate(cluster_f_s):
            if i == T[k][0]:
                res.append(T[k][2])
            elif i > T[k][0] and i < T[k][1]:
                pass
            elif i == T[k][1]:
                k = k + 1
                if k == len(T):
                    k = k - 1  # 控制边界不要超了
            else:
                res.append(cluster_f_s[i])
    return res


def moveLocation(res, layer):
    # 先得到最后的排序结果
    res_c = copy.deepcopy(res)
    cluster_f = res_c[layer]
    cluster_f_s = removeListParenthess(cluster_f)
    for key in res_c.keys():
        cluster = res_c[key]
        cluster = judgeLocationLayer(cluster, cluster_f_s)
        res_c[key] = cluster
    return res_c


def calFirstLayer(num_info, length):
    sum = 0
    res = []
    for item in num_info:
        sum += item
    for item in num_info:
        res.append((item / sum) * length)
    return res


def calSum(l, n):
    '''

    :param l: []
    :param n:
    :return:
    '''
    sum = 0
    for i in range(n):
        sum += l[i]
    return sum


def getMatrixRecord(matrixs_d):
    # 深拷贝一下
    matrixs_record = {}
    for key in matrixs_d.keys():
        matrixs_record[str(key)] = copy.deepcopy(matrixs_d[key])
    return matrixs_record


def getMatrixRecordIndice(cluster, s):
    if isinstance(cluster, int):
        return str(cluster)
    for item in cluster:
        if isinstance(item, list):
            temp = getMatrixRecordIndice(item, "")
            s += "_"
            s += str(temp)
        else:
            if s == "":
                s += str(item)
            else:
                s += "_"
                s += str(item)
    return s


def getMatrixInfobyCla(cluster, cla):
    '''

    :param cluster:[[0, 0, 0, 131.79949943744114, 500.0], [1, 131.79949943744114, 0, 159.69782553787513, 500.0], ...] 某一层的结果
    :param item: 矩形的类别
    :return:该item类别的所有信息
    '''
    for i, item in enumerate(cluster):
        if item[0] == cla:
            return item, i
    return None, None


def calGreedyMatrix1(m, greedy_cluster_res, w, h, direction):
    '''
    :param m
    :param h:
    :param w:
    :param greedy_cluster_res:
    for exmaple:
    {'0': [3, 1, 0, 6, 4, 2, 5],
    '1': [3, 1, [0, 6], 4, 2, 5],
    '2': [3, [1, [0, 6]], 4, 2, 5],
    '3': [[3, [1, [0, 6]]], 4, 2, 5],
    '4': [[3, [1, [0, 6]]], 4, [2, 5]],
    '5': [[3, [1, [0, 6]]], [4, [2, 5]]],
    '6': [[[3, [1, [0, 6]]], [4, [2, 5]]]]}
    :param direction:
    :return:
    '''
    layer = len(greedy_cluster_res.keys())
    avg_l = 0  # avg_w / avg_h
    l1 = 0  # w/h
    if direction == "vertical":
        avg_l = h / layer
        l1 = w
    else:
        avg_l = w / layer
        l1 = h
    # matrixs record
    matrixs_record = getMatrixRecord(m)
    # [matrix,matrix1,...] => {"0":matrix,"1":matrix1,...}
    res = []  # [[],[]...] 最后结果的存储
    num_d = {}  # 每个matrix的n的记录
    for i in range(layer):
        print("i", i)
        cluster = greedy_cluster_res[str(i)]
        # i == 0 的时候特殊情况
        if i == 0:
            num_info = []
            for item in cluster:
                matrix = matrixs_record[str(item)]
                m, n = np.shape(matrix)
                num_d[str(item)] = m
                num_info.append(m)
            l_info = calFirstLayer(num_info, l1)
            cluster_temp = []
            for j, item in enumerate(l_info):
                if direction == "vertical":
                    x = calSum(l_info, j)
                    y = 0
                    h = avg_l
                    w = item
                    cluster_temp.append([cluster[j], x, y, w, h])  # 编号 x y w h
                else:
                    x = 0
                    y = calSum(l_info, j)
                    h = item
                    w = avg_l
                    cluster_temp.append([cluster[j], x, y, w, h])

            res.append(cluster_temp)
            print("0", res[0])
        else:
            cluster_temp = []
            cluster_temp_previous = res[i - 1]
            cluster_previous = greedy_cluster_res[str(i - 1)]
            for j, item in enumerate(cluster):
                if isinstance(item, list):
                    item_indices = getMatrixRecordIndice(item, "")
                    if item_indices in matrixs_record.keys():
                        matrix = matrixs_record[item_indices]
                    else:
                        matrix = getIntersectionFromMatrixs([matrixs_record[getMatrixRecordIndice(item[0], "")],
                                                             matrixs_record[getMatrixRecordIndice(item[1], "")]])
                        matrixs_record[item_indices] = matrix
                        num_d[item_indices] = np.shape(matrix)[0]
                    m, n = np.shape(matrix)
                    if item in cluster_previous:
                        # 表明item不是合并项 如果是vertical则移动y即可
                        item0_s = removeListParenthess(item)
                        if isinstance(item0_s, int):
                            item0_s = [int(item0_s)]
                        for temp in item0_s:
                            obj, obj_i = getMatrixInfobyCla(cluster_temp_previous, temp)
                            if direction == "vertical":
                                cluster_temp.append([obj[0], obj[1],
                                                     obj[2] + avg_l, obj[3],
                                                     obj[4]])
                            else:
                                cluster_temp.append([obj[0], obj[1] + avg_l,
                                                     obj[2], obj[3],
                                                     obj[4]])
                    else:
                        if direction == "vertical":
                            #
                            item0_s = removeListParenthess(item[0])
                            item1_s = removeListParenthess(item[1])
                            if isinstance(item0_s, int):
                                item0_s = [int(item0_s)]
                            if isinstance(item1_s, int):
                                item1_s = [int(item1_s)]
                            for temp in item0_s:
                                obj, obj_i = getMatrixInfobyCla(cluster_temp_previous, temp)
                                w = (m / num_d[getMatrixRecordIndice(item[0], "")]) * obj[3]
                                # w = (m / num_d[getMatrixRecordIndice(item[0], "")]) * obj[3] * 2
                                h = avg_l
                                x = obj[1] + (1 - m / num_d[getMatrixRecordIndice(item[0], "")]) * \
                                    obj[3]
                                y = avg_l * i
                                cluster_temp.append([temp, x, y, w, h])
                            for temp in item1_s:
                                obj, obj_i = getMatrixInfobyCla(cluster_temp_previous, temp)
                                w = (m / num_d[getMatrixRecordIndice(item[1], "")]) * obj[3]
                                # w = (m / num_d[getMatrixRecordIndice(item[0], "")]) * obj[3] * 2
                                h = avg_l
                                x = obj[1] + (1 - m / num_d[getMatrixRecordIndice(item[1], "")]) * \
                                    obj[3]
                                y = avg_l * i
                                cluster_temp.append([temp, x, y, w, h])
                        else:
                            item0_s = getMatrixRecordIndice(item[0])
                            item1_s = getMatrixRecordIndice(item[1])
                            for temp in item0_s:
                                obj, obj_i = getMatrixInfobyCla(cluster_temp_previous, temp)
                                w = avg_l
                                h = (m / num_d[getMatrixRecordIndice(item[0], "")]) * obj[4]
                                x = avg_l * i
                                y = obj[2] + (1 - m / num_d[getMatrixRecordIndice(item[0], "")]) * \
                                    obj[4]
                                cluster_temp.append([temp, x, y, w, h])
                            for temp in item1_s:
                                obj, obj_i = getMatrixInfobyCla(cluster_temp_previous, temp)
                                w = avg_l
                                h = (m / num_d[getMatrixRecordIndice(item[0], "")]) * obj[4]
                                x = avg_l * i
                                y = obj[2] + (1 - m / num_d[getMatrixRecordIndice(item[0], "")]) * \
                                    obj[4]
                                cluster_temp.append([temp, x, y, w, h])
                else:
                    # 如果是int 绝对是没合并的
                    obj, obj_i = getMatrixInfobyCla(cluster_temp_previous, item)
                    if direction == "vertical":
                        cluster_temp.append([obj[0], obj[1],
                                             obj[2] + avg_l, obj[3],
                                             obj[4]])
                    else:
                        cluster_temp.append([obj[0], obj[1] + avg_l,
                                             obj[2], obj[3],
                                             obj[4]])
            print("res", res)
            res.append(cluster_temp)

            # res = adjustLocation(res)
    return res


def indiceChange(res, img_names, img2Id):
    # 把每个图片对应的索引固定,对聚类的结果进行转换
    res_new = {}
    for key in res.keys():
        res_new[key] = traverseRes(res[key], img_names, img2Id)
    return res_new


def traverseRes(res, img_names, img2Id):
    '''

    :param res:
    :param img_names: ["xxx.bmp","xxx.bmp"]
    :param img2Id: {"xxx.bmp":0,...}
    :return:
    '''
    res_new = []
    for item in res:
        if isinstance(item, list):
            res_new.append(traverseRes(item, img_names, img2Id))
        else:
            res_new.append(img2Id[img_names[item]])
    return res_new


def reBracketList(l):
    '''
    去掉list中的所有括号
    :param l:
    :return:
    '''
    new_l = []
    for item in l:
        if isinstance(item, list):
            new_l.extend(reBracketList(item))
        else:
            new_l.append(item)
    return new_l


def formatChangeCombine(matrices, combine_res):
    '''
    view2 default combien 的结果 进行专函
    :param matrices:
    :param combine_res:
    :return:
    '''
    res = {}
    for key in combine_res.keys():
        combine = combine_res[key]
        new_combine = []

        for item in combine:
            new_item = []
            if isinstance(item, list):
                item_re = reBracketList(item)
                matricrs_temp = []
                for indice in item_re:
                    matricrs_temp.append(matrices[indice])
                inter_matirx = getIntersectionFromMatrixs(matricrs_temp)
                new_item.append(item)
                new_item.append(np.shape(inter_matirx)[0])
            else:
                new_item.append([item, np.shape(matrices[item])[0]])
            new_combine.append(new_item)
        res[key] = new_combine
    return res

def getInfoAfterCombine(matrices, combine):
    '''
    根据某种合并顺序，返回一些合并后产生的新数据
    1.格式调整后的合并顺序
    2.所有参数集合的id
    3.对应参数集合
    :param matrices:
    :param combine:
    :return:
    '''
    res = {}
    # 得到每个river interval 的索引
    num = len(combine.keys())
    # 初始化
    re_combine = []
    ids = []
    for item in combine["0"]:
        ids.append([item])
    for i in range(num):
        if i == num - 1:
            break
        indices, element = getCombineIndices(combine[str(i)], combine[str(i + 1)])
        id = reBracketList(combine[str(i + 1)][indices[0]])
        ids.append(id)
        re_combine.append([indices, element])  # 返回索引和数据
    intersection_matrices = {}
    for id in ids:
        matrices_temp = []
        for item in id:
            matrices_temp.append(matrices[item])
        intersection_matrix = getIntersectionFromMatrixs(matrices_temp)
        key = getIds(id)
        intersection_matrices[key] = intersection_matrix.tolist()

    res["re_combine"] = re_combine
    res["ids"] = ids
    res["intersection"] = intersection_matrices

    return res

def getPixelImg2(matrices, order=None):
    '''
    相对求并集后的索引
    :param matrices:
    :param parameter_info:
    :param order:
    :return:
    '''
    # 先求个并集
    matrices_l = []
    for key in matrices.keys():
        matrices_l.append(np.array(matrices[key]))
    matrix_union = getUnionFromMatrces(matrices_l)

    if order is not None:
        sortParameterMatrix2(matrix_union, order)
    indices_d = {}
    indices_d["total"] = np.shape(matrix_union)[0]
    # 遍历
    for key in matrices.keys():
        indices = getParameterSetsIndex2(matrices[key], matrix_union)
        indices_d[key] = [len(indices), indices]
    return indices_d

def getParameterSetsIndex2(matrix, matrix_union):
    '''
    获得matrix每一行在matrix_union的索引
    :param matrix:
    :param matrix_union:
    :return:
    '''
    matrix_np = np.array(matrix)
    matrix_union_np = np.array(matrix_union)
    if np.size(matrix_np) == 0:
        return []
    m, n = np.shape(matrix_np)
    indices = []
    for i in range(m):
        temp = []
        for j in range(n):
            if j == 0:
                temp = np.where(matrix_union_np[:, j] == matrix_np[i, j])[0]
            else:
                temp2 = np.where(matrix_union_np[:, j] == matrix_np[i, j])[0]
                temp = list(set(temp).intersection(set(temp2)))
                if len(temp) == 1:
                    break
        indices.append(int(temp[0]))
    return indices

def getPixelRiver(matrices, combine, cfg):
    res = {}
    # 得到每个river interval 的索引
    num = len(combine.keys())
    # 初始化
    indices, element = getCombineIndices(combine["0"], combine["1"])
    # 挑小的

    m1, _ = np.shape(matrices[element[0]])
    m2, _ = np.shape(matrices[element[1]])
    combine_element = element[0]
    if m2 < m1:
        combine_element = element[1]
    river_ids = {}
    for i in range(num):
        if i == num - 1:
            river_ids[i] = combine[str(i)]
        else:
            interval = []
            if i != 0:
                indices, element = getCombineIndices(combine[str(i)], combine[str(i + 1)])
            for j, item in enumerate(combine[str(i)]):
                if j != indices[0] and j != indices[1]:
                    interval.append([item, combine_element])
                else:
                    interval.append([item])
            combine_element = combine[str(i + 1)][indices[0]]
            river_ids[i] = interval
    res["river_ids"] = river_ids
    parameter_matrices = {}
    # 得到每个索引对应参数集合的parameter matrices
    for key in river_ids.keys():
        interval_parameter_matrices = []
        for item in river_ids[key]:
            # 得到每一个interval 对应的 parameter matrices
            item_l = reBracketList(item)
            matrices_temp = []
            for new_item in item_l:
                matrices_temp.append(matrices[new_item])
            intersection_matrix = getIntersectionFromMatrixs(matrices_temp)
            interval_parameter_matrices.append(getParameterMatrix(intersection_matrix, cfg))
        parameter_matrices[key] = interval_parameter_matrices
    res["parameter_matrices"] = parameter_matrices

    # 得到直线部分的数据
    # 重新遍历一遍好了，不用修改前面的代码
    # 首先得到要计算的对象的id
    combine_layer = getcombineInfo(combine)
    line_res = {}
    parameter_combine_num = {}
    for combine_item in combine_layer:
        line_temp = {}
        matrices_temp = []
        new_id = getIds(combine_item)
        for id in combine_item:
            matrices_temp.append(matrices[id])
        intersection_matrix = getIntersectionFromMatrixs(matrices_temp)
        parameter_combine_num[new_id] = np.shape(intersection_matrix)[0]
        parameter_matrix = getParameterMatrix(intersection_matrix, cfg)
        order, ppp = getParameterImportance(np.array(parameter_matrix))
        sortParameterMatrix(intersection_matrix, order)
        line_temp["sort_parameter"] = intersection_matrix.tolist()
        if new_id == "2_6_9_12_13_16":
            print(intersection_matrix)
        line_temp["line"] = parameterLine(intersection_matrix)
        line_temp["order"] = order.tolist()
        line_res[new_id] = line_temp

    res["line_res"] = line_res
    res["parameter_combine_num"] = parameter_combine_num
    return res


def getCombineIndices(l1, l2):
    '''

    :param l1: [
            2,
            6,
            9,
            13,
            16
        ]
    :param l2: [
            2,
            6,
            9,
            [
                13,
                16
            ]
        ]
    :return:
    返回l1中要合并对象的索引和数据
    '''
    for i, item in enumerate(l1):
        if item != l2[i]:
            return [i, i + 1], [item, l1[i + 1]]

def getcombineInfo(combine):
    '''
    得到每次合并后的参数集合的参数
    :param combine:
    :return:
    '''
    num = len(combine.keys())
    res = []
    for i in range(num - 1):
        for k, item in enumerate(combine[str(i)]):
            if item != combine[str(i + 1)][k]:
                id_l = reBracketList(combine[str(i + 1)][k])
                id_l.sort()
                res.append(id_l)
                break
    return res

def test1():
    # "Image_20210812150340363.bmp",
    # "Image_20210812150343338.bmp",
    # "Image_20210812150345651.bmp",
    # "Image_20210812150348106.bmp",
    # "Image_20210812150439515.bmp",
    # "Image_20210812150442099.bmp",
    # "Image_20210812150446018.bmp",
    # "Image_20210812150449667.bmp",
    # "Image_20210812150507378.bmp",
    # "Image_20210812150735634.bmp",
    # "Image_20210812150738139.bmp",
    # "Image_20210812150742075.bmp",
    # "Image_20210812150745340.bmp",
    # "Image_20210812150748010.bmp",
    # "Image_20210812150752110.bmp",
    # "Image_20210812150754923.bmp",
    # "Image_20210812150757138.bmp",
    # "Image_20210812150800770.bmp",
    # "Image_20210812150954922.bmp",
    # "Image_20210812151017347.bmp",
    # "Image_20210812151053418.bmp",
    # "Image_20210812151121185.bmp",
    img_names = [
        "Image_20210812150340363.bmp",
        "Image_20210812150343338.bmp",
        "Image_20210812150345651.bmp",
        "Image_20210812150348106.bmp",
        "Image_20210812150439515.bmp",
        "Image_20210812150507378.bmp",
        "Image_20210812150735634.bmp",
        "Image_20210812150738139.bmp",
        "Image_20210812150742075.bmp",
    ]
    filter_config = {
        "minValue": 24000,
        "maxValue": 25000
    }
    img_indices_json_file = "D:\codeTest\parameterExp\data\case1\combination\img_indices.json"
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)

    cluster_matrixs = []
    for img_name in img_names:
        img_file = osp.join("D:/codeTest/parameterExp/data/case1", "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = fileterSingleMatrix_case1(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        cluster_matrixs.append(matrix)

    cluster = clusterImgbyParam(cluster_matrixs)
    cluster_new = indiceChange(cluster, img_names=img_names, img2Id=img_indices)
    print("cluster", cluster)
    print("cluster_new", cluster_new)


def test2():
    res = {'0': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
           '1': [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, [0, 6]],
           '2': [2, 3, 4, 5, 8, 9, 10, 11, [0, 6], [1, 7]],
           '3': [2, 4, 5, 8, 9, 10, 11, [1, 7], [3, [0, 6]]],
           '4': [2, 4, 5, 9, 10, 11, [3, [0, 6]], [8, [1, 7]]],
           '5': [4, 9, 10, 11, [3, [0, 6]], [8, [1, 7]], [2, 5]],
           '6': [4, 9, 10, [8, [1, 7]], [2, 5], [11, [3, [0, 6]]]],
           '7': [9, 10, [8, [1, 7]], [11, [3, [0, 6]]], [4, [2, 5]]],
           '8': [9, [8, [1, 7]], [11, [3, [0, 6]]], [10, [4, [2, 5]]]],
           '9': [[8, [1, 7]], [11, [3, [0, 6]]], [9, [10, [4, [2, 5]]]]],
           '10': [[9, [10, [4, [2, 5]]]], [[8, [1, 7]], [11, [3, [0, 6]]]]],
           '11': [[[9, [10, [4, [2, 5]]]], [[8, [1, 7]], [11, [3, [0, 6]]]]]]}

    layer_s = "11"
    res_c = moveLocation(res, layer_s)
    print(res_c)


def test3():
    cluter = [0, 1, 2, 3, [4, 6], 5]
    cluter_f_s = [0, 4, 6, 1, 5, 3, 2]
    res = judgeLocationLayer(cluter, cluter_f_s)
    print("res", res)


def test4():
    img_names = [
        "Image_20210812150340363.bmp",
        "Image_20210812150343338.bmp",
        "Image_20210812150345651.bmp",
        "Image_20210812150348106.bmp",
        "Image_20210812150439515.bmp",
        "Image_20210812150442099.bmp",
        "Image_20210812150446018.bmp",
        "Image_20210812150449667.bmp",
        "Image_20210812150507378.bmp",
        "Image_20210812150735634.bmp",
        "Image_20210812150738139.bmp",
        "Image_20210812150742075.bmp",
    ]
    filter_config = {
        "minValue": 18000,
        "maxValue": 25000
    }

    cluster_matrixs = {}

    img_indices_json_file = "D:\codeTest\parameterExp\data\case1\combination\img_indices.json"
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)

    for img_name in img_names:
        img_file = osp.join("D:/codeTest/parameterExp/data/case1", "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = fileterSingleMatrix_case1(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        cluster_matrixs[img_indices[img_name]] = matrix
    # cluster = clusterImgbyParam(cluster_matrixs)
    greedy_cluster_res = {'0': [9, 10, 4, 2, 5, 8, 1, 7, 11, 3, 0, 6],
                          '1': [9, 10, 4, 2, 5, 8, 1, 7, 11, 3, [0, 6]],
                          '2': [9, 10, 4, 2, 5, 8, 1, 7, 11, 3, [0, 6]],
                          '3': [9, 10, 4, 2, 5, 8, [1, 7], 11, [3, [0, 6]]],
                          '4': [9, 10, 4, 2, 5, 8, 1, 7, 11, [3, [0, 6]]],
                          '5': [9, 10, 4, 2, 5, 8, 1, 7, 11, [3, [0, 6]]],
                          '6': [9, 10, 4, 2, 5, [8, [1, 7]]],
                          '7': [9, 10, 4, 2, 5, [8, [1, 7]]],
                          '8': [9, 10, 4, 2, 5, [8, [1, 7]]],
                          '9': [9, 10, 4, 2, 5, [8, [1, 7]]],
                          '10': [[9, [10, [4, [2, 5]]]], [[8, [1, 7]], [11, [3, [0, 6]]]]],
                          '11': [[[9, [10, [4, [2, 5]]]], [[8, [1, 7]], [11, [3, [0, 6]]]]]]}
    res = calGreedyMatrix1(cluster_matrixs, greedy_cluster_res, 1000, 1000, "vertical")
    print("res", res)


if __name__ == "__main__":
    test1()
    # test2()
    # test3()
    # test4()
    input()

    # img_names = []
    # clusterImgbyParam(img_names)

    # cluster = [1,[2,[3,4]]]
    # s = ""
    # res = getMatrixRecordIndice(cluster,s)
    # print("res",res)

    # "res": {
    #     "0": [
    #         0,
    #         1,
    #         2,
    #         3,
    #         4,
    #         5,
    #         6
    #     ],
    #     "1": [
    #         2,
    #         3,
    #         4,
    #         5,
    #         6,
    #         [
    #             0,
    #             1
    #         ]
    #     ],
    #     "2": [
    #         4,
    #         5,
    #         6,
    #         [
    #             0,
    #             1
    #         ],
    #         [
    #             2,
    #             3
    #         ]
    #     ],
    #     "3": [
    #         6,
    #         [
    #             0,
    #             1
    #         ],
    #         [
    #             2,
    #             3
    #         ],
    #         [
    #             4,
    #             5
    #         ]
    #     ],
    #     "4": [
    #         [
    #             2,
    #             3
    #         ],
    #         [
    #             4,
    #             5
    #         ],
    #         [
    #             6,
    #             [
    #                 0,
    #                 1
    #             ]
    #         ]
    #     ],
    #     "5": [
    #         [
    #             6,
    #             [
    #                 0,
    #                 1
    #             ]
    #         ],
    #         [
    #             [
    #                 2,
    #                 3
    #             ],
    #             [
    #                 4,
    #                 5
    #             ]
    #         ]
    #     ],
    #     "6": [
    #         [
    #             [
    #                 6,
    #                 [
    #                     0,
    #                     1
    #                 ]
    #             ],
    #             [
    #                 [
    #                     2,
    #                     3
    #                 ],
    #                 [
    #                     4,
    #                     5
    #                 ]
    #             ]
    #         ]
    #     ]
    # }
