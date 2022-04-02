'''
Description:
Writer = "plh"
Data:2021/8/28
'''
import math

from flask import Flask, render_template, url_for, jsonify, request, send_from_directory
import os
import os.path as osp
import numpy as np
from datetime import timedelta
from flask_cors import *
import yaml
import sys
import json
import cv2
import base64
import copy
root = os.path.abspath("./")
print(root)
sys.path.append(os.path.join(root, "dataProcess"))
sys.path.append(os.path.join(root, "dataProcess/imageLayout"))

from filter import filterListsCsv_Case1, fileterSingleMatrix_case1, fileterSingleMatrixPro_case1, filterSingleCsv_Case1

from preProcess import divideDatas
from combination import getNodeAndLinks, getRingCombinationData, getIntersectionFromMatrixs, getSankey, \
    getSubtractionFromMatrixs, getSankeyILP
from tool import formatChange, searchCombination, randomFileName, addJson, addJson1, judgeParametersCal, imageIndices, \
    getParameters, imgs2Indices, getMarixFromCsv, formatChangeGraph, readTxt, formatChangeGraph2, formatChangeGraph3, \
    createFilename, calTotalParameterSets, formatChangeGraph4, list2str, removeBracketList, data2number
from projection.isomap import isomapProject
from imageLayout.imgLayout import getImgLayoutForFront
from imgProcess import getVHistogram, getGrayHistogram
from clusterImg import clusterImgbyParam, calGreedyMatrix1, indiceChange, formatChangeCombine, getPixelRiver, getInfoAfterCombine, \
    getPixelImg2
from parameterStatistic import getParameterMatrix, getParameterStep, getParameterView3Origin, getParameterView3Cluster, \
    changeParameterOrder, getParameterImportance, sortParameterMatrix,sortParameterMatrix2, getIntersectionLocation, parameterLine, \
    getParameterPairsMatrix
from parameterCluster import getGraph, graphCluster, processEdge, writeGraph

app = Flask(__name__)
CORS(app, resources=r'/*')

yaml_file = "./config.yml"
with open(yaml_file, 'r') as f:
    cfg = yaml.safe_load(f)


@app.route('/hello')
def hello_world():
    return 'Hello World!'


@app.route("/test")
def test():
    return render_template("test.html")


@app.route("/projection", methods=["POST"])
def getProjectionData():
    '''
    返回投影数据
    如果不存在投影数据，则进行计算，然后返回
    如果存在，则直接返回
    :return:
    '''
    imgFile = request.json.get("imgFile")
    picPath = cfg["projectionFile"]
    res = isomapProject(imgFile, picPath)
    return jsonify({"res": res})


@app.route("/divideData", methods=["POST"])
def divideData():
    reDivide = request.json.get("reDivide").strip()
    caseBaseFile = cfg["caseBaseFile"]
    divideDatas(caseBaseFile, reDivide=reDivide)
    res = {"success": 1}
    return res


@app.route("/filterCase1", methods=["POST"])
def filterData():
    '''
    筛选数据
    aseConfig = {"caseBaseFile":"D:\\codeTest\\parameterExp\\data\\case1"}
    imgNames = ["Image_20210812150335027.bmp","Image_20210812150337954.bmp"]
    filterConfig = {"minValue":18000,"maxValue":25000}

    测试接口:
        imgNames:["Image_20210812150343338.bmp","Image_20210812150340363.bmp"]
        filterConfig:{"minValue":18000,"maxValue":25000}
        这个是用 https://getman.cn/ 接口工具

        用postman 要写在Body里面 然后就不用额外的处理
        body:
    {
        "imgNames": [
            "Image_20210812150343338.bmp",
            "Image_20210812150340363.bmp"
        ],
        "filterConfig": {
            "minValue": 18000,
            "maxValue": 25000
        }
    }
    :return:
        res:
        {
        "imgName":
            [[1,2,..],...]:list
        "imgName1":
            ...
        }
    '''

    # data = json.loads(request.get_data(as_text=True))
    # print(data)

    # 使用 https://getman.cn/ 接口工具 需要额外处理
    # imgNames = request.json.get("imgNames")
    # # 因为传进来的数据都是字符串
    # imgNames = imgNames.replace("[", '').replace("]", '').replace("\"", '')
    # imgNames = imgNames.split(",")
    #
    # filterConfig = request.json.get("filterConfig")
    # filterConfig = eval(filterConfig)
    #
    # # caseConfig = request.json.get("caseConfig")
    # caseConfig = {}
    # caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    # res = filterListsCsv_Case1(imgNames, filterConfig, caseConfig)
    # print(res)

    # postman
    imgNames = request.json.get("imgNames")
    # 因为传进来的数据都是字符串
    filterConfig = request.json.get("filterConfig")

    # caseConfig = request.json.get("caseConfig")
    caseConfig = {}
    caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    res = filterListsCsv_Case1(imgNames, filterConfig, caseConfig)
    return jsonify({"res": res})


@app.route("/combination", methods=["POST"])
def combination():
    '''
    筛选数据+进行组合，返回力导向图所需数据

    postman测试接口:
    body:
    {
        "imgNames": [
            "Image_20210812150343338.bmp",
            "Image_20210812150340363.bmp"
        ],
        "filterConfig": {
            "minValue": 18000,
            "maxValue": 25000
        }
    }
    :return:
        res:

    '''

    imgNames = request.json.get("imgNames")
    # 因为传进来的数据都是字符串
    filterConfig = request.json.get("filterConfig")

    # caseConfig = request.json.get("caseConfig")
    caseConfig = {}
    caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    caseConfig["combinationFile"] = cfg["combinationFile"]
    combinationJson = osp.join(caseConfig["combinationFile"], "combination.json")

    flag, fileName = searchCombination(combinationJson, request.json, ["imgNames", "filterConfig"])
    print("flag", flag)
    if flag:
        with open(osp.join(caseConfig["combinationFile"], fileName), "r") as f:
            res = json.load(f)
            return jsonify({"res": res})
    else:
        data = filterListsCsv_Case1(imgNames, filterConfig, caseConfig)
        # 格式转换 参数集合部分从list->array 然后去掉结果部分
        data = formatChange(data)
        res = getNodeAndLinks(data)

        fileName = randomFileName()
        addJson(combinationJson, fileName, request.json)
        with open(osp.join(caseConfig["combinationFile"], fileName), "w") as f:
            json.dump(res, f, indent=4)
        return jsonify({"res": res})


