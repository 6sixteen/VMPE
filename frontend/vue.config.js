module.exports = {
    devServer: {
        host:'localhost',
        port:3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080', //接口域名
                changeOrigin: true,             //是否跨域
                // ws: true,                       //是否代理 websockets
                // secure: true,                   //是否https接口
                pathRewrite:{
                    "^/api":""
                }
            }
        }
    }
};

//vue-cli vue-vite 的区别 导致这个没有用 直接配置后端跨域
