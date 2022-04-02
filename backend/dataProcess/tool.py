'''
Description:
Writer = "plh"
Data:2021/8/28
'''
import pandas as pd
import os.path as osp
import os
import numpy as np
import json
import time
import glob
import yaml

def bit():
    import blocksmith

    key = '7011da4a47f6c85a21fe6c6cf1285c0fa06915871744ab1e5a5b741027884d00'

    address = blocksmith.EthereumWallet.generate_address(key)
    print(address)
    # 0x1269645a46a3e86c1a3c3de8447092d90f6f04ed

    checksum_address = blocksmith.EthereumWallet.checksum_address(address)
    print(checksum_address)
    # 0x1269645a46A3e86c1a3C3De8447092D90f6F04ED


def data2number(data, splitStr="/"):
    """
    把各个变量的参数都提取出来
    如果是失败的参数，末尾添加 -1
    :param data: ['1', 'Threshold0/InputControl/minGray/20', 'Threshold0/InputControl/maxGray/40', 'OpeningCircle0/InputControl/2', 'SelectShape1/InputControl/min/0.8', 'FinalResult0/0', 'FinalResult/Error']
    2074,Threshold0/InputControl/minGray/22,Threshold0/InputControl/maxGray/44,OpeningCircle0/InputControl/2,SelectShape1/InputControl/min/0.83,FinalResult0/2,FinalResult1/12459.9271205567,FinalResult2/18642.1
    :param splitStr:
    :return:
    [1.0, 20.0, 40.0, 2.0, 0.8, 0.0, -1]
    """
    returnData = []
    for item in data:
        itemSplitDot = item.split(splitStr)
        param = itemSplitDot[len(itemSplitDot) - 1]
        try:
            paramF = float(param)
        except Exception as ex:
            paramF = -1
        returnData.append(paramF)
    return returnData


# 和文件读取有关
def list2csv(fileName, list):
    test = pd.DataFrame(data=list)  # 数据有三列，列名分别为one,two,three
    test.to_csv(fileName, encoding='gbk')


def getMarixFromCsv(file):
    '''
    read matrix P from csv
    :param file:csv filePath of matrix P
    :return: numpy
    '''
    data = pd.read_csv(file)
    # row = list(data.index.values)
    # column = list(data.columns.values)
    dataNp = data.values
    dataNp = dataNp[:, 1:]  # 去掉索引
    return dataNp


def addJson(file, key, value):
    '''
    在json文件中添加新的key-value；要求原來的數據是dict
    :param file:
    :param key:
    :param value:
    :return:
    '''
    with open(file, "r") as f:
        data = json.load(f)
    data[key] = value
    with open(file, "w") as f:
        json.dump(data, f, indent=4)


def addJson1(file, key1, key2, value):
    with open(file, "r") as f:
        data = json.load(f)
    if key1 not in data.keys():
        data[key1] = {}
    data[key1][key2] = value
    with open(file, "w") as f:
        json.dump(data, f, indent=4)


def judgeParametersCal(img_names, json_file):
    '''
    判断是否已经计算过多张图片的参数集合，如果计算过则返回相应信息
    :param img_names:
    :param json_file:
    :return:
    '''
    img_names_l = len(img_names)
    with open(json_file, "r") as f:
        data = json.load(f)
    for key, item in data.items():
        # 判断img_names 是否被 item["imgNames"]包含
        # 1.len(A交B) ==len(A)
        intersection = list(set(img_names).intersection(set(item["imgNames"])))
        if img_names_l == len(intersection):
            return key, item
    return None, None


def imageIndices(img_file, json_file, suffix="*.bmp"):
    img_paths = glob.glob(osp.join(img_file, suffix))
    res = {}
    for i, img_path in enumerate(img_paths):
        img_name = img_path.split("\\")[-1]
        res[img_name] = i
    with open(json_file, "w", ) as f:
        json.dump(res, f, indent=4)
    return res