@app.route("/combinationRing", methods=["POST"])
def combinationRing():
    imgNames = request.json.get("imgNames")
    if (len(imgNames) == 0):
        return
    # 因为传进来的数据都是字符串
    filterConfig = request.json.get("filterConfig")

    # 当前组合的索引
    index = request.json.get("index")

    # caseConfig = request.json.get("caseConfig")
    caseConfig = {}
    caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    caseConfig["combinationFile"] = cfg["combinationFile"]
    combinationJson = osp.join(caseConfig["combinationFile"], "combinationRing.json")

    flag, fileName = searchCombination(combinationJson, request.json, ["imgNames", "filterConfig"])
    print("flag", flag)
    if flag:
        with open(osp.join(caseConfig["combinationFile"], fileName), "r") as f:
            res = json.load(f)
            return jsonify({"res": res})
    else:
        data = filterListsCsv_Case1(imgNames, filterConfig, caseConfig)
        # 格式转换 参数集合部分从list->array 然后去掉结果部分
        data = formatChange(data)
        res = getRingCombinationData(data, index)

        fileName = randomFileName(prefix="combinationRing")
        addJson(combinationJson, fileName, request.json)
        with open(osp.join(caseConfig["combinationFile"], fileName), "w") as f:
            for item in res["nodes"]:
                item["matrix"] = item["matrix"].tolist()
            json.dump(res, f, indent=4)
        return jsonify({"res": res})


@app.route("/img", methods=["POST"])
def getImg():
    imgName = request.json.get("imgName")
    file_path = osp.join(cfg["caseBaseFile"], "img")
    try:
        return send_from_directory(file_path, imgName)
    except BaseException:
        return "no img"


@app.route("/imgBase64", methods=["POST"])
def getImgBase64():
    '''
    获得一张图片的base64
    :return:
    '''
    imgName = request.json.get("imgName")
    h = request.json.get("imgHeight")
    w = request.json.get("imgWidth")
    if imgName == "noImg":
        return jsonify({"res": "404"})
    file_path = osp.join(cfg["caseBaseFile"], "img", imgName)
    img = cv2.imread(file_path)
    img_r = cv2.resize(img, (w, h))
    image = cv2.imencode('.bmp', img_r)[1]
    image_code = str(base64.b64encode(image))[2:-1]
    # print(image_code)
    # https://blog.csdn.net/qq_24502469/article/details/82495252
    return jsonify({"res": image_code})


@app.route("/imgLayout", methods=["POST"])
def getImgLayout():
    '''
    获得图片的布局信息
    :return:
    '''
    img_file = request.json.get("img_file")
    h = request.json.get("container_h")
    w = request.json.get("container_w")
    no_img = request.json.get("no_img")
    re_cal = request.json.get("re_cal")

    json_file = osp.join(cfg["caseBaseFile"], "layout", "layout.json")
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "img", "img_indices.json")
    # 添加图片id信息，按照图片读取的顺序进行编码，并存入json文件
    # img_indices = imageIndices(img_file, img_indices_json_file)
    if osp.exists(json_file) and not re_cal:
        with open(json_file, "r") as f:
            res = json.load(f)
            if no_img:
                for item in res["locations"]:
                    item[2] = "noImg"
            return res
    else:
        print("h", h)
        print("w", w)
        locations, avgH, avgW = getImgLayoutForFront(img_file, suffix="*.bmp", containerH=h, containerW=w)
        print("avgH", avgH)
        print("avgW", avgW)
        with open(json_file, "w") as f:
            res = {"locations": locations,
                   "h": str(avgH) + "px",
                   "w": str(avgW) + "px"}
            json.dump(res, f, indent=4)
            if no_img:
                for item in res["locations"]:
                    item[2] = "noImg"
            return jsonify(res)


@app.route("/getParameterComparisonILP", methods=["POST"])
def getParametersRelationILP():
    '''
    获得两组图片参数集合的关系
    因为filterConfig 的可能性太多了，所以这样用json保存这种是不现实的
    这个就用默认的filter
    ILP：用ILP方法对sankey的数据进行处理，减少crossing
    :return:
    '''
    img_q = request.json.get("imgQuery")
    img_g = request.json.get("imgGalley")
    filter_config = request.json.get("filterConfig")
    filter_config_index = int(filter_config["minValue"]) + "_" + int(filter_config["maxValue"])

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    parameter_json_file = osp.join(cfg["caseBaseFile"], "combination", "parameter.json")
    caseConfig = {}
    caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    # 把文件名进行转换
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    img_q_indices = imgs2Indices(img_q, img_indices)
    img_g_indices = imgs2Indices(img_g, img_indices)
    img_q_matrix = getParameters(img_q_indices, filter_config_index, parameter_json_file)
    img_g_matrix = getParameters(img_g_indices, filter_config_index, parameter_json_file)
    if img_q_matrix is None:
        # 主要是求交集，不想写了就调用下，所以代码冗余
        res = filterListsCsv_Case1(img_q, filter_config, caseConfig)
        res = formatChange(res)
        m = []
        for key, item in res.items():
            m.append(item)
        img_q_matrix = getIntersectionFromMatrixs(m)
        addJson1(parameter_json_file, filter_config_index, img_q_indices, img_q_matrix.tolist())

    if img_g_matrix is None:
        res = filterListsCsv_Case1(img_g, filter_config, caseConfig)
        res = formatChange(res)
        m = []
        for key, item in res.items():
            m.append(item)
        img_g_matrix = getIntersectionFromMatrixs(m)
        addJson1(parameter_json_file, filter_config_index, img_g_indices, img_g_matrix.tolist())

    m_i = getIntersectionFromMatrixs([np.array(img_q_matrix), np.array(img_g_matrix)])
    m_s_q = getSubtractionFromMatrixs([np.array(img_q_matrix), np.array(img_g_matrix)])
    m_s_g = getSubtractionFromMatrixs([np.array(img_g_matrix), np.array(img_q_matrix)])
    m_i_sankey = getSankey(m_i)
    m_s_q_sankey = getSankey(m_s_q)
    m_s_g_sankey = getSankey(m_s_g)


@app.route("/getParameterComparison", methods=["POST"])
def getParametersRelation():
    '''
    获得两组图片参数集合的关系
    因为filterConfig 的可能性太多了，所以这样用json保存这种是不现实的
    这个就用默认的filter
    :return:
    '''
    img_q = request.json.get("imgQuery")
    img_g = request.json.get("imgGalley")
    filter_config = request.json.get("filterConfig")
    filter_config_index = str(int(filter_config["minValue"])) + "_" + str(int(filter_config["maxValue"]))
    # filter_config_temp = {
    #     "minValue": 0,
    #     "maxValue": 1000000
    # }
    filter_config_temp = filter_config
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    parameter_json_file = osp.join(cfg["caseBaseFile"], "combination", "parameter.json")
    caseConfig = {}
    caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    # 把文件名进行转换
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    img_q_indices = imgs2Indices(img_q, img_indices)
    img_g_indices = imgs2Indices(img_g, img_indices)
    img_q_matrix = getParameters(img_q_indices, filter_config_index, parameter_json_file)
    img_g_matrix = getParameters(img_g_indices, filter_config_index, parameter_json_file)
    if img_q_matrix is None:
        # 主要是求交集，不想写了就调用下，所以代码冗余
        res = filterListsCsv_Case1(img_q, filter_config_temp, caseConfig)
        res = formatChange(res)
        m = []
        for key, item in res.items():
            m.append(item)
        img_q_matrix = getIntersectionFromMatrixs(m)
        addJson1(parameter_json_file, filter_config_index, img_q_indices, img_q_matrix.tolist())

    if img_g_matrix is None:
        res = filterListsCsv_Case1(img_g, filter_config_temp, caseConfig)
        res = formatChange(res)
        m = []
        for key, item in res.items():
            m.append(item)
        img_g_matrix = getIntersectionFromMatrixs(m)
        addJson1(parameter_json_file, filter_config_index, img_g_indices, img_g_matrix.tolist())

    m_i = getIntersectionFromMatrixs([np.array(img_q_matrix), np.array(img_g_matrix)])
    m_s_q = getSubtractionFromMatrixs([np.array(img_q_matrix), np.array(img_g_matrix)])
    m_s_g = getSubtractionFromMatrixs([np.array(img_g_matrix), np.array(img_q_matrix)])
    m_i_sankey = getSankey(m_i)
    m_s_q_sankey = getSankey(m_s_q)
    m_s_g_sankey = getSankey(m_s_g)
    print("m_i_sankey", m_i_sankey)
    print("m_s_q_sankey", m_s_q_sankey)
    print("m_s_g_sankey", m_s_g_sankey)
    return jsonify({
        "I": m_i_sankey,
        "Q": m_s_q_sankey,
        "G": m_s_g_sankey
    })


