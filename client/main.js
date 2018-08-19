"use strict";

// 以下を参考にさせて頂いた。
// http://blog.livedoor.jp/sce_info3-craft/archives/9237005.html

const awsIot = require('aws-iot-device-sdk');
const config = require('./.config.js');
const fs = require('fs')

const myTopic = 'topic/dht11';
const logPath = '/tmp/dht11.json';
const maxRetryCount = 60;

const state = {
  connected: false,
  retryCount: 0
};

// デバイスを作成
const device = awsIot.device(config);

const sendData = () => {
  if (!state.connected) {
    if (state.retryCount < maxRetryCount) {
      state.retryCount++;
      setTimeout(sendData, 10000);
      return;
    }
  }

  try {
    const data = fs.readFileSync(logPath, 'utf8');
    device.publish(myTopic, data);
    state.retryCount = 0;
  } catch (e) {
    console.error(e);
    state.retryCount++;
    setTimeout(sendData, 10000);
    return;
  }
  watchLog();
}

const watchLog = () => {
  try {
    const watcher = fs.watch(logPath, (event, filename) => {
      watcher.close();
      setTimeout(sendData, 1000);
    });
  } catch(e) {
    // ファイルなし時は空のファイルを書いておく
    if (e.code === 'ENOENT') {
      fs.writeFileSync(logPath, '{}');
      setTimeout(watchLog, 10000);
    }
  }
}

device.on('connect', () => {
  state.connected = true;
  state.retryCount = 0;
  watchLog();
});
device.on('close', () => {
  state.connected = false;
});
device.on('reconnect', () => {
  state.connected = true;
});
device.on('offline', () => {
  state.connected = false;
});
device.on('error', (error) => {
  console.error(error);
});
