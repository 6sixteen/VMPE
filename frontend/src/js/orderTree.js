import * as d3 from "d3";
import { removeBracketList, list2str, deepCopy, getIds } from "./tool";

// tree node
class Node {
    constructor(name, children) {
        this.name = name;
        this.children = children;
    }
}

// tree leaf node
class LeafNode {
    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
}

// make_tree_data
// param re_combine, combine
// return tree_data
function make_tree_data(re_combine, combine) {
    let re_combine_length = re_combine.length;
    let combine_length = combine.length;
    let pre_child_node = null;
    let map = new Map();
    if (true || re_combine_length === combine_length) {
        for (let i = 0; i < re_combine_length; i++) {
            // let combine_index = re_combine[i];
            let arr = combine[i];
            // 两个下标
            let combine_index_1 = re_combine[i][0][0];
            let combint_index_2 = re_combine[i][0][1];
            let value_1 = arr[combine_index_1];
            let value_2 = arr[combint_index_2];
            //let value_cur = null;
            //let value_pre = null;
            // 双叶节点
            if (typeof value_1 == 'number' && typeof value_2 == 'number') {
                let arr1 = [];
                arr1.push(value_1);
                let arr2 = [];
                arr2.push(value_2);
                let arr3 = [];
                arr3.push(value_1, value_2);
                let leaf_node_1 = new LeafNode(getIds(arr1), 0);
                let leaf_node_2 = new LeafNode(getIds(arr2), 0);
                let arr4 = [];
                arr4.push(leaf_node_1, leaf_node_2);
                pre_child_node = new Node(getIds(arr3), arr4);
                map.set(getIds(arr1), leaf_node_1);
                map.set(getIds(arr2), leaf_node_2);
                map.set(getIds(arr3), pre_child_node);
            } else if (typeof value_1 == 'number') {
                // 单个叶节点
                let arr1 = [];
                arr1.push(value_1);
                let arr2 = [];
                arr2.push(value_1, value_2);
                let leaf_node = new LeafNode(getIds(arr1), 0);
                let arr3 = [];
                pre_child_node = map.get(getIds(value_2))
                arr3.push(leaf_node, pre_child_node);
                pre_child_node = new Node(getIds(arr2), arr3);
                map.set(getIds(arr1), leaf_node);
                map.set(getIds(arr2), pre_child_node);
            } else if (typeof value_2 == 'number') {
                // 单个叶节点
                let arr1 = [];
                arr1.push(value_2);
                let arr2 = [];
                arr2.push(value_1, value_2);
                let leaf_node = new LeafNode(getIds(arr1), 0);
                let arr3 = [];
                pre_child_node = map.get(getIds(value_1))
                arr3.push(leaf_node, pre_child_node);
                pre_child_node = new Node(getIds(arr2), arr3);
                map.set(getIds(arr1), leaf_node);
                map.set(getIds(arr2), pre_child_node);
            } else {
                // 树
                let tree_1_name = getIds(value_1);
                let tree_2_name = getIds(value_2);
                let tree_1_node = map.get(tree_1_name);
                let tree_2_node = map.get(tree_2_name);
                let arr1 = [];
                arr1.push(value_1, value_2);
                let arr2 = [];
                arr2.push(tree_1_node, tree_2_node);
                pre_child_node = new Node(getIds(arr1), arr2);
                map.set(getIds(arr1), pre_child_node);
            }
        }
        // console.log(pre_child_node);
        map.clear();
        return pre_child_node;
    } else {
        console.log("data error!");
    }
}

function draw_tree(that) {
    const re_combine = that.re_combine
    const combine = that.combine
    let tree_data = make_tree_data(re_combine, combine)
    console.log("tree_data", tree_data)
    const svg = d3.select('#' + that.id);
    svg.selectAll("*").remove()
    // svg.attr("viewBox", [-dy * padding / 2, x0 - dx, width, height])
    const width = parseInt(that.w)
    const height = parseInt(that.h)
    const canTwoCluster = that.canTwoCluster;
    const newCluster = that.newCluster;
    Tree(tree_data, { width: width, height: height, svg: svg, title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, canTwoCluster, newCluster })
}

function Tree(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
    path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
    id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
    parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
    children, // if hierarchical data, given a d in data, returns its children
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
    label, // given a node d, returns the display name
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    svg,
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
    fill = "#999", // fill for nodes
    fillOpacity, // fill opacity for nodes
    stroke = "#555", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#000000", // color of label halo
    haloWidth = 3, // padding around the labels
    canTwoCluster,
    newCluster
} = {}) {

    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
            : d3.hierarchy(data, children);

    // Compute labels and titles.
    const descendants = root.descendants();
    console.log(descendants, "descendants")
    const L = label == null ? null : descendants.map(d => label(d.data, d));

    // Sort the nodes.
    if (sort != null) root.sort(sort);

    // Compute the layout.
    const dx = 8;
    const dy = width / (root.height + padding);
    tree().nodeSize([dx, dy])(root);

    // Center the tree.
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    // Compute the default height.
    if (height === undefined) height = x1 - x0 + dx * 2;

    // const svg = d3.create("svg")
    svg.attr("viewBox", [-dy * padding / 2, x0 - dx, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    const node = svg.append("g")
        .selectAll("a")
        .data(root.descendants())
        .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("fill", d => {
            let str = newCluster[0].sort((a, b)=>(a - b)).join("_");
            if (str === d.data.name) {
                return "red"
            }
            return d.children ? stroke : fill
        })
        .attr("r", r);

    if (title != null) node.append("title")
        .text(d => title(d.data, d));

    if (L) node.append("text")
        .attr("dy", "0.32em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text((d, i) => L[i])
        .call(text => text.clone(true))
        .attr("fill", "none")
        .attr("stroke", halo)
        .attr("stroke-width", haloWidth);

    return svg.node();
}

export { draw_tree }