import { HttpService } from './HttpService';
import { NativeService } from './NativeService';
import { Router } from '@angular/router';
import { LocalstorageService } from './LocalstorageService'
import { Injectable } from '@angular/core';

declare let window;

if (window.nw && window.require) {
  window.os = window.require('os');
}

let reconnCount = 1;
let msgs = {};
let headerLenFieldLength = 4;
let notifyLenFieldLength = 6;
let websocketMissCount = 0;

function parseMessage(msg) {

  if (!msg || msg.length < headerLenFieldLength) {
    return null;
  }

  let notify = msg.substring(0, notifyLenFieldLength);

  if (notify == 'ACK1') {
    return notify;
  } else if (notify == 'CMDKCK') { // 踢掉本人其他设备
    return {
      header: 'notify',
      extras: {
        listenFlag: 'noteRemind',
        noteType: 0,
        content: '您' + msg.replace('CMDKCK:', '') + ' 设备离线'
      }
    };
  } else if (notify == 'CMDOFL') { // 本人其他设备下线通知
    return {
      header: 'notify',
      extras: {
        listenFlag: 'noteRemind',
        noteType: 0,
        content: '您' + msg.replace('CMDOFL:', '') + ' 设备离线'
      }
    };
  } else if (notify == 'CMDONL') { // 本人其他设备上线通知
    return {
      header: 'notify',
      extras: {
        listenFlag: 'noteRemind',
        noteType: 0,
        content: '您' + msg.replace('CMDONL:', '') + '设备在线'
      }
    };
  }
  let headerLength = parseInt(msg.substring(0, headerLenFieldLength), 10);
  if (!headerLength) {
    return null;
  }
  return {
    header: msg.substring(headerLenFieldLength, headerLength + headerLenFieldLength),
    content: msg.substring(headerLength + headerLenFieldLength)
  };
}

@Injectable()
export class WebsocketService {
  constructor(
    private http: HttpService,
    private native: NativeService,
    private local: LocalstorageService,
    private router: Router
  ) { }

  MSG_PUSH_URI: String;
  callback: Function;
  client: any;

  public open(callback: Function) {
    this.callback = callback;
    this.doConn().then((client) => {
      this.client = client;
      this.initEvent(client);
    })
  }

  public destroy() {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
  }

  public send(message) {
    if (this.client && this.client.send) {
      this.client.send(message);
      if (message == 'HBT1') {
        websocketMissCount++;
        if (websocketMissCount > 6) {
          this.reConn();
        }
      }
    } else {
      this.doConn();
    }
  }

  public getMacAddress() {
    let address = '00:00:00:00:00:00';
    let found = false;
    if (window.os) {
      let obj = window.os.networkInterfaces();
      let keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        let value = obj[keys[i]];
        if (Array.isArray(value)) {
          for (let j = 0; j < value.length; j++) {
            if (value[j].mac !== address) {
              address = value[j].mac;
              found = true;
              break;
            }
          }
        }
        if (found) {
          break;
        }
      }
    }
    return address;
  }

  private doConn() {
    return new Promise((resolve, reject) => {
      let client;
      try {
        this.MSG_PUSH_URI = 'ws' + this.http.host + '/msgpush';
        let listenFlags = 'Conversation';
        let userVo = this.local.get('userInfo');
        client = new WebSocket(this.MSG_PUSH_URI +
          '/YGWebSocket?userId=' + userVo.userId +
          '&userName=' + userVo.email +
          '&listenFlags=' + listenFlags +
          '&clientFlag=' + '1' +
          '&reuqestIp=' + '5.6.3.2' +
          '&deviceId=' + this.getMacAddress() +
          '&appVersion=' + '0.0.1');
      } catch (e) {
        reject();
      }
      client.onopen = (event) => {
        console.log('Connection established');
        resolve(client);
      } 
      client.onerror = (error) => {
        console.log(error);
        reject();
      }
    })

  }

  private initEvent(webSocket) {
    let self = this;

    //服务端关闭连接的回调
    webSocket.onclose = (event) => {
      console && console.info(event);
      if (event.code !== 1000) {
        // 不是正常关闭, 尝试重连
        self.reConn();
      } else {
        self.failCallback();
      }
    };

    webSocket.onmessage = (event) => {
      let msg = parseMessage(event.data);

      if (msg == null) {
        self.callback(null);
        return;
      } else if (msg == 'ACK1') {
        websocketMissCount = 0;
        return;
      }
      // send confirm
      webSocket.send('CFM' + msg.header);
      if (msgs[msg.header]) {
        // 已经处理过这个消息了.
        return;
      }

      msgs[msg.header] = new Date().getTime();

      let data = JSON.parse(msg.content);
      self.callback(data);

      setTimeout(clearMsgs, 1000);
    };

    let HALF_HOUR = 30 * 60 * 1000;

    function clearMsgs() {
      let now = new Date().getTime();
      for (let header in msgs) {
        if (msgs.hasOwnProperty(header)) {
          let time = msgs[header];
          if (time + HALF_HOUR < now) {
            // 删除半个小时前的信息
            delete msgs[header];
          }
        }
      }
    }
  }

  private reConn() {
    // 重连间隔定为10秒
    let time = 10000;
    if (reconnCount < 6) {
      // 如果是在1 分钟之内的, 则时间是递增的
      time = Math.pow(1.5, reconnCount) * 2000;
      console.log('第' + reconnCount + '次尝试重连，间隔时间：' + time);
      setTimeout(() => {
        this.doConn().then(() => {
          // 在reConn 里面表示进行重连了
          // 进入这个回调表示成功了.
          this.reconnCallback();
        }, () => {
          reconnCount += 1;
          this.reConn();
        });
      }, time);
    } else {
      // 超过重试次数不成功就转到断线页面手动重连
      this.failCallback();
    }
  }

  private failCallback() {
    this.http.logout().subscribe(
      (result) => {

      window.nwNotify.notify({
        title: '瓦特',
        text: '您已经被踢出'
      });
      setTimeout(() => window.chrome.runtime.reload(),2000);
      }, 
      (error) => {
        // 清除托盘
        this.native.removeTray();
        console.log(error);
        setTimeout(() => window.chrome.runtime.reload(),1000);
      }
    )
  }

  private reconnCallback() {
    console.log('reconnCallback');
    reconnCount = 1;
  }

}