@app.route("/getImgHistogram", methods=["POST"])
def getImgHistogram():
    '''
    获得两组图片参数集合的关系
    因为filterConfig 的可能性太多了，所以这样用json保存这种是不现实的
    这个就用默认的filter
    :return:
    '''
    img_name = request.json.get("imgName")
    type = request.json.get("type")
    bin = request.json.get("bin")
    img_name = osp.join(cfg["caseBaseFile"], "img", img_name)
    img = cv2.imread(img_name)
    if type == "V":
        res = getVHistogram(img, bin)
    if type == "G":
        res = getGrayHistogram(img, bin)
    return jsonify({
        "res": res
    })


@app.route("/getImgParamDistribution", methods=["POST"])
def getImgParamDistribution():
    '''
    获得两组图片参数集合的关系
    因为filterConfig 的可能性太多了，所以这样用json保存这种是不现实的
    这个就用默认的filter
    :return:
    '''
    img_name = request.json.get("imgName")
    filter_config = request.json.get("filter_config")
    # 参数合理性验证
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])
    ero_para_name = "ero_" + img_name + ".csv"
    suc_para_name = "suc_" + img_name + ".csv"
    ero_para_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", ero_para_name)
    suc_para_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", suc_para_name)
    ero_matrix = getMarixFromCsv(ero_para_file)
    m_ero, n_ero = np.shape(ero_matrix)
    suc_matrix = getMarixFromCsv(suc_para_file)
    m_suc, n_suc = np.shape(suc_matrix)
    suc_matrix_filter = fileterSingleMatrix_case1(suc_matrix, filter_config)
    m_suc_filter, n_suc_filter = np.shape(suc_matrix_filter)
    return jsonify({
        "ero": m_ero,
        "suc": m_suc,
        "suc_filter": m_suc_filter
    })


