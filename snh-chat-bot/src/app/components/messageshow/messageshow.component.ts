import { Component, OnInit, OnDestroy, ViewEncapsulation, Input, Output, ChangeDetectorRef, ElementRef, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService, DialogOptions } from "ngx-bootstrap-modal";
// import { BsModalService } from "ngx-bootstrap/modal";
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { RobotKingMuResourceService } from '../../service/resource/robot-kingmu-resource.service';
import { MessageService } from '../../service/MessageService';
import { HttpService } from '../../service/HttpService';
import { MomentPipe } from '../../pipe/moment/moment.pipe';
import { timestamp } from 'rxjs/operators/timestamp';
import { ItemComponent } from '../item/item.component';

declare let window;

@Component({
  selector: 'app-messageshow',
  templateUrl: './messageshow.component.html',
  styleUrls: [
    './messageshow.component.scss',
    "../../../../node_modules/bootstrap/dist/css/bootstrap.css",
    "../../../../node_modules/ngx-bootstrap-modal/components/dialog.scss"
  ],
  encapsulation: ViewEncapsulation.None
})
export class MessageshowComponent implements OnInit, OnDestroy {

  msgList = [];
  userVo: any;
  userId: string;
  selectedOrg;
  msgListEle;
  loadMore: boolean = true;
  isLoading: boolean = false;
  pageSize: number = 10;
  robotUserId: string;

  @Input('topicId') topicId: string;
  @Input() isShowRight: boolean;

  constructor(
    private sanitizer: DomSanitizer,
    private local: LocalstorageService,
    private native: NativeService,
    private http: HttpService,
    private chRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private dialogService: DialogService,
    // private modalService: BsModalService,
    private messageService: MessageService,
    private kingMuResourceService: RobotKingMuResourceService) {
    this.robotUserId = kingMuResourceService.userId;
  }

  ngOnInit() {
    // 通过登录缓存，获取userID
    this.userVo = this.local.get('userInfo');
    this.userId = this.userVo.userId;
    this.selectedOrg = this.local.get('selected_org');
  }

  ngOnDestroy() {
    this.msgListEle.removeEventListener('scroll', this.onScrollerHandler);
  }

  ngAfterViewInit() {
    this.msgListEle = this.elementRef.nativeElement.querySelector('.message-show-panel');
    this.msgListEle.addEventListener('scroll', this.onScrollerHandler.bind(this));
  }

  onScrollerHandler(event) {
    let target = event.target;
    if (!this.isLoading && this.loadMore && target && target.scrollTop <= 30) {
      let scrollerHeightTmp = target.scrollHeight;
      this.loadMsg().then((data) => {
        setTimeout(() => {
          target.scrollTop = target.scrollHeight - scrollerHeightTmp
        }, 10);
      })
    }
  }

  loadMsg() {
    this.isLoading = true;
    return new Promise((resolve) => {
      let timestamp = this.msgList[0].createDate;
      this.kingMuResourceService.getConverList(this.topicId, this.pageSize, timestamp).subscribe(converList => {
        if (converList.dialogues && converList.dialogues.length > 0) {
          let count = converList.dialogues.length - 1;
          for (; count >= 0; count--) {
            let item = converList.dialogues[count];
            if (item.userId == this.userId) {
              item.myself = true;
            }
            item = this.parseDialogueVo(item);
            this.msgList.unshift(item);
            this.addShowTime(item, 'unshift');
          }
          if (converList.dialogues.length === this.pageSize) {
            this.isLoading = false;
          }
        }
        resolve();
      });
    })
  }

  isSameMinute(item, type) {
    let voB;
    if (type === 'push') {
      voB = this.msgList[this.msgList.length - 1];
    } else if (type === 'unshift') {
      voB = this.msgList[1];
    }
    if (!item || !item.createDate) {
      return false;
    }
    if (!voB && item && item.createDate) {
      return true;
    }
    return Math.floor(item.createDate / 60000) !== Math.floor((voB.createDate / 60000));
  }

  addShowTime(item, type) {
    item.showTime = this.isSameMinute(item, type);
  }

  pushMsgList(item) {
    if (item) {
      item = this.parseDialogueVo(item);
      this.addShowTime(item, 'push');
      this.msgList.push(item);
      this.chRef.detectChanges();
      this.setScroller();
      this.http.setConversationReaded(this.topicId);
    }
  }

  private parseDialogueVo(item) {
    if (item.dialogueType === 13) {
      item.dialogueInfo = this.changeUrlArg(item.dialogueInfo, 'compId', this.selectedOrg.orgId);
      item.dialogueInfo = this.changeUrlArg(item.dialogueInfo, 'tokenid', this.userVo.accessToken);
      item.dialogueInfo = this.changeUrlArg(item.dialogueInfo, 'ecpDataContext.tokenId', this.userVo.accessToken);

      item.html = this.sanitizer.bypassSecurityTrustResourceUrl(item.dialogueInfo);
    } else if (item.userId == this.robotUserId) {
      if (item.dialogueInfo.indexOf('@&@') > -1) {
        let reg = /@&@.*?@&@/g;
        let commands = item.dialogueInfo.match(reg);
        for (let command of commands) {
          let obj = this.messageService.getMsgObj(command);
          let replacedText = obj.msg || obj.name;
          let aObj = "<a href=javascript:iswCommand('" + encodeURIComponent(JSON.stringify(obj)) + "','" + item.topicItemId + "') class='command-text' ondragstart='return false;'>" + replacedText + "</a>";
          item.dialogueInfo = item.dialogueInfo.replace(command, aObj);
        }
      }
      if (item.dialogueInfo.indexOf('changFolderName') > -1) {
        var reg = /collapse.{1,10}href=.#(\S{32})./img;
        item.dialogueInfo = item.dialogueInfo.replace(reg, (match) => {
          return match.replace('href', ' class="command-text" href-name')
        })
      }
      item.dialogueInfo = this.sanitizer.bypassSecurityTrustHtml(item.dialogueInfo);
    }
    return item;
  }

  changeUrlArg(url, arg, val) {
    var pattern = arg + '=([^&]*)';
    var replaceText = arg + '=' + val;
    // return url.match(eval('/'+pattern+'/i')) ? url.replace(eval('/(' + arg + '=)([^&]*)/gi'), replaceText) : url;
     return url.match(pattern) ? url.replace(eval('/(' + arg + '=)([^&]*)/gi'), replaceText) : (url.match('[\?]') ? url + '&' + replaceText : url + '?' + replaceText);
  }

  // 点击聊天窗口的待办事项 【是】或者【否】之后回调，去除超链接样式
  rendererMsg(topicItemId, messageContent) {
    for (let msg of this.msgList) {
      if (msg.topicItemId == topicItemId) {
        msg.dialogueInfo = messageContent;
        break;
      }
    }
  }

  public setScroller() {
    this.msgListEle.scrollTop = this.msgListEle.scrollHeight;
  }
  
  showConfirm(option) {
    this.dialogService.addDialog(ItemComponent, {
      title: option
    }, {
      backdrop: 'static',
      keyboard: false
    }).subscribe((isConfirmed) => {
    });
  }

}
