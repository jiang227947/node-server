# node-server
## 包含`Node、Ts、JWT、sequelize、mysql`

### `2023/3/25` Node服务替代Java服务上线


- [Angular前端项目地址](https://github.com/jiang227947/ziyi-project)


### 技术栈

- 数据库（Mysql）连接：[sequelize](https://www.sequelize.cn/core-concepts/getting-started/)
- Token鉴权：[JWT](https://jwt.io/)

1.安装依赖
```shell
npm i --save-dev
```
2.运行程序
```shell
# 监听打包
nodemon dist/index.js

# 监听热加载
tsc --watch
```
3.已知BUG

- 因服务器原因，Github登录时axios请求token大概率失败。


