'''
Description:
Writer = "plh"
Data:2021/9/13
'''
import cv2
import numpy as np
import glob
import os.path as osp
from imgSimilarity import photoLand
import matplotlib.pyplot as plt
import copy

# h=2592, w=1944
def getNeighbor(location, l):
    '''
    得到某个点的领域点
    :param localtion:[x,y]
    :param l: 1
    :return:
    '''
    neighbor = []
    row = range(-l, l + 1, 1)
    col = range(-l, l + 1, 1)
    for r in row:
        for c in col:
            if r == 0 and c == 0:
                pass
            else:
                neighbor.append([location[0] + r, location[1] + c])
    return neighbor


def getAdjacent(location):
    '''
    得到某个点直接相邻的四个点
    :param location:
    :return:
    '''
    adjacent_location = []
    adjacent_location.append([location[0] + 1, location[1]])
    adjacent_location.append([location[0] - 1, location[1]])
    adjacent_location.append([location[0], location[1] + 1])
    adjacent_location.append([location[0], location[1] - 1])
    return adjacent_location


def getEmptyNeighbor(locations, neighbor):
    '''
    计算空的neighbor
    :param locations:[[0,0],[2,3],..]
    :param neighbor: [[1,1],[2,3],..]
    :return:
    '''
    empty_neghbors = []
    for point in neighbor:
        flag = True
        for point2 in locations:
            if point[0] == point2[0] and point[1] == point2[1]:
                flag = False
                break
        if flag:
            empty_neghbors.append(point)
    return empty_neghbors


def getFullNeighbor(locations, target):
    '''
    返回target中已经有图片的位置
    :param locations: [[0,0,0],[2,3,1],..]
    :param target: [[1,1],[2,3],..]
    :return:
    '''
    res = []
    for point in locations:
        for point2 in target:
            if point[0] == point2[0] and point[1] == point2[1]:
                res.append(point)
                break
    return res


def shape2matrix(shape):
    '''
    把shape转变成matrix 方便后续的处理
    :param shape:
    :return:
    '''
    row = 0
    col = 0
    max_row = 0
    max_col = 0
    for item in shape:
        if item[0] < row:
            row = item[0]
        if item[1] < col:
            col = item[1]
        if item[0] > max_row:
            max_row = item[0]
        if item[1] > max_col:
            max_col = item[1]
    max_row += (-row)
    max_col += (-col)
    m = np.zeros((max_row + 1, max_col + 1))
    for item in shape:
        m[item[0] - row, item[1] - col] = 1
    return m


def rectConstraint(matrix):
    '''
    保持整体布局成正方形的约束，越大表示越趋向与正方形
    :param matrix:
    :return:
    '''
    indices = np.where(matrix == 1)
    row_max = np.max(indices[0])
    col_max = np.max(indices[1])
    res = col_max / row_max if row_max > col_max else row_max / col_max
    return res


def emptyConstraint(item, shape):
    '''
    空洞填补约束，判断空洞的类型，返回不同的值
    :param item:[x,y]
    :param shape:
    :return:
    '''
    adjacent = getAdjacent(item)
    adjacent_full = getFullNeighbor(shape, adjacent)
    num = len(adjacent_full)
    if num == 2:
        return 1.05
    elif num == 3:
        return 1.15
    elif num == 4:
        return 1.25
    else:
        return 1


def gravityConstraint(item, shape):
    pass

def standardLocation(locations):
    '''
    把locations 中的最小值变成0
    :param locations:[y,x,indices]
    :return:localtions,
    max_row:
    max_col:
    '''
    row = 0
    col = 0
    max_row = 0
    max_col = 0
    for item in locations:
        if item[0] < row:
            row = item[0]
        if item[1] < col:
            col = item[1]
        if item[0] > max_row:
            max_row = item[0]
        if item[1] > max_col:
            max_col = item[1]
    for item in locations:
        item[0] -=row
        item[1] -=col
    max_row += (-row)
    max_col += (-col)
    return locations,max_row,max_col

