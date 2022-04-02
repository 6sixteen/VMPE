'''
Description:
Writer = "plh"
Data:2021/9/20
'''
import numpy as np
import cv2


def getVHistogram(img, number=256):
    '''
    得到图片HSV空间的V的直方图
    :param img:rgb
    :param number:直方图的个数
    :return:
    '''
    hsv_img = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv_img)
    hist = cv2.calcHist([v], [0], None, [number], [0.0, 255.0])
    res = []
    for i in range(number):
        res.append([i, int(hist[i, 0])])
    return res


def getGrayHistogram(img, bin=256):
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([img_gray], [0], None, [bin], [0.0, 255.0])
    res = []
    for i in range(bin):
        res.append([i, int(hist[i, 0])])
    return res

if __name__ == '__main__':
    img = cv2.imread("D:\codeTest\parameterExp\\backend-flask\data\img\Image_20210812150343338.bmp")
    res = getVHistogram(img)
    print(res)
    Writer = "plh"