@app.route("/getClusterImgbyParam", methods=["POST"])
def getClusterImgbyParam():
    '''
    获得两组图片参数集合的关系
    因为filterConfig 的可能性太多了，所以这样用json保存这种是不现实的
    这个就用默认的filter
    :return:
    '''
    img_names = request.json.get("img_names")
    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    cluster_matrixs = []
    for img_name in img_names:
        img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = fileterSingleMatrix_case1(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        cluster_matrixs.append(matrix)

    cluster = clusterImgbyParam(cluster_matrixs)

    return jsonify({
        "res": cluster
    })


@app.route("/calGreedyMatrix", methods=["POST"])
def calGreedyMatrix():
    '''
    获得两组图片参数集合的关系
    因为filterConfig 的可能性太多了，所以这样用json保存这种是不现实的
    这个就用默认的filter
    :return:
    '''
    img_names = request.json.get("imgNames")
    h = request.json.get("h")
    w = request.json.get("w")
    filter_config = request.json.get("filterConfig")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)

    cluster_matrixs = {}
    for img_name in img_names:
        img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = fileterSingleMatrix_case1(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        cluster_matrixs[img_indices[img_name]] = matrix

    # cluster = clusterImgbyParam(cluster_matrixs)
    greedy_cluster_res = request.json.get("res")
    res = calGreedyMatrix1(cluster_matrixs, greedy_cluster_res, w, h, "vertical")
    return jsonify({
        "res": res
    })


@app.route("/getParameterStatistic", methods=["POST"])
def getParameterStatistic():
    '''
    得到一张图片的参数集合的Statistic Matrix
    :return:
    '''
    img = request.json.get("imgName")
    filter_config = request.json.get("filterConfig")

    caseConfig = {}
    caseConfig["caseBaseFile"] = cfg["caseBaseFile"]
    caseConfig["parameterConfig"] = cfg["parameterConfig"]
    m = filterSingleCsv_Case1(img, filter_config, caseConfig)

    getParameterMatrix()

    return True
    # return jsonify({
    #     "I": m_i_sankey,
    #     "Q": m_s_q_sankey,
    #     "G": m_s_g_sankey
    # })


@app.route("/getParameterImageNumber", methods=["POST"])
def getParameterImageNumber():
    '''
    得到所有参数所能识别的图片的数量
    :return:
    '''
    img_names = request.json.get("img_names")
    filter_config = request.json.get("filter_config")
    write_flag = request.json.get("write_flag")  # 0 重写

    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    indices2img = {}
    for key in img_indices.keys():
        indices2img[img_indices[key]] = key

    filename_parameter = {}
    filename_parameter["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])

    filename1 = createFilename("parameter", ".txt", "_", filename_parameter)
    filename1 = osp.join(cfg["parameterFile"], filename1)

    if osp.exists(filename1) == False:
        csvPath = osp.join(cfg["caseBaseFile"], "parameter", indices2img[0] + ".csv")
        with open(csvPath) as f:
            datas = f.readlines()
        dataNum = len(datas)
        parameterAll = []
        for item in range(0, dataNum - 1):
            data = datas[item]
            data = data.rstrip('\n')
            data = data.split(",")
            dataLen = len(data)
            dataF = data2number(data)  # dataF 形如[1.0, 20.0, 40.0, 2.0, 0.8, 0.0, -1]
            parameterAll.append(dataF[1:5])

        for paramter in parameterAll:
            paramter.append(2)
            i = 0
            for img_indice in img_indices:
                img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_indice + ".csv")
                matrix = getMarixFromCsv(img_file)
                matrix = fileterSingleMatrix_case1(matrix, filter_config)
                matrix = matrix[:, 0:-2]
                if ((paramter == matrix).all(1).any()):
                    i += 1
            paramter.append(i)

        if write_flag == "1":
            with open(filename1, "w") as f:
                for item in parameterAll:
                    line = str(item[0]) + " " + str(item[1]) + " " + str(item[2]) + " " + str(item[3]) + " " + str(
                        item[4]) + " " + str(item[5])
                    f.write(line)
                    f.write("\n")

        return "success"
    else:
        return "exist"


@app.route("/getParameterSetsGraph", methods=["POST"])
def getParameterSetsGraph():
    '''
    得到所有参数集合的图关系
    供测试用
    :return:
    '''

    img_names = request.json.get("img_names")
    filter_config = request.json.get("filter_config")
    write_flag = request.json.get("write_flag")  # 0 重写
    edge = request.json.get("edge")
    process_method = request.json.get("process_method")
    p = request.json.get("p")

    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)

    filename_parameter1 = {}
    filename_parameter1["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter1["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])

    filename11 = createFilename("parameter", ".txt", "_", filename_parameter1)
    filename11 = osp.join(cfg["parameterFile"], filename11)

    # 参数矩阵
    parameter_matrixs = {}
    have_parameter_image_number = 0
    for img_name in img_names:
        img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = fileterSingleMatrix_case1(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        if len(matrix) != 0:
            parameter_matrixs[img_indices[img_name]] = matrix
            have_parameter_image_number += 1

    graph = getGraph(parameter_matrixs, edge, have_parameter_image_number, filename11)

    filename_parameter = {}
    filename_parameter["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter["edge"] = edge
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
    if process_method == "1":
        graph = processEdge(graph, p)
        filename_parameter["process"] = process_method + "_" + str(p)
    else:
        filename_parameter["process"] = process_method

    filename1 = createFilename("graph", ".txt", "_", filename_parameter)
    filename1 = osp.join(cfg["graphFile"], filename1)

    if write_flag == "1":
        writeGraph(graph, filename1)

    return "success"


@app.route("/getParameterSetsGraphCluster", methods=["POST"])
def getParameterSetsGraphCluster():
    graph = request.json.get("graph")
    method = request.json.get("method")
    n_clusters = request.json.get("n_clusters")

    matrix_name = request.json.get("matrix_name")
    res = graphCluster(graph, method, n_clusters, matrix_name)
    flag = "success"
    return jsonify({
        "flag": flag,
        "graph_cluster": res
    })


# @app.route("/getView1Simple", methods=["POST"])
# def getView1Simple():
#     '''
#     得到view1所需的虽有数据
#     :return:
#     '''
#     img_names = request.json.get("img_names")
#
#     edge = request.json.get("edge")  # 生成原始graph 所需参数
#     process_method = request.json.get("process_method")  # 生成原始graph 所需参数
#     p = request.json.get("p")  # 生成原始graph 所需参数
#
#     filter_config = request.json.get("filter_config")
#     filter_config["minValue"] = int(filter_config["minValue"])
#     filter_config["maxValue"] = int(filter_config["maxValue"])
#
#     # 查看文件夹中是否已经有数据
#     flag = False
#
#     img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
#     with open(img_indices_json_file, "r") as f:
#         img_indices = json.load(f)
#     indices2img = {}
#     for key in img_indices.keys():
#         indices2img[img_indices[key]] = key
#
#     filename_parameter = {}
#     filename_parameter["imgs"] = imgs2Indices(img_names, img_indices)
#     filename_parameter["edge"] = edge
#     filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
#     if process_method == "1":
#         filename_parameter["process"] = process_method + "_" + str(p)
#     else:
#         filename_parameter["process"] = process_method
#
#     graph_filename = createFilename("graph", ".txt", "_", filename_parameter)
#     graph_filename = osp.join(cfg["graphFile"], graph_filename)
#
#     if osp.exists(graph_filename):
#         graph = readTxt(graph_filename)
#         graph_force_data = formatChangeGraph3(graph)
#
#         return jsonify({
#             "flag": flag,
#             "graph_force_data": graph_force_data
#         })
#     else:
#         return jsonify({
#             "flag": flag,
#         })


@app.route("/getView1", methods=["POST"])
def getView1():
    '''
    得到view1所需的虽有数据
    :return:
    '''
    img_names = request.json.get("img_names")

    edge = request.json.get("edge")  # 生成原始graph 所需参数
    process_method = request.json.get("process_method")  # 生成原始graph 所需参数
    p = request.json.get("p")  # 生成原始graph 所需参数

    # 聚类后生成的大的graph，因为节点数少，所以不需要额外的 process（即不需要省略边）

    # 和聚类有关的参数
    method = request.json.get("method")
    n_clusters = request.json.get("n_clusters")
    matrix_name = request.json.get("matrix_name")

    # filter
    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    # 查看文件夹中是否已经有数据
    flag = False

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    indices2img = {}
    for key in img_indices.keys():
        indices2img[img_indices[key]] = key

    filename_parameter = {}
    filename_parameter["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter["edge"] = edge
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
    if process_method == "1":
        filename_parameter["process"] = process_method + "_" + str(p)
    else:
        filename_parameter["process"] = process_method

    graph_filename = createFilename("graph", ".txt", "_", filename_parameter)
    graph_filename = osp.join(cfg["graphFile"], graph_filename)

    view1_filename = createFilename("view1", ".json", "_", filename_parameter)
    view1_filename = osp.join(cfg["graphFile"], view1_filename)

    add_img_feature_filename = osp.join(cfg["caseBaseFile"], "img", "add.json")
    if osp.exists(view1_filename):
        with open(view1_filename, "r") as f:
            final_res = json.load(f)

        with open(add_img_feature_filename, "r") as f:
            add_img_feature = json.load(f)
        final_res["img_feature"] = add_img_feature
        return jsonify(
            final_res
        )
    else:
        if osp.exists(graph_filename):  # 我默认已经生成了 graph 所以后面要把参数写出来的话 要改这里
            # 计算所有的参数组合个数
            total_psets = calTotalParameterSets(cfg)
            graph = readTxt(graph_filename, formatChangeGraph)

            cluster_res = graphCluster(graph, method, n_clusters, matrix_name)  # 聚类结果

            cluster_force_data = {}
            cluster_matrix = {}
            cluster_element_force_data = {}
            add_info = {}
            for key in cluster_res.keys():
                # 计算这个cluster的交集
                certain_cluster_matrices = {}
                matrices = []
                for img_indice in cluster_res[key]:
                    img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData",
                                        "suc_" + indices2img[int(img_indice)] + ".csv")
                    matrix = getMarixFromCsv(img_file)
                    n_success = np.shape(matrix)[0]
                    matrix = fileterSingleMatrix_case1(matrix, filter_config)
                    matrix = matrix[:, 0:-2]
                    n_success_filter = np.shape(matrix)[0]
                    matrices.append(matrix)
                    certain_cluster_matrices[img_indice] = matrix
                    add_info[img_indice] = {"n_fail": total_psets - n_success, "n_success_filter": n_success_filter,
                                            "n_success_out_filter": n_success - n_success_filter}
                insection_matrix = getIntersectionFromMatrixs(matrices)  # 该cluster 共同的参数集合
                cluster_matrix[key] = insection_matrix
                certain_cluster_graph = getGraph(certain_cluster_matrices, edge)
                if process_method == "1":
                    certain_cluster_graph_f = processEdge(certain_cluster_graph, p)

                else:
                    pass
                cluster_element_force_data[key] = formatChangeGraph4(certain_cluster_graph_f, add_info)

            cluster_graph_data = getGraph(cluster_matrix, edge)  # cluster 之间的连线
            cluster_force_data = formatChangeGraph3(cluster_graph_data, cluster_matrix)  # 格式转换

            with open(add_img_feature_filename, "r") as f:
                add_img_feature = json.load(f)

            final_res = {
                "flag": flag,
                "cluster_res": cluster_res,
                "cluster_force_data": cluster_force_data,
                "cluster_element_force_data": cluster_element_force_data,
                "img_feature": add_img_feature
            }
            with open(view1_filename, "w") as f:
                json.dump(final_res, f, indent=4)
            return jsonify(final_res)

        else:
            return jsonify({
                "flag": flag,
            })


@app.route("/getView11", methods=["POST"])
def getView11():
    '''
    得到view1所需的虽有数据
    :return:
    '''
    img_names = request.json.get("img_names")

    edge = request.json.get("edge")  # 生成原始graph 所需参数
    process_method = request.json.get("process_method")  # 生成原始graph 所需参数
    p = request.json.get("p")  # 生成原始graph 所需参数

    # 聚类后生成的大的graph，因为节点数少，所以不需要额外的 process（即不需要省略边）

    # 和聚类有关的参数
    # 聚类方法
    method = request.json.get("method")
    # 类的数量
    n_clusters = request.json.get("n_clusters")
    # 模型名称
    matrix_name = request.json.get("matrix_name")

    # filter
    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])
    filter_config["group_number"] = int(filter_config["group_number"])
    filter_config["threshold"] = int(filter_config["threshold"])

    # 查看文件夹中是否已经有数据
    flag = False

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    indices2img = {}
    for key in img_indices.keys():
        indices2img[img_indices[key]] = key

    filename_parameter = {}
    filename_parameter["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter["edge"] = edge
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
    if process_method == "1":
        filename_parameter["process"] = process_method + "_" + str(p)
    else:
        filename_parameter["process"] = process_method

    graph_filename = createFilename("graph", ".txt", "_", filename_parameter)
    graph_filename = osp.join(cfg["graphFile"], graph_filename)

    filename_parameter["group_number"] = str(filter_config["group_number"])
    filename_parameter["threshold"] = str(filter_config["threshold"])

    view1_filename = createFilename("view1", ".json", "_", filename_parameter)
    view1_filename = osp.join(cfg["graphFile"], view1_filename)

    filename_parameter1 = {}
    filename_parameter1["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter1["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])

    filename11 = createFilename("parameter", ".txt", "_", filename_parameter1)
    filename11 = osp.join(cfg["parameterFile"], filename11)

    add_img_feature_filename = osp.join(cfg["caseBaseFile"], "img", "add.json")
    if osp.exists(view1_filename):
        with open(view1_filename, "r") as f:
            final_res = json.load(f)

        with open(add_img_feature_filename, "r") as f:
            add_img_feature = json.load(f)
        final_res["img_feature"] = add_img_feature
        return jsonify(
            final_res
        )
    else:
        if osp.exists(graph_filename):  # 我默认已经生成了 graph 所以后面要把参数写出来的话 要改这里
            # 计算所有的参数组合个数
            total_psets = calTotalParameterSets(cfg)
            graph = readTxt(graph_filename, formatChangeGraph)
            cluster_res = graphCluster(graph, method, n_clusters, matrix_name)  # 聚类结果

            # 处理没有参数集的图片
            no_parameter_image = []
            indices2img_1 = {}
            for key in img_indices.keys():
                indices2img_1[img_indices[key]] = key

            cluster_force_data = {}
            cluster_matrix = {}
            cluster_element_force_data = {}
            add_info = {}
            group_data = []
            have_parameter_image_number = 0
            for key in cluster_res.keys():
                # 计算这个cluster的交集
                certain_cluster_matrices = {}
                matrices = []
                for img_indice in cluster_res[key]:
                    img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData",
                                        "suc_" + indices2img[int(img_indice)] + ".csv")
                    matrix = getMarixFromCsv(img_file)
                    n_success = np.shape(matrix)[0]
                    matrix = fileterSingleMatrix_case1(matrix, filter_config)
                    matrix = matrix[:, 0:-2]
                    n_success_filter = np.shape(matrix)[0]
                    matrices.append(matrix)
                    certain_cluster_matrices[img_indice] = matrix
                    add_info[img_indice] = {"n_fail": total_psets - n_success, "n_success_filter": n_success_filter,
                                            "n_success_out_filter": n_success - n_success_filter}
                    indices2img_1[int(img_indice)] = -1
                    have_parameter_image_number += 1

                insection_matrix = getIntersectionFromMatrixs(matrices)  # 该cluster 共同的参数集合
                cluster_matrix[key] = insection_matrix
                certain_cluster_graph = getGraph(certain_cluster_matrices, edge, have_parameter_image_number, filename11)
                if process_method == "1":
                    certain_cluster_graph_f = processEdge(certain_cluster_graph, p)
                else:
                    pass
                cluster_element_force_data[key] = formatChangeGraph4(certain_cluster_graph_f, cluster_res[key],
                                                                     add_info)

            cluster_graph_data = getGraph(cluster_matrix, edge, have_parameter_image_number, filename11)  # cluster 之间的连线
            cluster_force_data = formatChangeGraph3(cluster_graph_data, cluster_matrix)  # 格式转换
            cluster_force_data["nodes"].append({
                "id": len(cluster_force_data["nodes"]),
                "unionNum": 0,
                "cluster_matrix": []
            })

            with open(add_img_feature_filename, "r") as f:
                add_img_feature = json.load(f)

            # 获取没有参数集的图片
            for key in indices2img_1:
                if indices2img_1[key] != -1:
                    no_parameter_image.append(key)


            cluster_element_force_data[len(cluster_res.keys())] = {
                "links": [],
                "nodes": []
            }
            for i in no_parameter_image:
                j = str(i)
                cluster_element_force_data[len(cluster_res.keys())]["nodes"].append({
                    "id": j,
                    "unionNum": 0
                })

            # 获得新的数据
            # filter_config["group_number"]
            # filter_config["threshold"]
            # 遍历所有的图片
            for key in img_indices.keys():
                img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData",
                                    "suc_" + key + ".csv")
                matrix = getMarixFromCsv(img_file)
                matrix = fileterSingleMatrixPro_case1(matrix, filter_config)
                group_data.append({
                    "id": img_indices[key],
                    "successNum": matrix['successNum'],
                    "failNum": matrix['failNum']
                })

            final_res = {
                "flag": flag,
                "cluster_res": cluster_res,
                "cluster_force_data": cluster_force_data,
                "cluster_element_force_data": cluster_element_force_data,
                "group_data": group_data,
                "no_parameter_image": no_parameter_image,
                "img_feature": add_img_feature
            }
            with open(view1_filename, "w") as f:
                json.dump(final_res, f, indent=4)

            return jsonify(final_res)

        else:
            return jsonify({
                "flag": flag
            })