def imgLayout(img_file, suffix="*.bmp", resize_ratio=(324, 243), sorted=None, imgh=324, imgw=243, similarity=None,
              AR=0.8, H=1, G=0.8):
    img_paths = glob.glob(osp.join(img_file, suffix))
    imgs = []
    for i, img_path in enumerate(img_paths):
        img = cv2.imread(img_path)
        if resize_ratio is not None:
            imgs.append(cv2.resize(img, resize_ratio))
        else:
            imgs.append(img)
    # sorted img
    if sorted is not None:
        imgs = sorted(imgs)
    locations = []
    shape = []
    for i, img in enumerate(imgs):
        if i == 0:
            locations.append([0, 0, 0])
            shape.append([0, 0])
        else:
            # calculate limited distance l
            # 外围矩形的大小，越大可放置的选择越多
            # 先设定maximum = 1
            l = 1
            location_pre = locations[i - 1]
            neighbors = getNeighbor(location_pre, l)
            empty_neighbor = getEmptyNeighbor(locations, neighbors)
            similarity_scores = []
            max_s = 0
            temp_neighbor = [0, 0, i]
            for neighbor_item in empty_neighbor:
                neighbor_item_adjacent = getAdjacent(neighbor_item)
                neighbor_item_adjacent_full = getFullNeighbor(locations, neighbor_item_adjacent)
                temp_score = 0
                for item in neighbor_item_adjacent_full:
                    img_pre = imgs[item[2]]
                    temp_score += similarity(img, img_pre)
                temp_shape = shape
                temp_shape.append(neighbor_item)
                temp_matrix = shape2matrix(temp_shape)
                temp_score += AR * rectConstraint(temp_matrix)
                temp_score += H * emptyConstraint(neighbor_item, shape)
                # temp_score += G * gravityConstraint(neighbor_item, shape)
                if temp_score > max_s:
                    max_s = temp_score
                    temp_neighbor[0] = neighbor_item[0]
                    temp_neighbor[1] = neighbor_item[1]
            locations.append(temp_neighbor)
            shape.append([temp_neighbor[0], temp_neighbor[1]])
    return locations


# def drawRes(location, imgs, h=324, w=243, save_name="layout.jpg"):
#     用plt画的 没成功
#     plt.clf()
#     fig = plt.figure()
#     fig.set_size_inches(10, 10)
#     ax = fig.add_subplot(111)
#     row = 0
#     col = 0
#     max_row = 0
#     max_col = 0
#     for item in location:
#         if item[0] < row:
#             row = item[0]
#         if item[1] < col:
#             col = item[1]
#         if item[0] > max_row:
#             max_row = item[0]
#         if item[1] > max_col:
#             max_col = item[1]
#     max_row += (-row)
#     max_col += (-col)
#
#     for item in location:
#         y0 = (item[0] + max_row)/10
#         x0 = (item[1] + max_col)/10
#         y1 = y0 + 0.1
#         x1 = x0 + 0.1
#         print(x0, x1, y0, y1)
#         img = cv2.resize(imgs[item[2]], (200, 200))
#         ax.imshow(img, aspect='auto', cmap=plt.cm.gray, interpolation='nearest', zorder=100000,
#                   extent=(x0, x1, y0, y1))
#     plt.savefig(save_name)

def drawRes(location, imgs, h=243, w=324, save_name="layout.jpg"):
    row = 0
    col = 0
    max_row = 0
    max_col = 0
    for item in location:
        if item[0] < row:
            row = item[0]
        if item[1] < col:
            col = item[1]
        if item[0] > max_row:
            max_row = item[0]
        if item[1] > max_col:
            max_col = item[1]
    print("row",row)
    print("col",col)
    max_row += (-row)
    max_col += (-col)
    max_row += 1
    max_col += 1
    matrix = np.zeros((max_row * h, max_col * w, 3))
    print("max_row", max_row)
    print("max_col", max_col)
    for item in location:
        y0 = (item[0] - row) * h
        x0 = (item[1] - col) * w
        print("x0", x0)
        print("y0", y0)
        print("img size",np.shape(imgs[item[2]]))
        matrix[y0:y0 + h, x0:x0 + w, :] = imgs[item[2]]
    cv2.imwrite(save_name, matrix)