def getParameters(img_indices, filter_config, json_file):
    with open(json_file, "r") as f:
        data = json.load(f)
    if filter_config in data.keys() and img_indices in data[filter_config].keys():
        return data[filter_config][img_indices]
    else:
        return None


def getParameterSetsIntersectionFromCsv(img_names, filter_config, filter_method):
    '''因为文件导入的问题 失败， 新建文件 可能能解决'''
    with open(yaml_file, 'r') as f:
        cfg = yaml.safe_load(f)
    print(cfg)
    matrices = []
    for img_name in img_names:
        img_file = osp.join(cfg["caseBaseFile"], "parameter/splitData", "suc_" + img_name + ".csv")
        matrix = getMarixFromCsv(img_file)
        matrix = filter_method(matrix, filter_config)
        matrix = matrix[:, 0:-2]
        matrices.append(matrix)
    insection_matrix = getIntersectionFromMatrixs(matrices)
    return insection_matrix


# 和文件读取有关
def imgs2Indices(img_names, img_indices):
    '''
    图片名称到索引转换
    :param img_names:
    :param img_indices:
    :return:
    '''
    res = ""
    for img in img_names:
        num = img_indices[img]
        res = res + "_" + str(num)
    return res[1:]


def searchCombination(file, value, keyCompare):
    '''
    檢索索引文件，觀察是否已經生成combination文件
    :param file: string
    :param value: {}
    :param keyCompare: [string,...]
    :return:
    flag:True 已經存在數據
    item["fileName"]: 文件名稱
    '''
    with open(file, "r") as f:
        data = json.load(f)
    for key, item in data.items():
        flag = True
        for key2 in keyCompare:
            difference = list(set(value[key2]).difference(set(item[key2])))
            difference2 = list(set(item[key2]).difference(set(value[key2])))
            if len(difference) != 0 or len(difference2) != 0:
                flag = False
                break
        if flag:
            return flag, key
    return False, []


def mkdir(file):
    '''
    创建文件夹
    :param file:
    可以用相对地址，会自动在前面加上当前运行文件的地址
    也可以用绝对地址
    :return:
    '''
    if not osp.exists(file):
        os.mkdir(file)


def getImgNames(file):
    '''
    遍历图片文件夹，获得所有图片的名字
    :param file:
    :return:
    '''
    for root, dirs, files in os.walk(file):
        imgNames = files
    return imgNames


# 组合数有关
def nFactorial(start, final, step=1):
    '''
    start 到final的阶层
    :param start:
    :param final:
    :param step:
    :return:
    '''
    sum = 1
    for i in range(start, final + 1, step):
        sum = sum * i
    return sum


def calCnm(n, m):
    '''
    Cnm 的组合数
    :param n: n这个数大
    :param m:
    :return:
    '''
    a = nFactorial(n - m + 1, n)
    b = nFactorial(1, m)
    return int(a / b)


def calCnmSum(n, m):
    '''
    sum of Cn1+Cn2+...+Cnm
    :param n:  n这个数大
    :param m:
    :return:
    '''
    sum = 0
    for i in range(1, m + 1):
        sum = sum + calCnm(n, i)
    return sum


# 组合数有关

# 格式处理
def formatChange(data):
    '''
    参数集合部分从list->array 然后去掉结果部分
    :param data: dict
    {
        "imgNames":
            [[],[],...],
        ...
    }
    :return: res: dict
    {
        "imgNames":
            [[],[],...] :np.array,
        ...
    }
    '''
    res = data.copy()
    for key, item in res.items():
        if len(item) != 0:
            itemN = np.array(item)
            itemN = itemN[:, :-2]
            res[key] = itemN
        else:
            res[key] = np.array(item)
    return res


def readTxt(filename, formatChange=None):
    '''
    读取txt文件，返回[[row],[row]...]
    :param filename:
    :return:
    '''
    res = []
    with open(filename, "r") as f:
        for line in f.readlines():
            line = line.strip("\n").split(" ")
            if formatChange is not None:
                line = formatChange(line)
            res.append(line)
    return res

