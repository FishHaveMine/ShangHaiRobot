import { Component, OnInit, ViewEncapsulation, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgModel } from '@angular/forms';
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { HttpService } from '../../service/HttpService';
import { DownloadFileService } from '../../service/DownloadFileService';
import { RobotKingMuResourceService } from '../../service/resource/robot-kingmu-resource.service';

import { MessageshowComponent } from "../../components/messageshow/messageshow.component";
import { MessageComponent } from "../../components/message/message.component";
import { BacklogComponent } from "../../components/backlog/backlog.component";
import { UsualCommandComponent } from "../../components/usual-command/usual-command.component";
import { Output } from '@angular/core/src/metadata/directives';

declare let window;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {

  @ViewChild(MessageshowComponent) messageshowComponent;
  @ViewChild(MessageComponent) messageComponent;
  @ViewChild(BacklogComponent) backlogComponent;
  @ViewChild(UsualCommandComponent) usualCommandComponent;

  robotUserId: string;
  topicId: string = '';
  showDetail: boolean = false;
  chooseView: string = 'message';
  isMinimize: boolean = false;
  win: any = window.nw.Window.get();
  callback: any;

  isShowRight = false;

  winState = 0;
  showSearchDetail: boolean = false;
  otherDetailClose: boolean = true;

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    private local: LocalstorageService,
    private native: NativeService,
    private http: HttpService,
    private doenloadFile: DownloadFileService,
    private ref: ChangeDetectorRef,
    private kingMuResourceService: RobotKingMuResourceService) {
    this.robotUserId = kingMuResourceService.userId;
  }

  ngOnInit() {
    //================================ 收到的消息，勿删 ================================
    window.postMsg = (dialogueVo) => {
      dialogueVo.myself = false;
      if (dialogueVo && dialogueVo.topicItemId) {
        this.messageshowComponent.pushMsgList(dialogueVo);
        if (this.isMinimize) {
          this.win.requestAttention(2);
        }
      }
    }
    window.postMsgList = (dialogueVoList) => {
      let dialogueVo;
      for (let i = 0; i < dialogueVoList.length; i++) {
        dialogueVo = dialogueVoList[i];
        dialogueVo.myself = false;
        if (dialogueVo && dialogueVo.topicItemId) {
          this.messageshowComponent.pushMsgList(dialogueVo);
        }
      }
    }
    //================================ 收到的消息，勿删 ================================
    window.iswCommand = (obj, topicItemId) => {
      obj = JSON.parse(decodeURIComponent(obj))
      if (obj.type == 0) {
        let status = '0';
        let messageContent = obj.data.messageContent;
        // 清除会话显示样式样式，通知后台修改msg
        if ("是" == obj.msg) {
          status = '1';
          messageContent = messageContent + " (已反馈：是)";
        } else {
          messageContent = messageContent + " (已反馈：否)";
        }
        this.kingMuResourceService.updateGrcMessageStatus(obj.data.itemBillId, obj.data.businessDate,
          obj.data.compId, obj.data.userId, messageContent, status, topicItemId).subscribe((resp) => {
            if (resp && resp.status === 200) {
              let result = resp.json();
              if (result.code == 0) {
                // 回调messageShow，修改样式
                this.ngZone.run(() => {
                  this.messageshowComponent.rendererMsg(topicItemId, messageContent);
                })
              }
            }
          })
      } else if (obj.type == 1) {
        this.gotoBlocklog();
        // 跳转到backlogcontent， itemType表示打开的页面
        this.ngZone.run(() => {
          this.backlogComponent.setBacklogType(obj.itemType);
        })
        this.ref.detectChanges();
      } else if (obj.type == 2) {
        let url = obj.url;
        let reg = /^.+\?.+$/;
        let userVo = this.local.get('userInfo');
        let token = userVo.accessToken;
        let org = this.local.get('selected_org');
        let compid = org.orgId;
        if (reg.test(url)) {
          url += "&compid=" + compid + "&tokenid=" + token + "&ecpdatacontext.tokenid=" + token;
        } else {
          url += "?compid=" + compid + "&tokenid=" + token + "&ecpdatacontext.tokenid=" + token;
        }
        this.native.openExternal(url);
      } else if (obj.type == 3) {
        obj.myself = false;
        this.messageshowComponent.pushMsgList(obj);
      } else if (obj.type == 8) {
        let ele = window.document.querySelector('.download');
        ele.nwsaveas = obj.content.attachName;
        ele.click();
        ele.removeEventListener('change', this.callback);
        this.callback = this.beginDownload.bind(this, ele, obj);
        ele.addEventListener('change', this.callback);
      } else {
        this.gotoKingMu();
        this.messageComponent.sendCommand(obj.msg);
      }
    }
    window.changFolderName = function changFolderName(id) {
      let body = window.document.getElementById(id);
      let button = window.document.querySelector("[href-name$='#" + id + "']");
      if (button.text == "展开") {
        button.text = "折叠";
        body.className = body.className.replace(' collapse', '');
      } else {
        button.text = "展开";
        body.className = body.className + ' collapse';
      }
      return false;
    }
    window.refreshBill = () => {
      this.ngZone.run(() => {
        this.backlogComponent.refreshBill();
      })
    }
    this.getTopicVo();
    this.win.on('minimize', () => {
      this.isMinimize = true;
    })
    this.win.on('restore', () => {
      this.isMinimize = false;
    })
    // 第一次打开，清除GRC的cookies
    this.native.clearCookies();

    this.otherDetailClose = true;
  }

  beginDownload(ele, obj, event) {
    let diskPath = ele.value;
    let attachName = obj.content.attachName;
    let attachId = obj.content.attachId;
    let option = { open: true };
    this.doenloadFile.downloadFileToDisk(attachId, attachName, diskPath, option);
    ele.files = null;
    ele.value = null;
  }

  ngAfterViewInit() {
    this.gotoKingMu();
  }

  getTopicVo() {
    // 通过userID获取topicId，与机器人建立连接
    this.kingMuResourceService.getTopId(this.robotUserId, 5).subscribe(topicVo => {
      this.topicId = topicVo.topicId;
      this.http.setConversationReaded(this.topicId);
      if (topicVo.dialogues) {
        topicVo.dialogues.forEach((item) => {
          if (item.userId !== this.robotUserId) {
            item.myself = true;
          }
          this.messageshowComponent.pushMsgList(item);
        })
      }
    });
  }

  // 显示邮编的命令页
  openDetail() {
    this.showDetail = !this.showDetail;
    if (this.showDetail) {
      this.el.nativeElement.querySelector('.messRobot-panel').style.right = 'unset';
    } else {
      this.el.nativeElement.querySelector('.messRobot-panel').style.right = '0';
    }
  }

  //接收发送的消息
  messagRespone(sendMessages: any) {
    // 通过指令页"message"传过来的输入信息
    if (sendMessages && sendMessages.topicItemId) {
      sendMessages.myself = true;
      this.messageshowComponent.pushMsgList(sendMessages);
    }else if(sendMessages == 'openShowSearch'){
      this.showSearchDetail = true;
      this.otherDetailClose = false;
    }else if(sendMessages == 'closeShowSearch'){
      this.showSearchDetail = false;
      this.otherDetailClose = true
    }
  }

  gotoKingMu() {
    this.chooseView = 'message';
    this.messageshowComponent.setScroller();
  }
  gotoBlocklog() {
    this.chooseView = 'backlog';
  }

  showUsualCommand() {
    this.isShowRight = !this.isShowRight;
    this.usualCommandComponent.loadcommand(this.isShowRight);
  }

  minimize() {
    this.native.minimize();
  }

  maximize() {
    if (this.winState == 0) {
      this.winState = 1;
      this.native.maximize();
    } else {
      this.winState = 0;
      this.native.restore();
    }
  }

  close() {
    this.http.setConversationReaded(this.topicId);
    this.native.close();
  }

  // 如果点击屏幕或者发送消息窗口，弹出的对话框自动收回
  hidenUsualCommandClk() {
    if (this.isShowRight) {
      this.showUsualCommand();
      // this.isShowRight = !this.isShowRight;
    }
  }
}
