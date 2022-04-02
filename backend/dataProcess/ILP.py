'''
Description:
Writer = "plh"
Data:2021/10/8
'''
from pulp import *
import json
import sys
import numpy as np
def runILP(data,name):
    '''

    :param data:
    :return:
    '''
    prob = LpProblem(name, LpMinimize)
    nodes = data['nodes']
    links = data['links']

    x = []
    for i in range(len(nodes)):
        x_i = []
        for j in range(len(nodes[i])):
            x_i_j = []
            for k in range(len(nodes[i])):
                if (j != k):
                    x_jk = LpVariable(nodes[i][j]['name'] + "n"+nodes[i][k]['name'], 0, 1, LpInteger)
                    x_i_j.append(x_jk)
                else:
                    x_i_j.append(0)
            x_i.append(x_i_j)
        x.append(x_i)

    c = []
    for i in range(len(links)):
        c_i = []
        for j in range(len(links[i])):
            c_i_j = []
            for k in range(len(links[i])):
                source1 = links[i][j]['sourceid']
                target1 = links[i][j]['targetid']
                source2 = links[i][k]['sourceid']
                target2 = links[i][k]['targetid']
                if (j != k) & (source1 != source2) & (target1 != target2):
                    c_jk = LpVariable(str(i)+"_"+str(links[i][j]['sourceid'])+"_"+str(links[i][j]['targetid'])+"_"+str(links[i][k]['sourceid'])+"_"+str(links[i][k]['targetid']), 0, 1, LpInteger)
                    c_i_j.append({
                            'var': c_jk,
                            'source1': links[i][j]['sourceid'],
                            'target1': links[i][j]['targetid'],
                            'source2': links[i][k]['sourceid'],
                            'target2': links[i][k]['targetid'],
                            'weight': links[i][k]['value'] * links[i][j]['value']
                        })
                else:
                    c_i_j.append(0)
            c_i.append(c_i_j)
        c.append(c_i)

    # obj
    obj = 0
    for i in range(len(c)):
        for j in range(len(c[i])):
            for k in range(len(c[i][j])):
                if c[i][j][k] != 0:
                    obj += c[i][j][k]['weight'] * c[i][j][k]['var']
    prob += obj, 'obj'

    # cond 1
    for i in range(len(x)):
        for j in range(len(x[i])):
            for k in range(j+1, len(x[i])):
                prob += x[i][j][k] + x[i][k][j] == 1

    # cond 2
    for i in range(len(x)):
        for a in range(len(x[i])):
            for b in range(a+1, len(x[i])):
                for d in range(b+1, len(x[i])):
                    prob += x[i][a][d] >= x[i][a][b] + x[i][b][d] - 1

    # cond 3
    for i in range(len(c)):
        for j in range(len(c[i])):
            for k in range(len(c[i][j])):
                if j != k:
                    cross = c[i][j][k]
                    if cross != 0:
                        prob += cross['var'] + x[i][cross['source2']][cross['source1']] + x[i+1][cross['target1']][cross['target2']] >= 1
                        prob += cross['var'] + x[i][cross['source1']][cross['source2']] + x[i+1][cross['target2']][cross['target1']] >= 1

    # additional cond 1
    for i in range(len(c)):
        for j in range(len(c[i])):
            for k in range(j+1, len(c[i])):
                if c[i][j][k] != 0:
                    prob += c[i][j][k]['var'] == c[i][k][j]['var']

    status = prob.solve()
    for v in prob.variables():
        # if v.name.find("n")>=0:
        #     layer = v.name.splite("_")[0]
        print(v.name," ",v.varValue)
    vars = {}
    for v in prob.variables():
        if v.name.find("n")>=0:
            layer = int(v.name.split("_")[0])
            if layer in vars.keys():
                if not judgeSymmetry(vars[layer],v.name):
                    vars[layer].append({"name":v.name,"value":v.varValue})
            else:
                vars[layer] = []
    print(vars)

    order = {}
    for layer in vars.keys():
        temp = {}
        for i,node in enumerate(nodes[layer]):
            temp[node["name"]] =i
        order[layer] = temp
    for layer in vars.keys():
        layer_nodes = nodes[layer]
        layer_order = order[layer]
        for con in vars[layer]:
            names = con["name"].split("n")
            order_p = layer_order[names[0]]
            order_l = layer_order[names[1]]
            if con["value"]==0:
                if order_p<order_l:
                    t = order_p
                    layer_order[names[0]] = order_l
                    layer_order[names[1]] = t
            if con["value"] ==1:
                if order_p>order_l:
                    t = order_p
                    layer_order[names[0]] = order_l
                    layer_order[names[1]] = t
    print("order",order)
    # 根据order调整顺序
    for layer in order.keys():
        order_l = order[layer]#{'0_30.0': 1, '0_40.0': 2, '0_50.0': 0}
        node_l = nodes[layer]#[{'name': '0_30.0', 'category': '0_0', 'size': 1, 'id': 0}, ...]
        for key in order_l:
            value1 = order_l[key]
            if node_l[value1]["name"]!=key:
                for i,item in enumerate(node_l):
                    if item["name"]==key:
                        t = node_l[value1]
                        node_l[value1] = node_l[i]
                        node_l[i] = t
                        break
    print("order nodes",nodes)
    return {'value': value(prob.objective) / 2, 'status': LpStatus[prob.status]}
def judgeSymmetry(l,target,link_symbol="n"):
    names = target.split(link_symbol)
    sym_names = names[1]+"n"+names[0]
    for item in l:
        if item["name"] == sym_names:
            return True
    return False
if __name__ == '__main__':
    Writer = "plh"