def readTxtPeremeter(filename, formatChange=None):
    '''
    读取txt文件，返回[[row],[row]...]
    :param filename:
    :return:
    '''
    res = {}
    with open(filename, "r") as f:
        for line in f.readlines():
            line = line.strip("\n").split(" ")
            if formatChange is not None:
                name, line = formatChange(line)
            res[name] = line
    return res


# 格式处理
def formatChangeParameter(line):
    newline = line[0] + '_' + line[1] + '_' + line[2] + '_' + line[3] + '_' + line[4]
    return newline, line[5]

def formatChangeGraph(line):
    newline = []
    newline.append(line[0])
    newline.append(line[1])
    newline.append(float(line[2]))
    return newline


def formatChangeGraph2(graph):
    '''
    getGraph 中返回的数据是比较详细的，做进一步的处理，方便下一步聚类的操作
    :param graph:
    :return:
    '''
    newgraph = []
    for item in graph:
        newitem = []
        newitem.append(item[0])
        newitem.append(item[1])
        newitem.append(item[2])
        newgraph.append(newitem)
    return newgraph


def formatChangeGraph3(graph, cluster_matrix=None):
    '''
    将getGraph返回的数据处理成力导向图能接受的数据格式
    :param graph:
    :return:
    '''
    res = {}
    nodestemp = {}
    links = []

    for item in graph:
        if item[0] not in nodestemp.keys():
            nodestemp[item[0]] = item[3]
        if item[1] not in nodestemp.keys():
            nodestemp[item[1]] = item[4]
        if item[2] != 0:
            link = {}
            link["source"] = item[0]
            link["target"] = item[1]
            link["unionDec"] = item[2]
            links.append(link)

    res["links"] = links
    nodes = []
    for key in nodestemp.keys():
        node = {}
        node["id"] = key
        node["unionNum"] = nodestemp[key]
        if cluster_matrix is not None:
          node["cluster_matrix"] = cluster_matrix[key].tolist()
        nodes.append(node)
    res["nodes"] = nodes

    return res


def formatChangeGraph4(graph, cluster_res,add_info):
    '''
    将getGraph返回的数据处理成力导向图能接受的数据格式,并将add_info中的额外节点信息加入到结果中去
    :param graph:
    :return:
    '''
    res = {}
    nodestemp = {}
    links = []
    for item in graph:
        if item[0] not in nodestemp.keys():
            nodestemp[item[0]] = item[3]
        if item[1] not in nodestemp.keys():
            nodestemp[item[1]] = item[4]
        if item[2] != 0:
            link = {}
            link["source"] = item[0]
            link["target"] = item[1]
            link["unionDec"] = item[2]
            links.append(link)

    res["links"] = links
    nodes = []
    for key in cluster_res:
        node = {}
        node["id"] = key
        node["unionNum"] = add_info[key]["n_success_filter"]
        for key1 in add_info[key].keys():
            node[key1] = add_info[key][key1]
        nodes.append(node)
    res["nodes"] = nodes

    return res


# 和文件命名有关
def randomFileName(prefix="combination", suffix=".json"):
    '''
    返回一個隨機生成的文件名
    :return:
    '''
    t = time.time()
    fileName = prefix + str(round(t)) + suffix
    return fileName


def createFilename(prefix, suffix, connector, parameters):
    filename = prefix
    for key in parameters.keys():
        filename = filename + connector + str(key) + connector + str(parameters[key])
    filename = filename + suffix
    return filename


# others
def calTotalParameterSets(cfg):
    n = 1
    temp = 1000
    parameterConfig = cfg["parameterConfig"]
    for key in parameterConfig.keys():
        if parameterConfig[key]["use"]:
            n = n * (parameterConfig[key]["maxValue"] * temp - parameterConfig[key]["minValue"] * temp) / (parameterConfig[key]["step"] * temp) + n  # 因为首尾的问题，所以要先加1
    return int(n)

def removeBracketList(l):
    '''
    去掉list中的所有括号
    :param l:
    :return:
    '''
    if not isinstance(l,list):
        return l
    new_l = []
    for item in l:
        if isinstance(item, list):
            new_l.extend(removeBracketList(item))
        else:
            new_l.append(item)
    return new_l

