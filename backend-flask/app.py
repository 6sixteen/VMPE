'''
Description:
Writer = "plh"
Data:2021/8/28
'''
from flask import Flask, render_template, url_for, jsonify, request
import os
import os.path as osp
import pandas as pd
import numpy as np
from datetime import timedelta
from flask_cors import *
import yaml
import sys
import json

root = os.path.abspath("./")
print(root)
sys.path.append(os.path.join(root, "dataProcess"))

from filter import filterListsCsv_Case1
from preProcess import divideDatas
from combination import getNodeAndLinks,getRingCombinationData
from tool import formatChange, searchCombination, randomFileName, addJson
from projection.isomap import isomapProject

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
    print("flag",flag)
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
    # 因为传进来的数据都是字符串
    filterConfig = request.json.get("filterConfig")

    #当前组合的索引
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
        res = getRingCombinationData(data,index)

        fileName = randomFileName(prefix="combinationRing")
        addJson(combinationJson, fileName, request.json)
        with open(osp.join(caseConfig["combinationFile"], fileName), "w") as f:
            for item in res["nodes"]:
                item["matrix"] = item["matrix"].tolist()
            json.dump(res, f, indent=4)
        return jsonify({"res": res})

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
    app.run(host="127.0.0.1", port="4999", debug=True)
