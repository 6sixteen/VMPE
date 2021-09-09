'''
Description:
Writer = "plh"
Data:2021/8/28
'''
import numpy as np
from tool import *
import shutil
import os.path as osp
import os


def divideSingleData(csvPath):
    '''
    把一张图片的csv数据分成true 和 error 两部分数据
    :param fileName:
    :return:
    '''
    with open(csvPath) as f:
        datas = f.readlines()
    dataNum = len(datas)
    # print("data number is ", dataNum)
    flowInfo = datas.pop(0)
    resultData = []  # 存放有结果的数据
    noResultData = []
    for item in range(0, dataNum - 1):
        data = datas[item]
        data = data.rstrip('\n')
        data = data.split(",")
        dataLen = len(data)
        dataF = data2number(data)  # dataF 形如[1.0, 20.0, 40.0, 2.0, 0.8, 0.0, -1]
        if (data[dataLen - 1] == 'FinalResult/Error'):
            noResultData.append(dataF[1:])
        else:
            resultData.append(dataF[1:])
    return resultData, noResultData


def divideDatas(file, reDivide="Y"):
    '''

    :param file:  caseBaseFile: String
    :param reDivide:
    :return:
    '''
    success = "suc_"
    error = "ero_"
    splitDataFile = osp.join(file, "parameter/splitData")
    parameterFile = osp.join(file, "parameter")
    created = osp.exists(splitDataFile)
    if reDivide == "Y" or not created:
        if created:
            shutil.rmtree(splitDataFile)
        os.mkdir(splitDataFile)
        for root, dirs, files in os.walk(parameterFile):
            for file in files:
                if (file.find("csv") >= 0):
                    # imgName = file.split(".")[0] + ".jpg"
                    # imgPath = os.path.join(root, "img", imgName)
                    csvPath = os.path.join(root, file)
                    resultData, noResultData = divideSingleData(csvPath)
                    successPath = osp.join(splitDataFile, success + file)
                    errorPath = osp.join(splitDataFile, error + file)
                    list2csv(successPath, resultData)
                    list2csv(errorPath, noResultData)
            break  # for in os.walk 新增加的文件会被遍历到


if __name__ == '__main__':
    #resultData, noResultData = divideSingleData("..\..\data\case1/parameter/Image_20210812150335027.bmp.csv")
    divideDatas("../../data/case1")
    Writer = "plh"
