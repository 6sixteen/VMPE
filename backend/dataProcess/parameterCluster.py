'''
Description:
Writer = "plh"
Data:2021/12/31
'''
import sys
import os

root = os.path.abspath("./")
sys.path.append(os.path.join(root, "dataProcess/graphCluster"))

import numpy as np
from combination import getIntersectionFromMatrixs, getUnionFromMatrces
from mcode_weighted import mcode
from tool import formatChangeGraph3
import json
from matrices import *
from spectralClustering import SpectralClustering
from tool import readTxtPeremeter, formatChangeParameter


def calEdge(p1, p2):
    '''
    单纯为了格式的统一！！
    :param p1: ∪
    :param p2: ∩
    :return:
    '''
    return p2


def calJac(p1, p2):
    '''

    :param p1: ∪
    :param p2: ∩
    :return:
    '''
    if p1 == 0:
        return 0
    return p2 / p1


def calMy(union_matrix, insection_matrix, have_parameter_image_number, parameter_image):
    '''
    :param p1: ∪ 参数集合
    :param p2: ∩ 参数集合
    :return:
    '''
    u = 0.0
    n = 0.0
    for union in union_matrix:
        a = str(union[4])
        str1 = str(union[0]) + '_' + str(union[1]) + '_' + str(union[2]) + '_' + str(union[3]) + '_' + a.split('.')[0]
        u += (float(parameter_image[str1]) / float(have_parameter_image_number))

    for insection in insection_matrix:
        a = str(insection[4])
        str2 = str(insection[0]) + '_' + str(insection[1]) + '_' + str(insection[2]) + '_' + str(insection[3]) + '_' + a.split('.')[0]
        n += (float(parameter_image[str2]) / float(have_parameter_image_number))

    if u == 0:
        return 0
    else:
        return n / u


# def getGraph(parameter_matrices, edge):
#     '''
#     得到参数集合的图结构数据
#     :param parameter_matrices:
#     :return:
#     res [[key, key1, w, key_m, key1_m, union_len, insection_len, insection_matrix],...]
#     key: 图片1序号
#     key2: 图片2序号
#     w：边的权重
#     key_m: 图片1参数集合的数量
#     key1_m: 图片2参数集合的数量
#     union_len: 图片1和图片2参数集合并集的数量
#     insection_len； 图片1和图片2参数集合交集的数量
#     '''
#
#     print(parameter_matrices)
#
#     # 边的数值选择
#     if edge == "jac":
#         claw = calJac
#     if edge == "parameter_number":
#         claw = calEdge
#
#     res = []
#     img_indices = parameter_matrices.keys()
#     com = {}
#     link_num = 0
#     for key in img_indices:
#         for key1 in img_indices:
#             comkey = str(key) + "_" + str(key1)
#             comkey2 = str(key1) + "_" + str(key)
#             if key != key1:
#                 if comkey not in com.keys() and comkey2 not in com.keys():
#                     insection_matrix = getIntersectionFromMatrixs([parameter_matrices[key], parameter_matrices[key1]])
#                     insection_len = len(insection_matrix)
#                     union_matrix = getUnionFromMatrces([parameter_matrices[key], parameter_matrices[key1]])
#                     union_len = len(union_matrix)
#                     key_m = np.shape(parameter_matrices[key])[0]
#                     key1_m = np.shape(parameter_matrices[key1])[0]
#                     w = claw(union_len, insection_len)
#                     res.append([key, key1, w, key_m, key1_m, union_len, insection_len, insection_matrix])
#
#                     com[comkey] = link_num
#                     link_num += 1
#                 if comkey in com.keys() and comkey2 not in com.keys():  # 为了减少计算
#                     temp = res[com[comkey]]
#                     res.append([temp[1], temp[0], temp[2], temp[4], temp[3], temp[5], temp[6], temp[7]])
#                     com[comkey2] = link_num
#                     link_num += 1
#
#                 if comkey not in com.keys() and comkey2 in com.keys():  # 为了减少计算
#                     temp = res[com[comkey2]]
#                     res.append([temp[1], temp[0], temp[2], temp[4], temp[3], temp[5], temp[6], temp[7]])
#                     com[comkey] = link_num
#                     link_num += 1
#     return res



