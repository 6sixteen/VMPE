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
        json.dump(data, f,indent=4)


# 和文件读取有关

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
            if len(difference) != 0 or len(difference2)!=0:
                flag = False
                break
        if flag:
            return flag, key
    return False, []

def randomFileName(prefix="combination",suffix=".json"):
    '''
    返回一個隨機生成的文件名
    :return:
    '''
    t = time.time()
    fileName = prefix + str(round(t))+suffix
    return fileName

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


# 格式处理
if __name__ == '__main__':
    # imgNames = getImgNames("D:\codeTest\parameterExp\data\case1\img")
    # print("imgNames",imgNames)
    # a = np.array([[]])
    # print(np.shape(a))
    # print(a)
    #
    Writer = "plh"