def layout22():
    img_file = "D:\codeTest\parameterExp\data\case1\img"
    # locations = imgLayout(img_file=img_file, similarity=photoLand)
    # print(locations)
    suffix = "*.bmp"
    locations = [[0, 0, 0], [-1, 0, 1], [-1, -1, 2], [0, -1, 3], [1, 0, 4], [1, -1, 5], [0, -2, 6], [-1, -2, 7],
                 [0, -3, 8], [-1, -3, 9], [-2, -3, 10], [-2, -2, 11], [-2, -1, 12], [-2, 0, 13], [-3, -1, 14],
                 [-3, -2, 15], [-3, -3, 16], [-4, -3, 17], [-4, -2, 18], [-4, -1, 19], [-3, 0, 20], [-4, 0, 21]]
    img_paths = glob.glob(osp.join(img_file, suffix))
    imgs = []
    for i, img_path in enumerate(img_paths):
        img = cv2.imread(img_path)
        imgs.append(cv2.resize(img, (324, 243)))
    drawRes(locations, imgs)

def layout125():
    img_file = "C:\\Users\\plh\MVS\Data"
    locations = imgLayout(img_file=img_file, similarity=photoLand)
    print(locations)
    suffix = "*.bmp"
    img_paths = glob.glob(osp.join(img_file, suffix))
    imgs = []
    for i, img_path in enumerate(img_paths):
        img = cv2.imread(img_path)
        imgs.append(cv2.resize(img, (324, 243)))
    drawRes(locations, imgs,save_name="layout125.jpg")

def getImgLayoutForFront(img_file, suffix="*.bmp", resize_ratio=(324, 243), sorted=None, imgh=324, imgw=243, similarity=None,
              AR=0.8, H=1, G=0.8,containerH=1200,containerW=1000):
    '''
    返回前端需要的div数据，把空的div也写进去，按顺序返回
    :param img_file:
    :param suffix:
    :param resize_ratio:
    :param sorted:
    :param imgh:
    :param imgw:
    :param similarity:
    :param AR:
    :param H:
    :param G:
    :return:
    '''
    locations = imgLayout(img_file=img_file, similarity=photoLand)
    locations_std, row_max, col_max = standardLocation(locations)
    avgH = int(containerH/(row_max+1))
    avgW = int(containerW/(col_max+1))
    locations_std.sort(key=lambda x:(x[0],x[1]))
    img_paths = glob.glob(osp.join(img_file, suffix))
    res = []
    k = 0
    for i in range(row_max + 1):
        for j in range(col_max + 1):
            if locations_std[k][0] == i and locations_std[k][1] == j:
                res.append([i, j, img_paths[locations_std[k][2]].split("\\")[-1]])
                k += 1
            else:
                res.append([i, j, "noImg"])
    return res,avgH,avgW

if __name__ == '__main__':
    # layout125()
    # img_file = "D:\codeTest\parameterExp\\backend-flask\dataProcess\imageLayout\Image_20210812150340363.bmp"
    # img = cv2.imread(img_file)
    # n,m,_ = np.shape(img)
    # print(n,m)

    #standardLocation() Test
    locations = [[0, 0, 0], [-1, 0, 1], [-1, -1, 2], [0, -1, 3], [1, 0, 4], [1, -1, 5], [0, -2, 6], [-1, -2, 7],
                 [0, -3, 8], [-1, -3, 9], [-2, -3, 10], [-2, -2, 11], [-2, -1, 12], [-2, 0, 13], [-3, -1, 14],
                 [-3, -2, 15], [-3, -3, 16], [-4, -3, 17], [-4, -2, 18], [-4, -1, 19], [-3, 0, 20], [-4, 0, 21]]
    locations_std,row_max,col_max = standardLocation(locations)
    locations_std.sort(key=lambda x: (x[0], x[1]))
    print(locations_std)
    print(row_max)
    print(col_max)

    locations_std.sort(key=lambda x:(x[0],x[1]))
    # print(locations_std)

    img_file = "D:\codeTest\parameterExp\data\case1\img"
    suffix = "*.bmp"

    img_paths = glob.glob(osp.join(img_file, suffix))

    res = []
    k = 0
    for i in range(row_max+1):
        for j in range(col_max+1):
            if locations_std[k][0] == i and locations_std[k][1] == j:
                res.append([i,j,img_paths[locations_std[k][2]].split("\\")[-1]])
                k+=1
            else:
                res.append([i, j, "noImg"])
    print(res)
    Writer = "plh"
