import G6 from '@antv/g6';

function flowChart(that) {
    const operation = that.operation;
    const parameter = that.parameter;

    const newData = new Array();
    operation.forEach((item1, index1) => {
        let id = (index1 + 1) + '';
        let object = {};
        object.id = id;
        object.name = item1.operationName;
        object.use = item1.use;
        object.children = new Array();
        item1.operation_parameter.forEach((item2, index2) => {
            let object2 = {}
            object2.id = id + '-' + index2;
            object2.name = item2.parameterName;
            object2.children = new Array();
            object2.children.push(...[{
                id: object2.id + "-" + 1,
                name: "maxValue: " + item2.maxValue,
                children: []
            }, {
                id: object2.id + "-" + 2,
                name: "minValue: " + item2.minValue,
                children: []
            }, {
                id: object2.id + "-" + 3,
                name: "step: " + item2.step,
                children: []
            }, {
                id: object2.id + "-" + 4,
                name: "use: " + item2.use,
                children: [] 
            }])

            object.children.push(object2);
        })
        newData.push(object)
    })

    G6.registerNode('file-node', {
        draw: function draw(cfg, group) {
            let color = '#666';
            if(cfg.use) color = '#00FF00';
            const keyShape = group.addShape('rect', {
                attrs: {
                    x: 10,
                    y: -12,
                    fill: '#fff',
                    stroke: null,
                },
            });
            let isLeaf = false;
            if (cfg.collapsed) {
                group.addShape('marker', {
                    attrs: {
                        symbol: 'triangle',
                        x: 4,
                        y: -2,
                        r: 4,
                        fill: '#666',
                    },
                    name: 'marker-shape',
                });
            } else if (cfg.children && cfg.children.length > 0) {
                group.addShape('marker', {
                    attrs: {
                        symbol: 'triangle-down',
                        x: 4,
                        y: -2,
                        r: 4,
                        fill: '#666',
                    },
                    name: 'marker-shape',
                });
            } else {
                isLeaf = true;
            }
            const shape = group.addShape('text', {
                attrs: {
                    x: 15,
                    y: 4,
                    text: cfg.name,
                    fill: color,
                    fontSize: 16,
                    textAlign: 'left',
                    fontFamily:
                        typeof window !== 'undefined'
                            ? window.getComputedStyle(document.body, null).getPropertyValue('font-family') ||
                            'Arial, sans-serif'
                            : 'Arial, sans-serif',
                },
                name: 'text-shape',
            });
            const bbox = shape.getBBox();
            let backRectW = bbox.width;
            let backRectX = keyShape.attr('x');
            if (!isLeaf) {
                backRectW += 8;
                backRectX -= 15;
            }
            keyShape.attr({
                width: backRectW,
                height: bbox.height + 4,
                x: backRectX,
            });
            return keyShape;
        },
    });
    G6.registerEdge(
        'step-line',
        {
            getControlPoints: function getControlPoints(cfg) {
                const startPoint = cfg.startPoint;
                const endPoint = cfg.endPoint;
                return [
                    startPoint,
                    {
                        x: startPoint.x,
                        y: endPoint.y,
                    },
                    endPoint,
                ];
            },
        },
        'polyline',
    );

    const container = document.querySelector('#container');
    const width = container.width;
    const height = container.height;
    const graph = new G6.TreeGraph({
        container: 'container',
        width,
        height,
        linkCenter: true,
        modes: {
            default: [
                {
                    type: 'collapse-expand',
                    animate: false,
                    onChange: function onChange(item, collapsed) {
                        const data = item.get('model');
                        data.collapsed = collapsed;
                        return true;
                    },
                },
                'drag-canvas',
                'zoom-canvas',
            ],
        },
        defaultEdge: {
            style: {
                stroke: '#A3B1BF',
            },
        },
        layout: {
            type: 'indented',
            isHorizontal: true,
            direction: 'LR',
            indent: 30,
            getHeight: function getHeight() {
                return 16;
            },
            getWidth: function getWidth() {
                return 16;
            },
        },
    });

    graph.node((node) => {
        return {
            type: 'file-node',
            label: node.name,
        };
    });
    graph.edge(() => {
        return {
            type: 'step-line',
        };
    });

    graph.data({id: '0', name: "operation", children: newData, use: false});
    graph.render();
    graph.fitView();

    if (typeof window !== 'undefined')
        window.onresize = () => {
            if (!graph || graph.get('destroyed')) return;
            if (!container || !container.scrollWidth || !container.scrollHeight) return;
            graph.changeSize(container.scrollWidth, container.scrollHeight);
        };




}

export { flowChart }