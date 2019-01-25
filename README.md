# cmp-electron-vue

> An electron-vue project

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).




# CMP vue用法

## mixins用法
可以混入一些常用的计算方法，但是每次混入，都是独立的拷贝，不是全局变量

## 别名问题
项目中常用的目录可以在webpack中配置：
    resolve: {
        alias: {
            '@': path.join(__dirname, '../src/renderer'),
            '@src': path.join(__dirname, '../src'),
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['.js', '.vue', '.json', '.css', '.node', '.less']
    },

## 事件统一监听、反监听
在dataListener中处理统一的监听、反监听流程，省略了每个页面单独处理。

## 搭建3721端口服务
packageProcessor中用http搭建一个3721端口的服务，通过nedb入库（内存数据库），express可以通过3721端口访问内存数据库

###1、添加nedb依赖
nedb:NeDB是使用Nodejs实现的一个NoSQL嵌入式数据库操作模块，可以充当内存数据库，也可以用来实现本地存储，甚至可以在浏览器中使用。查询方式比较灵活，支持使用正则、比较运算符、逻辑运算符、索引以及JSON深度查询等。

## 添加数据库进程
dbProcessor文件 处理内存数据库进程
