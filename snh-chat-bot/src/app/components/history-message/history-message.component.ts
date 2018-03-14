import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { RobotKingMuResourceService } from '../../service/resource/robot-kingmu-resource.service';
import { LocalstorageService } from '../../service/LocalstorageService';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from '../../service/MessageService';
import { HttpService } from '../../service/HttpService';
import { NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'history-message',
    templateUrl: './history-message.component.html',
    styleUrls: ['./history-message.component.scss']
})

export class HistoryMessageComponent implements OnInit {

    // 通信组建，传递值为指令
    @Input('topicId') topicId: string;
    @Output() messagRespone = new EventEmitter();

    closeSearchFlag: string;
    msgList = [];
    userVo: any;
    userId: string;
    pageSize: number = 20;
    robotUserId: string;
    selectedOrg;
    isLoading: boolean = false;
    inputSearchMeassage: string;
    inuptSearchData: string;
    emptyPageFlag: boolean = false;
    mesgnext = [];
    mesgpre = [];
    mesgnextBut: boolean = false;
    mesgpreBut: boolean = false;



    constructor(
        private router: Router,
        private sanitizer: DomSanitizer,
        private local: LocalstorageService,
        private messageService: MessageService,
        private http: HttpService,
        private chRef: ChangeDetectorRef,
        private kingMuResourceService: RobotKingMuResourceService,
        private route: ActivatedRoute
    ) {
        this.robotUserId = kingMuResourceService.userId;
    }

    ngOnInit() {
        
        // 通过登录缓存，获取userID
    this.userVo = this.local.get('userInfo');
    this.userId = this.userVo.userId;
    this.selectedOrg = this.local.get('selected_org');
    this.isLoading = true;
    let time = new Date();
    // let timestamp = this.msgList[0].createDate;
    this.loadhistoryMessage(time, 0, 0);

    }

    loadhistoryMessage(hTimestamp, hType, clickType){
      this.msgList = [];
      let timestamp = hTimestamp;
      this.kingMuResourceService.getConverListShow(this.topicId, this.pageSize, timestamp, hType).subscribe(converList => {
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
          this.emptyPageFlag = false;
          this.mesgpreBut = false;
          this.mesgnextBut = false;
        }else{
          this.emptyPageFlag = true;
          if(clickType == 1){
            this.mesgpreBut = true;
          }else if(clickType == 2){
            this.mesgnextBut = true;
          }
        }
      });
    }

    // 根据keyword 和 data 查询聊天记录
    loadhistoryMessageByKeyword(hKeyWord, hTimestamp ,dataType){
        this.msgList = [];
        this.kingMuResourceService.getConverListShowByKeyWord(hKeyWord, this.pageSize, hTimestamp, this.topicId).subscribe(converList => {
            if (converList && converList.length > 0) {
                let count = converList.length - 1;
                for (; count >= 0; count--) {
                  let item = converList[count];
                  if (item.userId == this.userId) {
                    item.myself = true;
                  }
                  item = this.parseDialogueVo(item);
                  this.msgList.unshift(item);
                  this.addShowTime(item, 'unshift');
                }
                if (converList.length === this.pageSize) {
                  this.isLoading = false;
                }
                this.emptyPageFlag = false;
                // this.mesgpreBut = true;
                // this.mesgnextBut = true;
                this.mesgpreBut = false;
                this.mesgnextBut = false;

              }else{
                if(dataType == 3){
                  this.emptyPageFlag = true;
                  this.mesgpreBut = true;
                  this.mesgnextBut = true;
                }
              }
        });
    }

    addShowTime(item, type) {
        item.showTime = this.isSameMinute(item, type);
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

    private parseDialogueVo(item) {
        if (item.userId == this.robotUserId) {
          if (item.dialogueInfo.indexOf('@&@') > -1) {
            let reg = /@&@.*?@&@/g;
            let commands = item.dialogueInfo.match(reg);
            for (let command of commands) {
              let obj = this.messageService.getMsgObj(command);
              let replacedText = obj.msg || obj.name;
              item.dialogueInfo = replacedText;
            }
          }

          // 设置红色字体开始
          // var nWord = "${guanj}"; //获取el表达式冲文本框输入的关键字
		      // var array = nWord.split(""); //分割

          // for(var t=0; item.dialogueInfo.length; t++){

          // }
          // 设置红色字体结束

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

    closeSearchMessage(){
        this.closeSearchFlag = 'closeShowSearch';
        this.messagRespone.emit(this.closeSearchFlag);
    }

    preSearchMessage(){
      if(this.emptyPageFlag){
        this.loadhistoryMessage(this.mesgpre, 0, 1);
      }else{
        this.mesgpre = this.msgList[0].createDate;
        this.loadhistoryMessage(this.msgList[0].createDate, 0, 1);
      }
    }

    nextSearchMessage(){
      if(this.emptyPageFlag){
        this.loadhistoryMessage(this.mesgnext, 1, 2);

      }else{
        this.mesgnext = this.msgList[this.msgList.length-1].createDate;
        this.loadhistoryMessage(this.mesgnext, 1, 2);
      }
    }

    SearchMessagebutton(){
        if(this.inputSearchMeassage != "" && this.inputSearchMeassage != undefined){
          if(this.inuptSearchData != "" && this.inuptSearchData != undefined){
            let str = this.inuptSearchData;
            str = str.replace(/-/g,'/');
            let time = new Date(str);    
            this.loadhistoryMessageByKeyword(this.inputSearchMeassage, time.getTime(), 3);
          }else{
            let time = new Date();    
            this.loadhistoryMessageByKeyword(this.inputSearchMeassage, time.getTime(), 3);
          }
            
        }else{
          if(this.inuptSearchData != "" && this.inuptSearchData != undefined){
            let str = this.inuptSearchData;
            str = str.replace(/-/g,'/');
            let time = new Date(str);
            this.loadhistoryMessage(time.getTime(), 0, 0);
          }else{
            let time = new Date();
            this.loadhistoryMessage(time.getTime(), 0, 0);
          }  
        } 
    }
}