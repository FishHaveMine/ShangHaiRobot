import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { Params } from '@angular/router/src/shared';
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { WebsocketService } from '../../service/WebsocketService';
import { MessageService } from '../../service/MessageService';
import { HttpService } from '../../service/HttpService';
import { RobotKingMuResourceService } from '../../service/resource/robot-kingmu-resource.service';

declare let window;

if (window.nw && window.require) {
  window.nwNotify = window.require('nw-notify');
  window.nwNotify.setConfig({
    defaultStyleText: {
      margin: 0,
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      display: '-webkit-box',
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': 'vertical'
    }
  })
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.Emulated // None | Emulated | Native
})
export class HomeComponent implements OnInit, OnDestroy {

  userVo: any;
  mainWindow: any = null;
  default: Params = {
    width: 162,
    height: 180
  }
  isMoving: Boolean = false;
  clickCount: number = 0;
  winPos: Params = {
    x: 0,
    y: 0
  }
  noReadCount: number = 0;
  noReadList = [];
  websocketTimer: any = null;
  userSessionTimer: any = null;
  heartBeatTimer: any = null;
  ciciUserId: string;

  constructor(
    private router: Router,
    private http: HttpService,
    private local: LocalstorageService,
    private native: NativeService,
    private ref: ChangeDetectorRef,
    private messageService: MessageService,
    private websocket: WebsocketService,
    private kingMuResourceService: RobotKingMuResourceService,
    private route: ActivatedRoute) {
    this.ciciUserId = kingMuResourceService.userId;
  }

  ngOnInit() {
    this.userVo = this.local.get('userInfo');
    this.native.resizeTo(this.default.width, this.default.height);
    let x = window.screen.availWidth - this.default.width - 20;
    let y = window.screen.availHeight - this.default.height - 40;
    this.default.x = x;
    this.default.y = y;
    this.native.moveTo(x, y);
    this.native.setShowInTaskbar(false);

    this.websocket.open((data) => {
      if (data && data.content === 'msg') {
        let item = data.extras;
        if (window.nw && window.nwNotify && !this.mainWindow) {
          window.nwNotify.notify({
            title: '瓦特',
            text: this.messageService.getMsgContent(item.dialogueInfo),
            onClickFunc: (event) => {
              try {
                this.openMain();
              } finally {
                event.closeNotification();
              }
            }
          });
        }
        if (this.mainWindow && this.mainWindow.postMsg) {
          setTimeout(() => {
            this.mainWindow.postMsg(item);
          }, 200);
        }
        if (!this.mainWindow && item && item.topicItemId) {
          this.noReadCount += 1;
          // this.noReadList.push(item);
        }
      } else if (data && data.content === 'CMDBUZ：RELOADITEM' && this.mainWindow) {
        this.mainWindow.refreshBill();
      }
    })
    this.getNoReadCount();
    this.initWebsocketHCK();
    this.initUserSessionCheck();
    this.initTrayEventHandler();
    this.keepHeartbeat();
  }

  ngOnDestroy() {
    this.websocket.destroy();
    clearInterval(this.websocketTimer);
    clearInterval(this.userSessionTimer);
    clearInterval(this.heartBeatTimer);
  }

  initUserSessionCheck() {
    if (!this.userSessionTimer) {
      this.userSessionTimer = setInterval(() => {
        this.http.checkUser(this.userVo.userId).subscribe((result) => {
          // console.log(result.toString())
        })
      }, 20 * 60 * 1000);
    }
  }

  initWebsocketHCK() {
    if (!this.websocketTimer) {
      this.websocketTimer = setInterval(() => {
        this.websocket.send('HBT1');
      }, 4 * 60 * 1000);
    }
  }

  initTrayEventHandler() {
    window.global.clickTray = () => {
      this.native.show(true);
    }
    window.global.logout = () => {
      this.http.logout().subscribe(() => {
        window.chrome.runtime.reload();
      })
    }
  }

  keepHeartbeat() {
    if (!this.heartBeatTimer) {
      let userName = this.userVo.userName;
      let token = this.userVo.accessToken;
      this.heartBeatTimer = setInterval(() => {
        this.http.keepHeartbeat(token, userName).subscribe(data => {
          console.log("keep heartbeat." + data);
          let result = data.json();
          if (result.RET_STATUS === 1 || (!result.RET_STATUS && result.RET_STATUS !== 0)) {
            console.log("RET_DESC: " + result.RET_DESC);
            this.native.removeTray();
            window.chrome.runtime.reload();
          }
        })
      }, 5 * 60 * 1000);
    }
  }

  getNoReadCount() {
    this.http.get('contactsController/queryConverContacts?pageNo=1&pageSize=20&replyNeed=1').subscribe((data) => {
      let converList = data.json();
      let ciciConverItem = null;
      for (let i = 0; i < converList.length; i++) {
        let item = converList[i];
        if (item.converVo && item.converVo.contactsId && item.converVo.contactsId === this.ciciUserId) {
          ciciConverItem = item;
          break;
        }
      }
      if (ciciConverItem) {
        this.noReadCount = ciciConverItem.noReadNum;
      }
    })
  }

  openMain() {
    let self = this;
    if (this.mainWindow === null && !this.isMoving) {
      this.mainWindow = {};
      this.native.open(window.location.origin + window.location.pathname + '/index.html#/main', {
        width: 760,
        height: 566,
        "min_width": 760, // 700
        "min_height": 566, // 500
        focus: true,
        frame: false
      }, function (new_win) {
        if (new_win.on) {
          new_win.on('loaded', () => {
            self.mainWindow = self.initMainWindow(new_win);
            if (self.noReadCount > 0) {
              self.noReadCount = 0;
              self.mainWindow.postMsgList(self.noReadList);
              self.ref.detectChanges();
            }
          })
          new_win.on('closed', () => {
            self.noReadCount = 0;
            self.noReadList = [];
          })
        }
      })
      if (window.nw && window.nwNotify) {
        window.nwNotify.closeAll()
      }
    } else if (this.mainWindow && this.mainWindow.restore) {
      this.mainWindow.restore();
      this.mainWindow.focus();
    }
  }

  initMainWindow(new_win) {
    new_win.on('close', () => {
      new_win.close(true);
    })
    new_win.on('closed', () => {
      this.mainWindow = null;
    })
    return {
      restore: () => {
        new_win.restore();
      },
      focus: () => {
        new_win.focus();
      },
      postMsg: (msg) => {
        new_win.window.postMsg(msg);
      },
      postMsgList: (msg) => {
        new_win.window.postMsgList(msg);
      },
      refreshBill: () => {
        new_win.window.refreshBill();
      }
    }
  }

  mousemove(event) {
    if (this.isMoving) {
      let changeX = event.offsetX - this.winPos.x;
      let changeY = event.offsetY - this.winPos.y;
    }
  }

  mouseup(event) {
    if (event.witch == 1) {
      setTimeout(() => {
        this.isMoving = false;
      }, 100);
    }
  }

  mousedown(event) {
    if (event.which === 1) {
      if (this.clickCount >= 1) {
        this.isMoving = false;
        this.clickCount = 0;
        this.openMain();
        return;
      }
      this.clickCount += 1;
      this.isMoving = true;
      this.updateWinPos(event);
      setTimeout(() => {
        this.clickCount = 0;
      }, 200);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  updateWinPos(event) {
    this.winPos.x = event.offsetX;
    this.winPos.y = event.offsetY;
  }

}
