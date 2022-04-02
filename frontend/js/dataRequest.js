import axis from "axios";


function getHistogram(data, that, target, forceUpdate = false) {
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/getImgHistogram', data, {
        headers: {"Content-Type": "application/json"},
    })
        .then(function (response) {
            // console.log(response.data.res)
            that[target] = response.data.res
            if (forceUpdate) {
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getImgParameterDistribution(data, that, correspond, forceUpdate = false) {
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/getImgParamDistribution', data, {
        headers: {"Content-Type": "application/json"},
    })
        .then(function (response) {
            // console.log(response.data.res)
            if (typeof (correspond) === "string") {
                that[correspond] = response.data
            } else {
                for (let key in correspond) {
                    that[correspond[key]] = response.data[key]
                }
            }
            if (forceUpdate) {
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getImgLayout(data, that, correspond) {
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/imgLayout', data, {
        headers: {"Content-Type": "application/json"}
    })
        .then(function (response) {
            // console.log(response);
            console.log("getImgLayout api")
            for (let key in correspond) {
                that[correspond[key]] = response.data[key]
            }
            // that.imgInfo = response.data.locations
            // that.h = response.data.h + "" + "px"
            // that.w = response.data.w + "" + "px"
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getImgBase64(data, that, correspond) {
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/imgBase64', data, {
        headers: {"Content-Type": "application/json"},
    })
        .then(function (response) {
            for (let key in correspond) {
                that[correspond[key]] = "data:image/bmp;base64," + response.data[key]
            }
            // that.imgBase64 = "data:image/bmp;base64," + response.data.res
        })
        .catch(function (error) {
            console.log(error);
        });

}

function calGreedyMatrix(data, that, correspond, forceUpdate = false) {
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/calGreedyMatrix', data, {
        headers: {"Content-Type": "application/json"},
    })
        .then(function (response) {
            // console.log(response.data.res)
            if (typeof (correspond) === "string") {
                that[correspond] = response.data
            } else {
                for (let key in correspond) {
                    that[correspond[key]] = response.data[key]
                }
            }
            if (forceUpdate) {
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getView1Simple(data, that, correspond, forceUpdate = false) {
    axis.post('/getView1Simple', data
        , {
            headers: {"Content-Type": "application/json"}
        })
        .then(function (response) {
            if (typeof (correspond) === "string") {
                that[correspond] = response.data
            } else {
                for (let key in correspond) {
                    that[correspond[key]] = response.data[key]
                }
            }
            if (forceUpdate) {
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getView1(data, that, correspond, forceUpdate = false) {
    axis.post('/getView1Simple', data
        , {
            headers: {"Content-Type": "application/json"}
        })
        .then(function (response) {
            if (typeof (correspond) === "string") {
                that[correspond] = response.data
            } else {
                for (let key in correspond) {
                    that[correspond[key]] = response.data[key]
                }
            }
            if (forceUpdate) {
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function postRequest(url, data, that, correspond, forceUpdate = false,addinfo={}) {
    axis.post(url, data
        , {
            headers: {"Content-Type": "application/json"}
        })
        .then(function (response) {
            if (typeof (correspond) === "string") {
                that[correspond] = response.data
            } else {
                for (let key in correspond) {
                    that[correspond[key]] = response.data[key]
                }
            }
            for(let key in addinfo){
                that[key] = addinfo[key]
            }
            if (forceUpdate) {
                console.log("post request finish")
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getRequest(url, params = {}, that, correspond, forceUpdate = false, addinfo={}) {
    axis.get(url, params)
        .then(function(response) {
            if (typeof (correspond) === "string") {
                that[correspond] = response.data
            } else {
                for (let key in correspond) {
                    that[correspond[key]] = response.data[key]
                }
            }
            for(let key in addinfo){
                that[key] = addinfo[key]
            }
            if (forceUpdate) {
                console.log("get request finish")
                that.$forceUpdate()
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

export {
    getHistogram,
    getImgBase64,
    getImgParameterDistribution,
    getImgLayout,
    calGreedyMatrix,
    getView1Simple,
    getView1,
    postRequest,
    getRequest
}