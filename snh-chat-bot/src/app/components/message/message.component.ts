import { Component, OnInit, ViewEncapsulation, ElementRef, Output, EventEmitter, NgZone, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Params } from '@angular/router/src/shared';
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { RobotKingMuResourceService } from '../../service/resource/robot-kingmu-resource.service';

declare let window;

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  // encapsulation: ViewEncapsulation.Emulated// None | Emulated | Native
  encapsulation: ViewEncapsulation.None
})
export class MessageComponent {

  // 通信组建，传递值为指令
  @Output() messagRespone = new EventEmitter();
  @Input('topicId') topicId: string;

  userVo: any;
  sendMessages: string;
  showDetail: boolean = false;
  converLists = {};
  messageList = {};
  topids: string;
  userID: string;
  showSearchFlag: string;

  constructor(
    private router: Router,
    private http: Http,
    private el: ElementRef,
    private local: LocalstorageService,
    private kingMuResourceService: RobotKingMuResourceService,
    private native: NativeService,
    private ngZone: NgZone,
    private route: ActivatedRoute) { }

  topIdRespone(event: string) {
    alert(event);
  }

  public sendCommand(command) {
    this.sendMessages = command;
    this.sendMessage(1);
  }

  sendMessage(event: any) {
    if(event == 1){
      if (this.sendMessages && this.sendMessages.length > 0) {
        this.kingMuResourceService.saveConversation(this.topicId, this.sendMessages).subscribe((dialogueVo) => {
          this.messagRespone.emit(dialogueVo);
          this.sendMessages = null;
        })
      }
    }else if(event == 2){
      this.showSearchFlag = 'openShowSearch';
      this.messagRespone.emit(this.showSearchFlag);
    }
  }

  sendMessageMouse(){
    this.sendMessage(1);
  }

  // 添加Ctr+Enter回车触发
  enterEvent(event: any) {
    if (event.ctrlKey && event.keyCode == 13) {
      this.sendMessage(1);
    }
  }

  // 查看聊天记录
  searchMessage(){
    this.sendMessage(2);

  }
}