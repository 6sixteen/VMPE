'''
Description:
Writer = "plh"
Data:2021/9/13
'''
import cv2
import numpy as np
import math
import glob
import os.path as osp

def perceptualHash():
    #感知哈希算法
    #淘汰 因为要缩小到8*8
    #https://github.com/nivance/image-similarity
    pass

def histogram():
    #可以尝试
    #直方图算法是对源图像与要筛选的图像进行直方图数据采集，对采集的各自图像直方图进行归一化再使用巴氏系数算法对直方图数据进行计算
    # https://github.com/nivance/image-similarity
    pass

def perceptual25(img):
    perceptual_25 = [[0, 0, 0], [0, 182, 0], [0, 255, 170], [36, 73, 0], [36, 146, 170],
                     [36, 255, 0], [73, 36, 170], [73, 146, 0], [73, 219, 170], [109, 36, 0],
                     [109, 109, 170], [109, 219, 0], [146, 0, 170], [146, 109, 0], [146, 182, 170],
                     [182, 0, 0], [182, 73, 170], [182, 182, 0], [182, 255, 170], [219, 73, 0],
                     [219, 146, 170], [219, 255, 0], [255, 36, 170], [255, 146, 0], [255, 255, 255]]
    h, w, c = np.shape(img)
    perceptual_number = len(perceptual_25)
    order = np.zeros((h, w, perceptual_number))
    for i, color in enumerate(perceptual_25):
        color = np.expand_dims(color, axis=0)
        color = np.repeat(color, repeats=w, axis=0)
        color = np.expand_dims(color, axis=0)
        color = np.repeat(color, repeats=h, axis=0)
        temp = img - color
        temp = temp * temp
        temp = np.sum(temp, axis=2)
        order[:, :, i] = temp
    index = np.argmax(order, axis=2)
    return index

def photoLand(img_p, img_q):
    # photoLand 中的方法
    # 主要问题是论文中写的有点问题
    perceptual_25 = [[0, 0, 0], [0, 182, 0], [0, 255, 170], [36, 73, 0], [36, 146, 170],
                     [36, 255, 0], [73, 36, 170], [73, 146, 0], [73, 219, 170], [109, 36, 0],
                     [109, 109, 170], [109, 219, 0], [146, 0, 170], [146, 109, 0], [146, 182, 170],
                     [182, 0, 0], [182, 73, 170], [182, 182, 0], [182, 255, 170], [219, 73, 0],
                     [219, 146, 170], [219, 255, 0], [255, 36, 170], [255, 146, 0], [255, 255, 255]]
    h, w, c = np.shape(img_p)
    img_p_index = perceptual25(img_p)
    img_q_index = perceptual25(img_q)
    C = 0
    for i, color in enumerate(perceptual_25):
        p_color_index = np.where(img_p_index == i)[0]
        q_color_index = np.where(img_q_index == i)[0]
        p_color_num = np.shape(p_color_index)[0]
        q_color_num = np.shape(q_color_index)[0]
        temp = math.sqrt((p_color_num - q_color_num)*(p_color_num - q_color_num))*3
        C +=temp
    s = 1.0 - C/(h*w)
    return s
def neuralNetWork():
    #使用网络 挺多的
    #https://github.com/akarshzingade/image-similarity-deep-ranking
    pass

def others():
    #找找相关的论文
    pass
if __name__ == '__main__':
    img_file = "D:\codeTest\parameterExp\data\case1\img"
    suffix = "*.bmp"
    img_paths = glob.glob(osp.join(img_file, suffix))
    imgs = []
    for i, img_path in enumerate(img_paths):
        img = cv2.imread(img_path)
        imgs.append(cv2.resize(img, (324,243)))
    for i,img in enumerate(imgs):
        for j,img2 in enumerate(imgs):
            if i==j:
                pass
            else:
                s = photoLand(img,img2)
                print(i,"_",j," s ",s)
    Writer = "plh"