@app.route("/getView11MoveImg", methods=["POST"])
def getView11MoveImg():
    img_names = request.json.get("img_names")
    newClusterRes = request.json.get("newClusterRes")
    filter_config = request.json.get("filter_config")
    edge = request.json.get("edge")  # 生成原始graph 所需参数
    process_method = request.json.get("process_method")  # 生成原始graph 所需参数
    p = request.json.get("p")  # 生成原始graph 所需参数
    group_data = request.json.get("group_data")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])
    filter_config["group_number"] = int(filter_config["group_number"])
    filter_config["threshold"] = int(filter_config["threshold"])

    total_psets = calTotalParameterSets(cfg)
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    indices2img = {}
    for key in img_indices.keys():
        indices2img[img_indices[key]] = key

    filename_parameter = {}
    filename_parameter["edge"] = edge
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
    if process_method == "1":
        filename_parameter["process"] = process_method + "_" + str(p)
    else:
        filename_parameter["process"] = process_method

    filename_parameter["group_number"] = str(filter_config["group_number"])
    filename_parameter["threshold"] = str(filter_config["threshold"])

    cluster_str = ""
    for key in newClusterRes.keys():
        cluster_str = cluster_str + str(key) + "c"
        for item in newClusterRes[key]:
            cluster_str = cluster_str + str(item) + "_"
    filename_parameter["cluster"] = cluster_str

    view1_filename = createFilename("view1_move", ".json", "_", filename_parameter)
    view1_filename = osp.join(cfg["graphFile"], view1_filename)

    filename_parameter1 = {}
    filename_parameter1["imgs"] = imgs2Indices(img_names, img_indices)
    filename_parameter1["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])

    filename11 = createFilename("parameter", ".txt", "_", filename_parameter1)
    filename11 = osp.join(cfg["parameterFile"], filename11)

    add_img_feature_filename = osp.join(cfg["caseBaseFile"], "img", "add.json")
    if osp.exists(view1_filename):
        with open(view1_filename, "r") as f:
            final_res = json.load(f)

        with open(add_img_feature_filename, "r") as f:
            add_img_feature = json.load(f)
        final_res["img_feature"] = add_img_feature
        return jsonify(
            final_res
        )
    else:
        # 处理没有参数集的图片
        no_parameter_image = []
        indices2img_1 = {}
        for key in img_indices.keys():
            indices2img_1[img_indices[key]] = key

        cluster_matrix = {}
        cluster_element_force_data = {}
        add_info = {}
        have_parameter_image_number = 0
        for key in newClusterRes.keys():
            # 计算这个cluster的交集
            certain_cluster_matrices = {}
            matrices = []
            for img_indice in newClusterRes[key]:
                img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData",
                                    "suc_" + indices2img[int(img_indice)] + ".csv")
                matrix = getMarixFromCsv(img_file)
                n_success = np.shape(matrix)[0]
                matrix = fileterSingleMatrix_case1(matrix, filter_config)
                matrix = matrix[:, 0:-2]
                n_success_filter = np.shape(matrix)[0]
                matrices.append(matrix)
                certain_cluster_matrices[img_indice] = matrix
                add_info[img_indice] = {"n_fail": total_psets - n_success, "n_success_filter": n_success_filter,
                                        "n_success_out_filter": n_success - n_success_filter}
                indices2img_1[int(img_indice)] = -1
                have_parameter_image_number += 1

            insection_matrix = getIntersectionFromMatrixs(matrices)  # 该cluster 共同的参数集合
            cluster_matrix[key] = insection_matrix
            certain_cluster_graph = getGraph(certain_cluster_matrices, edge, have_parameter_image_number, filename11)
            if process_method == "1":
                certain_cluster_graph_f = processEdge(certain_cluster_graph, p)
            else:
                pass
            cluster_element_force_data[key] = formatChangeGraph4(certain_cluster_graph_f, newClusterRes[key],
                                                                 add_info)

        cluster_graph_data = getGraph(cluster_matrix, edge, have_parameter_image_number, filename11)  # cluster 之间的连线
        cluster_force_data = formatChangeGraph3(cluster_graph_data, cluster_matrix)  # 格式转换
        cluster_force_data["nodes"].append({
            "id": str(len(cluster_force_data["nodes"])),
            "unionNum": 0,
            "cluster_matrix": []
        })

        with open(add_img_feature_filename, "r") as f:
            add_img_feature = json.load(f)

        # 获取没有参数集的图片
        for key in indices2img_1:
            if indices2img_1[key] != -1:
                no_parameter_image.append(key)
        cluster_element_force_data[str(len(newClusterRes.keys()))] = {
            "links": [],
            "nodes": []
        }
        for i in no_parameter_image:
            cluster_element_force_data[str(len(newClusterRes.keys()))]["nodes"].append({
                "id": str(i),
                "unionNum": 0
            })

        res = {
            "flag": False,
            "cluster_res": newClusterRes,
            "cluster_force_data": cluster_force_data,
            "cluster_element_force_data": cluster_element_force_data,
            "group_data": group_data,
            "no_parameter_image": no_parameter_image,
            "img_feature": add_img_feature
        }

        with open(view1_filename, "w") as f:
            json.dump(res, f, indent=4)
        return jsonify(res)


