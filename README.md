## `2023/3/25` Node服务替代Java服务上线
- [Angular前端项目地址](https://github.com/jiang227947/ziyi-project)
- [Uni-app小程序项目地址](https://github.com/jiang227947/discord-uniapp)


### 技术栈
- 框架：[Express](https://www.expressjs.com.cn/)
- ~~数据库（Mysql）连接：[sequelize](https://www.sequelize.cn/core-concepts/getting-started/)~~
- 数据库（MongoDB）连接：[Mongoose](https://mongoosejs.com/)
- Token鉴权：[JWT](https://jwt.io/)
- 长连接：[Socket.IO](https://socket.io/)
- 缓存：[Radis](https://redis.io/)

### 使用
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