def list2str(l,connector='_',format=None):
    '''
    把list中的内容变成str
    :param l:
    :param connector:
    :param format:
    :return:
    '''
    if not isinstance(l,list):
        return str(l)
    res = ""
    for item in l:
        if format is not None:
            res = res+format(item)+connector
        else:
            res = res + str(item) + connector
    return res[:-1]

def getIds(l,sort=True):
    '''
    得到图片的id
    :param l: [1,2,3,4]
    :param sort:
    :return: "1_2_3_4"
    '''
    if len(l)==0:
        return []
    res = ""
    l_c = l.copy()
    if sort:
        l_c.sort()
    for id in l_c:
        res = res + "_" + str(id)
    return res[1:]

if __name__ == '__main__':
    l=[15,[2,4]]
    a = removeBracketList(l)
    print(a)
    input()
    # l = 15
    # res = list2str(l)
    # print(res)
    # input()
    # l = [1,2,3]
    # l = [[1,2],3]
    # l = [[1],2,3]
    # new_l = reBracketList(l)
    # print(new_l)
    # input()

    # yaml_file = "../config.yml"
    # with open(yaml_file, 'r') as f:
    #     cfg = yaml.safe_load(f)
    # n = calTotalParameterSets(cfg)
    # print(n)
    # input()

    # img_names = ["Image_20210812150340363.bmp",
    #                           "Image_20210812150343338.bmp",
    #                           "Image_20210812150345651.bmp"]
    # filter_config ={"minValue":18000,"maxValue":25000}
    #
    # matrix = getParameterSetsIntersectionFromCsv(img_names, filter_config, fileterSingleMatrix_case1)
    # print(matrix)
    # input()

    filename = "D:\codeTest\parameterExp\data\case1\graph\graph_imgs_0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20_21_edge_jac_filter_23000_25000_process_1_0.3.txt"
    res = readTxt(filename, formatChangeGraph)

    # print(res)
    # imgNames = getImgNames("D:\codeTest\parameterExp\data\case1\img")
    # print("imgNames",imgNames)
    # a = np.array([[]])
    # print(np.shape(a))
    # print(a)
    #

    # img_file = "D:\codeTest\parameterExp\data\case1\img"
    # json_file = "D:\codeTest\parameterExp\data\case1\combination\img_indices.json"
    # res = imageIndices(img_file, json_file)

    # a = np.array([[1,2,3],[4,5,6]])
    # b = a.tolist()

    # bit()

    # img_names = ["Image_20210812150340363.bmp",
    #              "Image_20210812150343338.bmp",
    #              "Image_20210812150345651.bmp"]
    # img_indices = {
    #     "Image_20210812150340363.bmp": 0,
    #     "Image_20210812150343338.bmp": 1,
    #     "Image_20210812150345651.bmp": 2,
    #     "Image_20210812150348106.bmp": 3,
    #     "Image_20210812150439515.bmp": 4,
    #     "Image_20210812150442099.bmp": 5,
    #     "Image_20210812150446018.bmp": 6,
    #     "Image_20210812150449667.bmp": 7,
    #     "Image_20210812150507378.bmp": 8,
    #     "Image_20210812150735634.bmp": 9,
    #     "Image_20210812150738139.bmp": 10,
    #     "Image_20210812150742075.bmp": 11,
    #     "Image_20210812150745340.bmp": 12,
    #     "Image_20210812150748010.bmp": 13,
    #     "Image_20210812150752110.bmp": 14,
    #     "Image_20210812150754923.bmp": 15,
    #     "Image_20210812150757138.bmp": 16,
    #     "Image_20210812150800770.bmp": 17,
    #     "Image_20210812150954922.bmp": 18,
    #     "Image_20210812151017347.bmp": 19,
    #     "Image_20210812151053418.bmp": 20,
    #     "Image_20210812151121185.bmp": 21
    # }
    # res = imgs2Indices(img_names, img_indices)
    # print(res)

    Writer = "plh"