@app.route("/getView4", methods=["GET"])
def getView4():
    # 图片映射文件
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    indices2img = {}
    for key in img_indices.keys():
        indices2img[img_indices[key]] = key

    parameter_number = int(cfg["parameterNum"])
    operation_number = int(cfg["operationNum"])
    operation_config = cfg["operationConfig"]
    parameter_config = cfg["parameterConfig"]
    parameter_detail = []
    operation_detail = []

    for i in range(parameter_number):
        parameter_detail.append(parameter_config[i])

        # 计算组合总数
        combination_number = calTotalParameterSets(cfg)

    for i in range(operation_number):
        operation_parameter = []
        flag = False
        for j in operation_config[i]["parameterDetail"]:
            operation_parameter.append(parameter_config[j])
            if parameter_config[j]["use"]:
                flag = True

        operation_detail.append({
            "operationName": operation_config[i]["operationName"],
            "parameterNumber": operation_config[i]["parameterNumber"],
            "operation_parameter": operation_parameter,
            "use": flag
        })

    parameter = {
        "parameterNum": parameter_number,
        "detail": parameter_detail
    }

    return jsonify({
        "image_number": len(img_indices),
        "parameter": parameter,
        "operation": operation_detail,
        "combination_number": combination_number
    })


@app.route("/getIntersection", methods=["POST"])
def getIntersection():
    img_names = request.json.get("img_names")

    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    matrices = []
    for img_name in img_names:
        img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = fileterSingleMatrix_case1(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        matrices.append(matrix)
    insection_matrix = getIntersectionFromMatrixs(matrices)
    num = np.shape(insection_matrix)[0]
    return jsonify({
        "num": num,
        "matrix": insection_matrix.tolist()
    })

@app.route("/getView2", methods=["POST"])
def getView2():
    flag = False
    img_indices = request.json.get("img_indices")
    if (len(img_indices) == 0):
        return jsonify({
            "flag": flag,
            "combine": "",
            "combine_detail": "",
            "parameter_static_matrices": "",
            "pixel_river": "",
            "parameter_info": "",
            "heatmap": "",
            "parameter_matrix_num": "",
            "pixel_img": "",
            "info_after_combine": "",
            "parameter_statistical_matrix": ""
        })
    method = request.json.get("method")

    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])
    combine_type = request.json.get("combine_type")
    print("combine_type", combine_type)
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")

    filename_parameter = {}
    filename_parameter["imgs"] = img_indices
    filename_parameter["method"] = method
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
    filename_parameter["combine_type"] = str(combine_type)

    filename = createFilename("combine", ".json", "_", filename_parameter)
    filename = osp.join(cfg["graphFile"], filename)

    if osp.exists(filename):
        with open(filename, "r") as f:
            res = json.load(f)
        return jsonify(res)
    else:
        with open(img_indices_json_file, "r") as f:
            imgs2indices = json.load(f)
        indices2img = {}
        for key in imgs2indices.keys():
            indices2img[imgs2indices[key]] = key

        matrices = []
        img_names = []
        matrices_dict = {}
        matrices_static = {}
        for indice in img_indices:
            img_name = indices2img[int(indice)]
            img_names.append(img_name)
            img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
            matrix = getMarixFromCsv(img_file)
            matrix = fileterSingleMatrix_case1(matrix, filter_config)
            matrix = matrix[:, 0:-3]
            matrices.append(matrix)
            matrices_dict[int(indice)] = matrix

        cluster = clusterImgbyParam(matrices, combine_type)
        cluster_new = indiceChange(cluster, img_names=img_names,
                                   img2Id=imgs2indices)  # 做索引的转换 默认原始的索引是 0 至 len(matrices)-1
        combine_res = formatChangeCombine(matrices_dict, cluster_new)

        # 得到每种参数集合的参数矩阵
        for key in cluster_new.keys():
            cluster = cluster_new[key]
            for item in cluster:
                item_key = list2str(removeBracketList(item))
                if item_key not in matrices_static.keys():
                    item_key_l = item_key.split("_")
                    matrices_temp = []
                    for indice in item_key_l:
                        img_name = indices2img[int(indice)]
                        img_names.append(img_name)
                        img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
                        matrix = getMarixFromCsv(img_file)
                        matrix = fileterSingleMatrix_case1(matrix, filter_config)
                        matrix = matrix[:, 0:-2]
                        matrices_temp.append(matrix)
                    intersection_matrix = getIntersectionFromMatrixs(matrices_temp)
                    matrices_static[item_key] = getParameterMatrix(intersection_matrix, cfg)

        # 返回合并的顺序，合并后每个新对象参数集合
        info_after_combine = getInfoAfterCombine(matrices_dict, cluster_new)

        # 得到有像素图的数据
        pixelRiver = getPixelRiver(matrices_dict, cluster_new, cfg)

        parameter_info = getParameterStep(cfg)

        # 得到两两组合后的热力图矩阵
        heatmap = getParameterPairsMatrix(matrices_dict)

        # parameter matrix num
        parameter_matrix_num = {}
        for key in matrices_dict.keys():
            parameter_matrix_num[key] = np.shape(matrices_dict[key])[0]

        #先用数量最小的参数集合的参数重要程度最为排序标准
        matrix_min = {}
        size_min = -1
        matrices_intersection_copy = {}
        for key in info_after_combine["intersection"].keys():
            matrix = np.array(info_after_combine["intersection"][key])
            size = np.shape(matrix)[0]
            matrices_intersection_copy[key] = copy.deepcopy(info_after_combine["intersection"][key])
            if size_min == -1:
                matrix_min = matrix
                size_min = size
            if size_min > size:
                matrix_min = matrix
                size_min = size

        parameter_matrix = getParameterMatrix(matrix_min, cfg)
        importance_order, temp_total = getParameterImportance(np.array(parameter_matrix))


        # 得到像素画的数据
        # pixel_img = getPixelImg(info_after_combine["intersection"],parameter_info) #索引相对sample
        pixel_img = getPixelImg2(info_after_combine["intersection"],order=importance_order)  # 索引相对union

        # 得到parameter_matrix
        parameter_matrix_statistical_d = {}
        for key in info_after_combine["intersection"].keys():
            parameter_matrix_statistical_d[key] = getParameterMatrix(np.array(info_after_combine["intersection"][key]),
                                                                     cfg)

        canTwoCluster = False
        combine_keys = list(combine_res.keys())
        newCluster = {}
        clusterFlag = 0
        newCluster["0"] = []
        for key in combine_keys:
            if clusterFlag == 0:
                for item in combine_res[key]:
                    if len(item) == 2 and item[1] == 0:
                        if key == combine_keys[len(combine_keys) - 1]:
                            canTwoCluster = True
                            newCluster["0"] = removeBracketList(item[0][1])
                        else:
                            newCluster["0"] = removeBracketList(item[0][1])
                        if isinstance(newCluster["0"], int):
                            newCluster["0"] = [newCluster["0"]]
                        clusterFlag = 1
                        break

        newCluster["1"] = []
        for img in img_indices:
            if int(img) not in newCluster["0"]:
                newCluster["1"].append(int(img))

        # 对于新的排列顺序 获得相关的数据
        matrices_1 = []
        img_names_1 = []
        matrices_dict_1 = {}

        for indice in newCluster["1"]:
            img_name_1 = indices2img[int(indice)]
            img_names_1.append(img_name_1)
            img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name_1 + ".csv")
            matrix = getMarixFromCsv(img_file)
            matrix = fileterSingleMatrix_case1(matrix, filter_config)
            matrix = matrix[:, 0:-3]
            matrices_1.append(matrix)
            matrices_dict_1[int(indice)] = matrix

        cluster_1 = clusterImgbyParam(matrices_1, combine_type)
        cluster_new_1 = indiceChange(cluster_1, img_names=img_names_1,
                                     img2Id=imgs2indices)  # 做索引的转换 默认原始的索引是 0 至 len(matrices)-1
        combine_res_1 = formatChangeCombine(matrices_dict_1, cluster_new_1)
        info_after_combine_1 = getInfoAfterCombine(matrices_dict_1, cluster_new_1)

        # print("info_after_combine_1",info_after_combine_1)
        print("importance_order",importance_order)
        # pixel img
        pixel_img_1 = getPixelImg2(info_after_combine_1["intersection"],order=importance_order)  # 索引相对union

        # 得到parameter_matrix
        parameter_matrix_statistical_d_1 = {}
        for key in info_after_combine_1["intersection"].keys():
            parameter_matrix_statistical_d_1[key] = getParameterMatrix(
                np.array(info_after_combine_1["intersection"][key]),
                cfg)

        # 得到合并顺序树的数据结构
        # tree_combine = getTreeData(cluster_new,info_after_combine[re_combine])
        with open(filename, "w") as f:
            res = {}
            res["flag"] = True
            res["combine"] = cluster_new
            res["combine_detail"] = combine_res
            res["parameter_static_matrices"] = matrices_static
            res["pixel_river"] = pixelRiver
            res["parameter_info"] = parameter_info
            res["heatmap"] = heatmap
            res["parameter_matrix_num"] = parameter_matrix_num
            res["pixel_img"] = pixel_img
            res["info_after_combine"] = info_after_combine
            res["parameter_statistical_matrix"] = parameter_matrix_statistical_d
            res["canTwoCluster"] = canTwoCluster
            res["newCluster"] = newCluster
            res["combine_1"] = cluster_new_1
            res["info_after_combine_1"] = info_after_combine_1
            res["pixel_img_1"] = pixel_img_1
            res["parameter_statistical_matrix_1"] = parameter_matrix_statistical_d_1
            json.dump(res, f, indent=4)

        flag = True

        return jsonify({
            "flag": flag,
            "combine": cluster_new,
            "combine_detail": combine_res,
            "parameter_static_matrices": matrices_static,
            "pixel_river": pixelRiver,
            "parameter_info": parameter_info,
            "heatmap": heatmap,
            "parameter_matrix_num": parameter_matrix_num,
            "pixel_img": pixel_img,
            "info_after_combine": info_after_combine,
            "parameter_statistical_matrix": parameter_matrix_statistical_d,
            "canTwoCluster": canTwoCluster,
            "newCluster": newCluster,
            "combine_1": cluster_new_1,
            "info_after_combine_1": info_after_combine_1,
            "pixel_img_1": pixel_img_1,
            "parameter_statistical_matrix_1": parameter_matrix_statistical_d_1
        })


