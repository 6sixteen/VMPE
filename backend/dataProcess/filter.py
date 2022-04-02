'''
Description:
Writer = "plh"
Data:2021/8/28
'''
import os.path as osp
from tool import getMarixFromCsv
import numpy as np

def fileterSingleMatrix_case1(matrix,filter_config):
    matrix1 = matrix.copy()
    matrix2 = matrix.copy()

    # print("type(filter_config)",type(filter_config["minValue"]))
    indices = np.where(matrix1[:, 5] >= filter_config["minValue"])[0]
    matrix1 = matrix1[indices]
    indices = np.where(matrix1[:, 5] <= filter_config["maxValue"])[0]
    matrix1 = matrix1[indices]

    indices = np.where(matrix2[:, 6] >= filter_config["minValue"])[0]
    matrix2 = matrix2[indices]
    indices = np.where(matrix2[:, 6] <= filter_config["maxValue"])[0]
    matrix2 = matrix2[indices]

    if matrix1.size > matrix2.size:
        return matrix1
    else:
        return matrix2

# 将可行解根据计算出来的面积进行分组
def fileterSingleMatrixPro_case1(matrix,filter_config):
    # 处理5、6列
    matrix1 = matrix.copy()
    matrix2 = matrix.copy()

    # print("type(filter_config)",type(filter_config["minValue"]))
    indices = np.where(matrix1[:, 5] >= (filter_config["minValue"] - filter_config["threshold"]))[0]
    matrix1 = matrix1[indices]
    indices = np.where(matrix1[:, 5] <= filter_config["maxValue"] + filter_config["threshold"])[0]
    matrix1 = matrix1[indices]

    indices = np.where(matrix2[:, 6] >= filter_config["minValue"] - filter_config["threshold"])[0]
    matrix2 = matrix2[indices]
    indices = np.where(matrix2[:, 6] <= filter_config["maxValue"] + filter_config["threshold"])[0]
    matrix2 = matrix2[indices]

    if matrix1.size > matrix2.size:
        n = 5
    else:
        n = 6

    # 开始
    number_array = []
    diff = (filter_config["maxValue"] - filter_config["minValue"])/filter_config['group_number']

    allNum = np.shape(matrix)[0]
    successNum = []
    failNum = []

    # 将分段后的每个端点写入一个数组
    number_array.append(filter_config["minValue"] - filter_config["threshold"])
    for num in range(filter_config['group_number']):
        number_array.append(filter_config["minValue"] + num * diff)
    number_array.append(filter_config["maxValue"])
    number_array.append(filter_config["maxValue"] + filter_config["threshold"])

    for i in range(len(number_array) - 1):
        j = 0
        for k in matrix:
            if k[n] >= number_array[i] and k[n] < number_array[i + 1]:
                j += 1
        allNum -= j
        if i == 0 or i == len(number_array) - 2:
            failNum.append(j)
        else:
            successNum.append(j)
    failNum.append(allNum)

    return {
        "successNum": successNum,
        "failNum": [failNum[1], failNum[2], failNum[0]]
    }

def filterSingleCsv_Case1(imgName,filterConfig,caseConfig):
    '''
    case1 在有结果的csv中筛选符合条件的数据
    :param imgName: imgName:String
    :param filterConfig: {}
    :param caseConfig: {caseFile:string,}
    :return:
    matrix: np.array
    '''
    caseBaseFile = caseConfig["caseBaseFile"]
    imgFile = osp.join(caseBaseFile,"parameter/splitData","suc_"+imgName+".csv")
    matrix = getMarixFromCsv(imgFile)
    matrix1 = matrix.copy()
    matrix2 = matrix.copy()

    indices = np.where(matrix1[:,5]>=filterConfig["minValue"])[0]
    matrix1 = matrix1[indices]
    indices = np.where(matrix1[:,5]<=filterConfig["maxValue"])[0]
    matrix1 = matrix1[indices]

    indices = np.where(matrix2[:,6]>=filterConfig["minValue"])[0]
    matrix2 = matrix2[indices]
    indices = np.where(matrix2[:,6]<=filterConfig["maxValue"])[0]
    matrix2 = matrix2[indices]

    if matrix1.size > matrix2.size:
        return matrix1
    else:
        return matrix2


def filterListsCsv_Case1(imgNames,filterConfig,caseConfig):
    res = {}
    for imgName in imgNames:
        matrix = filterSingleCsv_Case1(imgName,filterConfig,caseConfig)
        res[imgName] = matrix.tolist()
    return res



if __name__ == '__main__':

    a  = range(1,10,2)
    for item in a:
        print(item)
    print(a)
    input()
    caseConfig = {"caseBaseFile":"D:\\codeTest\\parameterExp\\backend-flask\\data"}
    imgName = "Image_20210812150335027.bmp"
    filterConfig = {"minValue":18000,"maxValue":25000}
    # filterSingleCsv_Case1(imgName,filterConfig,caseConfig)
    imgNames = ["Image_20210812150335027.bmp","Image_20210812150337954.bmp"]
    res = filterListsCsv_Case1(imgNames,filterConfig,caseConfig)

    Writer = "plh"
