'''
Description:
Writer = "plh"
Data:2021/9/8
'''
import glob
import os.path as osp
import numpy as np
import cv2
import json
import time
import matplotlib.pyplot as plt


def normalization(X):
    '''
    :param X:
    :return:
    '''

    x_min, x_max = np.min(X, 0), np.max(X, 0)
    X = (X - x_min) / (x_max - x_min)
    return X


def preImgData(img_file, h=2592, w=1944, suffix="*.bmp"):
    '''
    预处理图片数据，将图片展开成一维行向量
    :param img_file:
    :param h:
    :param w:
    :param suffix:
    :return:
    '''
    img_paths = glob.glob(osp.join(img_file, suffix))
    number = len(img_paths)
    data = np.zeros((number, h * w))
    for i, img_path in enumerate(img_paths):
        img = cv2.imread(img_path, 0)
        data[i, :] = np.squeeze(img.reshape((1, -1)))
    return data


def randomFileName(prefix="projection", method="isomp", suffix=".png"):
    '''
    返回一個隨機生成的文件名
    :return:
    '''
    t = time.time()
    fileName = prefix + "_" + method + "_" + str(round(t)) + suffix
    return fileName


def write2Json(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)


def readFromJson(file):
    with open(file, "r") as f:
        data = json.load(f)
    return data


def plot_graph(point_data, file_name):
    '''
    画scater
    :param point_data:np.array，(n,2)
    :return:
    '''
    # plt.plot的第一个参数为x = [x1, x2, x3,…, xn], 第二个参数为y = [y1, y2, y3,…, yn]
    plt.clf()
    x = point_data[:,0].tolist()
    y = point_data[:,1].tolist()
    plt.scatter(x=x, y=y)
    for i in range(len(x)):
        # img_num = np.random.randint(0, m)
        plt.text(x[i], y[i], str(i), {"size": 10, "color": "red"})
    plt.savefig(file_name)


def plot_graph2(components, x, imgPaths, filename, my_title="isomap"):
    """
    Plot the components and overlay the images that the points were derived
    from over the chart

    plotting code inspired by:
        http://benalexkeen.com/isomap-for-dimensionality-reduction-in-python/

    INPUT
    -----
        components - (ndarray) the new reduced matrix (n x 2)
        x - (ndarray) The original images (n x 4096)
        filename - (str) name of the file to be saved
        my_title - (str) title on the chart

    OUTPUT
    ------
      Will save an image in directory "./img" with the provided filename
    """
    plt.clf()
    n, m = x.shape
    fig = plt.figure()
    fig.set_size_inches(10, 10)
    ax = fig.add_subplot(111)
    ax.set_title(my_title)
    ax.set_xlabel('Component: 1')
    ax.set_ylabel('Component: 2')

    # Show 40 of the images ont the plot
    x_size = (max(components[:, 0]) - min(components[:, 0])) * 0.08
    y_size = (max(components[:, 1]) - min(components[:, 1])) * 0.08

    imgNumMin = 20
    imgNumShow = (n if (n > imgNumMin) else imgNumMin)
    for i in range(imgNumShow):
        # img_num = np.random.randint(0, m)
        img_num = i
        x0 = components[img_num, 0] - (x_size / 2.)
        y0 = components[img_num, 1] - (y_size / 2.)
        x1 = components[img_num, 0] + (x_size / 2.)
        y1 = components[img_num, 1] + (y_size / 2.)
        # plt.text(x0,y0,imgPaths[img_num].split(".")[0][-7:-1])
        # print(i," ",x0," ",y0," ",x1," ",y1)
        img = cv2.imread(imgPaths[img_num])
        imgr = cv2.resize(img, (200, 200))
        ax.imshow(imgr, aspect='auto', cmap=plt.cm.gray, interpolation='nearest', zorder=100000,
                  extent=(x0, x1, y0, y1))
        # left, right, bottom, top
    for i in range(imgNumShow):
        # img_num = np.random.randint(0, m)
        img_num = i
        x0 = components[img_num, 0] - (x_size / 2.)
        y0 = components[img_num, 1] - (y_size / 2.)
        x1 = components[img_num, 0] + (x_size / 2.)
        y1 = components[img_num, 1] + (y_size / 2.)
        plt.text(x1, y1, str(i), {"size": 10, "color": "red"})

    # Show 2D components plot
    ax.scatter(components[:, 0], components[:, 1], marker='.', alpha=0.7)

    ax.set_ylabel('1')
    ax.set_xlabel('2')

    plt.savefig(filename)
    return None


if __name__ == '__main__':
    # file = "D:\\codeTest\\parameterExp\\backend-flask\\data\\img"
    # data = preImgData(file)

    # a = np.array([[1,2,3],[4,5,6]])
    # b = np.squeeze(a.reshape((-1, 1)))
    # c = np.squeeze(a.reshape((-1, 1))).T
    # d = (b==c)
    # print(b)
    # print(b.shape)
    # print(d)
    Writer = "plh"