@app.route("/getView3", methods=["POST"])
def getView3():
    flag = False

    img_indices = request.json.get("img_indices")
    if not img_indices:
        return jsonify({
            "parameterStep": "",
            "flag": flag,
            "parameterSets": "",
            "view3dataOrigin": "",
            "view3dataCluster": "",
            "parameterInfo": "",
            "operationInfo": "",
        })

    method = request.json.get("method")
    # operation = request.json.get("operation")
    p_value = request.json.get("p_value")
    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    parameter_order = request.json.get("parameter_order")
    order = request.json.get("order")

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")

    filename_parameter = {}
    filename_parameter["imgs"] = list2str(img_indices["0"]) + "_" + list2str(img_indices["1"])
    filename_parameter["method"] = method
    filename_parameter["filter"] = str(filter_config["minValue"]) + "_" + str(filter_config["maxValue"])
    filename_parameter["parameter_order"] = parameter_order
    filename_parameter["order"] = list2str(order)

    filename = createFilename("parameter", ".json", "_", filename_parameter)
    filename = osp.join(cfg["graphFile"], filename)

    if osp.exists(filename):
        with open(filename, "r") as f:
            res = json.load(f)
        return jsonify(res)
    else:
        with open(img_indices_json_file, "r") as f:
            imgs2indices = json.load(f)
        indices2img = {}
        for key in imgs2indices.keys():
            indices2img[imgs2indices[key]] = key
        # matrices = []
        # img_names = []
        matrices_dict = {}
        for key in img_indices.keys():
            matrices_temp = []
            for indice in img_indices[key]:
                img_name = indices2img[int(indice)]
                # img_names.append(img_name)
                img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
                matrix = getMarixFromCsv(img_file)
                matrix = fileterSingleMatrix_case1(matrix, filter_config)
                matrix = matrix[:, 0:-3]
                matrices_temp.append(matrix)
            matrices_dict[key] = getIntersectionFromMatrixs(matrices_temp).tolist()
        parameterStep = getParameterStep(cfg)
        # 改变参数的顺序
        parameterInfo = []
        operationInfo = []
        parameterNum = cfg["parameterNum"]
        parameterConfig = cfg["parameterConfig"]
        operationConfig = cfg["operationConfig"]
        operationNum = cfg["operationNum"]
        for i in range(operationNum):
            operationInfo.append(operationConfig[i])
        if parameter_order == "default":
            for i in range(parameterNum):
                if parameterConfig[i]["use"] == True:
                    parameterInfo.append([parameterConfig[i]["parameterName"], i, i])
        else:
            for i, item in enumerate(order):
                parameterInfo.append([parameterConfig[item]["parameterName"], item, i])
            matrices_dict, parameterStep = changeParameterOrder(matrices_dict, parameterStep, order)

        view3dataOrigin = getParameterView3Origin(matrices_dict, parameterStep)  # matrices_dict <class 'list'>
        view3dataCluster = getParameterView3Cluster(view3dataOrigin, parameterStep, p_value)
        flag = True
        return jsonify({
            "parameterStep": parameterStep,
            "flag": flag,
            "parameterSets": matrices_dict,
            "view3dataOrigin": view3dataOrigin,
            "view3dataCluster": view3dataCluster,
            "parameterInfo": parameterInfo,
            "operationInfo": operationInfo
        })


