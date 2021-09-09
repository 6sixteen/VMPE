'''
Description:
Writer = "plh"
Data:2021/8/28
'''
import os.path as osp
from tool import getMarixFromCsv
import numpy as np

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
    caseConfig = {"caseBaseFile":"D:\\codeTest\\parameterExp\\backend-flask\\data"}
    imgName = "Image_20210812150335027.bmp"
    filterConfig = {"minValue":18000,"maxValue":25000}
    # filterSingleCsv_Case1(imgName,filterConfig,caseConfig)
    imgNames = ["Image_20210812150335027.bmp","Image_20210812150337954.bmp"]
    res = filterListsCsv_Case1(imgNames,filterConfig,caseConfig)

    Writer = "plh"
