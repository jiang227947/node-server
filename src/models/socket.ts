import http from 'http';
import express from 'express';
import { Server } from 'socket.io';

/**
 * websocket服务
 * 使用socket.io
 */
const app = express();
const SocketServer = http.createServer(app);
const io = new Server(SocketServer, {
  cors: {
    origin: '*',
  },
  // 发送新的ping packet（25000）之前有多少ms
  pingInterval: 30000,
  // 有多少ms没有传递消息则考虑连接close（60000）
  pingTimeout: 5000,
});

/**
 * 连接
 */
io.on('connection', (socket) => {
  console.log('socket连接成功!', socket.id);
  //   setInterval(() => {
  //     const date = new Date().getSeconds();
  //     if (date % 5 === 0) {
  //       socket.emit('onallmessage', '这是一条广播消息！');
  //     }
  //   }, 1000);

  /**
   * 接收单个消息
   * onmessage 为规定好的事件名称
   */
  socket.on('onmessage', (msg) => {
    console.log(msg);
    // 转发给客户端信息
    socket.emit('onmessage', 'onmessage消息收到');
  });

  /**
   * 接收所有消息
   * onallmessage 为规定好的事件名称
   */
  socket.on('onallmessage', (msg) => {
    // console.log(msg);
    // 转发给全部客户端信息，所有客户端都可以收到
    socket.emit('onallmessage', '广播 : 这是一条广播消息！');
  });

  /**
   * 连接关闭
   */
  socket.on('disconnect', (evt) => {
    console.log('连接关闭', evt);
  });
});

export { SocketServer, io };
