'''
Description:
Writer = "plh"
Data:2021/9/7
'''
import glob
import os.path as osp
import numpy as np
import cv2
from scipy.spatial.distance import cdist
from sklearn.utils.graph_shortest_path import graph_shortest_path
import matplotlib.pyplot as plt
import time
from scipy import linalg


def randomFileName(prefix="projection", method="isomp", suffix=".png"):
    '''
    返回一個隨機生成的文件名
    :return:
    '''
    t = time.time()
    fileName = prefix + "_" + method + "_" + str(round(t)) + suffix
    return fileName


def make_adjacency(data, dist_func="euclidean", eps=1):
    """
    Step one of ISOMAP algorithm, make Adjacency and distance matrix

    Compute the WEIGHTED adjacency matrix A from the given data points.  Points
    are considered neighbors if they are within epsilon of each other.  Distance
    between points will be calculated using SciPy's cdist which will
    compute the D matrix for us.

    https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.distance.cdist.html

    INPUT
    ------
      data - (ndarray) the dataset which should be a numpy array
      dist_func - (str) the distance metric to use. See SciPy cdist for list of
                  options
      eps - (int/float) epsilon value to define the local region. I.e. two points
                        are connected if they are within epsilon of each other.

    OUTPUT
    ------
      short - (ndarray) Distance matrix, the shortest path from every point to
          every other point in the set, INF if not reachable.
    """
    n, m = data.shape
    dist = cdist(data.T, data.T, metric=dist_func)
    adj = np.zeros((m, m)) + np.inf
    bln = dist < eps
    adj[bln] = dist[bln]
    short = graph_shortest_path(adj)

    return short


def normalization2(data):
    dataCopy = data.copy()
    minAxis = np.min(dataCopy, axis=0)
    dataCopy[:, 0] = dataCopy[:, 0] / minAxis[0]
    dataCopy[:, 1] = dataCopy[:, 1] / minAxis[1]
    return dataCopy

def normalization(X):
    '''
    :param X:
    :return:
    '''

    x_min, x_max = np.min(X, 0), np.max(X, 0)
    X = (X - x_min) / (x_max - x_min)
    return X

def plot_graph2(components, x, imgPaths, filePath, filename, my_title="isomap", ):
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

    n, m = x.shape
    print(n)
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
        print(i, " ", x0, " ", y0, " ", x1, " ", y1)
        img = cv2.imread(imgPaths[img_num])
        imgr = cv2.resize(img, (200, 200))
        ax.imshow(imgr, aspect='auto', cmap=plt.cm.gray, interpolation='nearest', zorder=100000,
                  extent=(x0, x1, y0, y1))

    for i in range(imgNumShow):
        # img_num = np.random.randint(0, m)
        img_num = i
        x0 = components[img_num, 0] - (x_size / 2.)
        y0 = components[img_num, 1] - (y_size / 2.)
        x1 = components[img_num, 0] + (x_size / 2.)
        y1 = components[img_num, 1] + (y_size / 2.)
        plt.text(x1,y1,str(i),{"size":10,"color":"red"})

    # Show 2D components plot
    ax.scatter(components[:, 0], components[:, 1], marker='.', alpha=0.7)

    ax.set_ylabel('1')
    ax.set_xlabel('2')

    plt.savefig(osp.join(filePath, filename))
    return None


def isomap(d, dim=2):
    """
    take an adjacency matrix and distance matrix and compute the ISOMAP
    algorithm

    Take the shortest path distance matrix. This follows from the algorithm in
    class, create a centering matrix and apply it to the distance matrix D. Then
    we can compute the C matrix which will be used for the eigen-decomposion

    Find out more
      1. https://en.wikipedia.org/wiki/Isomap
      2. http://www-clmc.usc.edu/publications/T/tenenbaum-Science2000.pdf


    INPUT
    ------
      d - (ndarray) Distance matrix between nodes. Should be square.
      dim - (int) how many dimensions to reduce down too

    OUTPUT
    ------
      z - (ndarray) data projection into new reduced space. Each row maps back
          to one of the origional datapoints
    """

    n, m = d.shape
    h = np.eye(m) - (1 / m) * np.ones((m, m))
    d = d ** 2
    c = -1 / (2 * m) * h.dot(d).dot(h)
    evals, evecs = linalg.eig(c)
    idx = evals.argsort()[::-1]
    evals = evals[idx]
    evecs = evecs[:, idx]
    evals = evals[:dim]
    evecs = evecs[:, :dim]
    z = evecs.dot(np.diag(evals ** (-1 / 2)))

    return z.real


def isomapProject(imgPath, picPath, h=2592, w=1944, suffix="*.bmp"):
    img_paths = glob.glob(osp.join(imgPath, suffix))
    print("img_paths", img_paths)
    imgNum = len(img_paths)
    totalData = np.zeros((h * w, imgNum))
    for i, img_path in enumerate(img_paths):
        img = cv2.imread(img_path, 0)
        totalData[:, i] = np.squeeze(img.reshape((-1, 1))).T
    print("\nIsomap\n--------\n")
    D = make_adjacency(totalData, eps=5e8, dist_func="cityblock")
    z = isomap(D)
    zNorm = normalization(z)
    print("zNorm", zNorm)
    picName = randomFileName()
    plot_graph2(zNorm, x=totalData, imgPaths=img_paths, my_title="isomap resutlt", filename=picName, filePath=picPath)
    return {
        "location": zNorm
    }


if __name__ == '__main__':
    Writer = "plh"
