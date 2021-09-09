'''
Description:
Writer = "plh"
Data:2021/9/8
'''
import glob
import os.path as osp
import os
import numpy as np
import cv2
from scipy.spatial.distance import cdist
from sklearn.utils.graph_shortest_path import graph_shortest_path
import matplotlib.pyplot as plt
import time
from scipy import linalg
from sklearn import (manifold, datasets, decomposition, ensemble,
                     discriminant_analysis, random_projection, neighbors)
from projectTool import preImgData, write2Json, randomFileName, normalization, plot_graph2, readFromJson, plot_graph


# def tsneProjection(img_file, h=2592, w=1944, suffix="*.bmp", norm=None, write_json=False, json_path="/result"):
#     x = preImgData(img_file, h, w, suffix)
#     tsne = manifold.TSNE(n_components=2, init='pca', random_state=0)
#     x_tsne = tsne.fit_transform(x)
#     if norm == "normalization":
#         x_tsne = normalization(x_tsne)
#     if write_json:
#         file_name = randomFileName(method="tsne", suffix=".json")
#         if not osp.exists(json_path):
#             os.mkdir(json_path)
#         res = {"data": x_tsne.tolist()}
#         write2Json(osp.join(json_path, file_name), res)
#     return x_tsne

def tsneProjection(img_file, h=2592, w=1944, suffix="*.bmp", norm=None, save_json=None, save_scatter=None,
                   save_img_scatter=None):
    x = preImgData(img_file, h, w, suffix)
    tsne = manifold.TSNE(n_components=2, init='random', random_state=0)
    x_tsne = tsne.fit_transform(x)
    if norm == "normalization":
        x_tsne = normalization(x_tsne)
    if save_json is not None:
        res = {"data": x_tsne.tolist()}
        write2Json(save_json, res)
    if save_scatter is not None:
        plot_graph(x_tsne, save_scatter)
    if save_img_scatter is not None:
        img_paths = glob.glob(osp.join(img_file, "*.bmp"))
        plot_graph2(x_tsne, x, img_paths, save_img_scatter, my_title="tsne")
    return x_tsne


if __name__ == '__main__':
    # t0 = time.time()
    # file_path = "D:\codeTest\parameterExp\data\case1\img"
    # # file_path = "D:\codeTest\parameterExp\\backend-flask\data\img"
    # json_path = "D:\codeTest\parameterExp\data\case1\projection"
    # x_tsne = tsneProjection(img_file=file_path, write_json=True, json_path=json_path, norm="normalization")
    # print(x_tsne)
    # t1 = time.time()
    # print("time cost", t1 - t0)

    # 单独生成结果图片代码
    # file_path = "D:\codeTest\parameterExp\data\case1\img"
    # json_file = "D:\codeTest\parameterExp\data\case1\projection\projection_tsne_1631083715.json"
    # img_scatter_filename = "D:\codeTest\parameterExp\data\case1\projection\projection_tsne.png"
    # scatter_filename = "D:\codeTest\parameterExp\data\case1\projection\projection_tsne_scatter.png"
    # t0 = time.time()
    # tsneProjection(file_path, norm="normalization", save_json=json_file, save_scatter=scatter_filename,save_img_scatter=img_scatter_filename)
    # t1 = time.time()
    # print("time cost", t1 - t0)

    # 用125张图片测试一下
    file_path = "C:\\Users\\plh\\MVS\\Data"
    json_file = "D:\codeTest\parameterExp\data\case2\projection\projection_tsne_125.json"
    img_scatter_filename = "D:\codeTest\parameterExp\data\case2\projection\projection_tsne_125.png"
    scatter_filename = "D:\codeTest\parameterExp\data\case2\projection\projection_tsne_scatter_125.png"
    t0 = time.time()
    tsneProjection(file_path, norm="normalization", save_json=json_file, save_scatter=scatter_filename,
                   save_img_scatter=img_scatter_filename)
    t1 = time.time()
    print("time cost", t1 - t0)
    # file_name = randomFileName(method="tsne", suffix=".json")
    Writer = "plh"