# 工具函数
@app.route("/imgIndices2imgNames", methods=["POST"])
def imgIndices2imgNames():
    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")
    with open(img_indices_json_file, "r") as f:
        img_indices = json.load(f)
    indices2img = {}
    for key in img_indices.keys():
        indices2img[img_indices[key]] = key
    img_indices = request.json.get("img_indices")
    res_img = []
    for i in img_indices:
        res_img.append(indices2img[int(i)])
    return jsonify({
        "img_names": res_img
    })


@app.route("/sortParameterMatrix", methods=["POST"])
def sortParameterMatrixRequest():
    img_indices = request.json.get("img_indices")
    filter_config = request.json.get("filter_config")
    filter_config["minValue"] = int(filter_config["minValue"])
    filter_config["maxValue"] = int(filter_config["maxValue"])

    img_indices_json_file = osp.join(cfg["caseBaseFile"], "combination", "img_indices.json")

    with open(img_indices_json_file, "r") as f:
        imgs2indices = json.load(f)
    indices2img = {}
    for key in imgs2indices.keys():
        indices2img[imgs2indices[key]] = key

    img_name = indices2img[int(img_indices)]
    img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
    matrix = getMarixFromCsv(img_file)
    matrix = fileterSingleMatrix_case1(matrix, filter_config)
    matrix = matrix[:, 0:-3]

    matrix_ori = matrix.copy()
    parameter_matrix = getParameterMatrix(matrix, cfg)
    importance_order, temp_total = getParameterImportance(np.array(parameter_matrix))

    sortParameterMatrix2(matrix, importance_order)
    print(np.shape(matrix))
    return jsonify({
        "matrix": matrix.tolist(),
        "order": importance_order.tolist(),
        "matrix_ori": matrix_ori.tolist()
    })

def dated_url_for(endpoint, **values):
    print("values", values)
    filename = None
    if endpoint == 'static':
        filename = values.get('filename', None)
    if filename:
        file_path = os.path.join(app.root_path, endpoint, filename)
        values['v'] = int(os.stat(file_path).st_mtime)
    result = url_for(endpoint, **values)
    print("result", result)
    return url_for(endpoint, **values)


if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.debug = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
    app.run(host="127.0.0.1", port=4999, debug=True)