def getGraph(parameter_matrices, edge, have_parameter_image_number, filename11):
    '''
    得到参数集合的图结构数据
    :param parameter_matrices:
    :return:
    res [[key, key1, w, key_m, key1_m, union_len, insection_len, insection_matrix],...]
    key: 图片1序号
    key2: 图片2序号
    w：边的权重
    key_m: 图片1参数集合的数量
    key1_m: 图片2参数集合的数量
    union_len: 图片1和图片2参数集合并集的数量
    insection_len； 图片1和图片2参数集合交集的数量
    '''

    # print(parameter_matrices)

    # 边的数值选择
    if edge == "jac":
        claw = calJac
    if edge == "parameter_number":
        claw = calEdge

    parameter_image = readTxtPeremeter(filename11, formatChangeParameter)

    res = []
    img_indices = parameter_matrices.keys()
    com = {}
    link_num = 0
    for key in img_indices:
        for key1 in img_indices:
            comkey = str(key) + "_" + str(key1)
            comkey2 = str(key1) + "_" + str(key)
            if key != key1:
                if comkey not in com.keys() and comkey2 not in com.keys():
                    insection_matrix = getIntersectionFromMatrixs([parameter_matrices[key], parameter_matrices[key1]])
                    insection_len = len(insection_matrix)
                    union_matrix = getUnionFromMatrces([parameter_matrices[key], parameter_matrices[key1]])
                    union_len = len(union_matrix)
                    key_m = np.shape(parameter_matrices[key])[0]
                    key1_m = np.shape(parameter_matrices[key1])[0]
                    w = calMy(union_matrix, insection_matrix, have_parameter_image_number, parameter_image)
                    res.append([key, key1, w, key_m, key1_m, union_len, insection_len, insection_matrix])
                    com[comkey] = link_num
                    link_num += 1
                if comkey in com.keys() and comkey2 not in com.keys():  # 为了减少计算
                    temp = res[com[comkey]]
                    res.append([temp[1], temp[0], temp[2], temp[4], temp[3], temp[5], temp[6], temp[7]])
                    com[comkey2] = link_num
                    link_num += 1

                if comkey not in com.keys() and comkey2 in com.keys():  # 为了减少计算
                    temp = res[com[comkey2]]
                    res.append([temp[1], temp[0], temp[2], temp[4], temp[3], temp[5], temp[6], temp[7]])
                    com[comkey] = link_num
                    link_num += 1
    return res


def writeGraph(data, filename):
    '''
    把graph数据写到txt和json中去
    :param data:
    :param filename:
    :return:
    '''
    with open(filename, "w") as f:
        for item in data:
            line = str(item[0]) + " " + str(item[1]) + " " + str(item[2]) + " " + str(item[3]) + " " + str(
                item[4]) + " " + str(item[5]) + " " + str(item[6])
            f.write(line)
            f.write("\n")

    graph_json = formatChangeGraph3(data)
    filename_json = filename.replace(".txt", ".json")
    with open(filename_json, "w") as f:
        json.dump(graph_json, f, indent=4)


def processEdge(data, p):
    '''
    减少links的数量
    :param data: getGraph 返回的数据
    :param p: 留多少边
    :return:
    返回的类型和data 一样，只不过去掉了一些边
    '''
    links = {}
    res = []
    for i, item in enumerate(data):
        if item[0] not in links.keys():
            links[item[0]] = [item]
        else:
            links[item[0]].append(item)

    # for key in links.keys():
    #     link = links[key]
    #     for item in link:
    #         print(item[0:-2])

    for key in links.keys():
        link = links[key]
        # print("link",link)
        reserve_link_num = int(p * len(link))
        if reserve_link_num == 0:
            reserve_link_num = 1
        link.sort(key=lambda x: x[2], reverse=True)
        res.extend(link[0:reserve_link_num])
        link.sort(key=lambda x: x[6], reverse=True)
        for i, item in enumerate(link):
            if i == reserve_link_num:
                break
            if item not in res:
                res.append(item)
    # print("res", res)
    return res


def getAdjacencyMatrix(graph):
    '''
    得到graph的邻接矩阵
    :param graph:
    :return:
    '''
    node_source = [item[0] for item in graph]
    node_target = [item[1] for item in graph]

    node_source.extend(node_target)
    node = list(set(node_source))
    node.sort(key=lambda x: int(x))
    print(node)
    n_node = len(node)
    adj_matrix = np.zeros((n_node, n_node))  # 对角线是False 有连接是
    change_img2i = {}
    change_i2img = {}
    for i, index in enumerate(node):
        change_img2i[index] = i
        change_i2img[i] = index
    for item in graph:
        adj_matrix[change_img2i[item[0]], change_img2i[item[1]]] = 1
        adj_matrix[change_img2i[item[1]], change_img2i[item[0]]] = 1
    return adj_matrix, change_i2img


def graphCluster(graph_data, method, n_clusters, matrix_name):
    '''

    :param graph_data: [[],[],[]....] list
    :param method:
    :param n_clusters:
    :param matrix_name:
    :return:
    '''
    res = {}
    if method == "mcode":
        res = mcode(graph_data)
    if method == "spectralClustering":
        adjacency_matrix, change = getAdjacencyMatrix(graph_data)
        # print(adjacency_matrix)
        if matrix_name == "BetheHessian":
            matrix_fun = BetheHessian
        spectral_labels, eigvals, eigvects, W = SpectralClustering(n_clusters, matrix_fun(adjacency_matrix),
                                                                   matrix_name)
        spectral_labels_np = np.array(spectral_labels)
        for i in range(n_clusters):
            temp = [change[item] for item in np.where(spectral_labels_np == i)[0]]
            res[i] = temp
    else:
        res = mcode(graph_data)
    return res


if __name__ == '__main__':
    # test_data = {"1":[[1,2,3],[1,2,4]],"2":[[1,2,3],[1,2,5]]}
    # getGraph(test_data)
    Writer = "plh"
