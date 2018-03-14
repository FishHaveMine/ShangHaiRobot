import { Component, OnInit, ViewEncapsulation ,NgZone, Output , EventEmitter ,Input   } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Params } from '@angular/router/src/shared';
import { LocalstorageService } from '../../../service/LocalstorageService';
import { NativeService } from '../../../service/NativeService';
import { WebsocketService } from '../../../service/WebsocketService';
import { BacklogService } from '../../../service/BacklogService';
import { MomentcoverPipe } from '../../../pipe/moment/momentcover.pipe';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-backlogcontent',
  templateUrl: './backlogcontent.component.html',
  styleUrls: [
    './backlogcontent.component.scss',
    '../backlog.component.scss'
  ],
  providers: [BacklogService], // <-- 导入service 必须注意这里
  encapsulation: ViewEncapsulation.Native// None | Emulated | Native
})
export class BacklogcontentComponent implements OnInit {

  orgBacklogList: any = [];
  orgBacklogListLength: number = 0;
  orgBacklogList_daiban: any = [];
  orgBacklogList_daibanLength: number = 0;
  showStatus:number;
  showOwnType:boolean;
  showLoad:boolean = false;

  today:number = new Date().setHours(23, 59, 59, 0); 
  todayStart:number = new Date().setHours(0, 0, 0, 0); 
  tillTime:number = new Date().getTime();
 

  /*today:number = 1514649599000; 
  todayStart:number = 1514563200000; 
  tillTime:number = 1514620800000;  */

  entered_timerM:number;

  userInfo =  this.local.get('userInfo');
  selected_org=  this.local.get('selected_org');

  @Input()  public selectItem : string;
  @Output() sendMsg = new EventEmitter();

  constructor(
    private router: Router,
    private http: Http,
    private ngZone: NgZone,
    private local: LocalstorageService,
    private native: NativeService,
    private websocket: WebsocketService,
    private BacklogService: BacklogService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute) { }
    private timer;

  ngOnInit() {
     if(this.selectItem != "单据待办"){
      this.getDetail(this.selectItem,0,true);  //默认显示该项下的全部信息 status——》0
     }  
  }

  // 每五秒更新时间差
  ngAfterViewInit() {
    let enterTime = new Date();
    this.entered_timerM = enterTime.getMinutes();
   
    this.timer = setInterval(() => {
      //判断 系统时间的分钟数 跟 进入时保存的分钟数是否一致
      let timerTime = new Date();
      let timer_timerM = timerTime.getMinutes(); 
        //实现了计算器 触发条件时刷新 对应的分钟显示 (添加条件——》 除“单据待办外”)
        if(timer_timerM != this.entered_timerM){
            this.entered_timerM = timer_timerM;
            if(this.selectItem != "单据待办"){
              this.ngZone.run(() => {
                this.countTime(this.orgBacklogList);
              })
            }else{
              this.ngZone.run(() => {
                this.countToCurPostTime(this.orgBacklogList_daiban);
              })
            }
        }
    }, 5000);
  }
  
  // 销毁组件时清除定时器
  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  groupByCategory(data){
    if (!data) return;
    // 获取目录名，使用ES6中Set进行去重处理
    const categories = new Set(data.map(x => x.orgId));

    // 重新生成二维数组，用于页面显示
    const result = Array.from(categories).map(x => ({
        orgId: x,
        orgMsg: data.filter(orgMsg => orgMsg.orgId === x),
        posts: data.filter(post => post.orgId === x)
    }));
    
    return result;
  }

  getDetail(selectItemInit,status,isshowLoad) {  // 0.全部  1.待办
    this.showStatus = status;
    let searchtypeCode;  
    this.selectItem = selectItemInit;
    if (selectItemInit != "单据待办") {
      switch(selectItemInit)
      {
        case '年终决算':searchtypeCode = 2;break;
        case '月结':searchtypeCode = 0;break;
        case '年结':searchtypeCode = 1;break;
      }
      
      this.ngZone.run(() => {
        this.showLoad = isshowLoad;
        this.showOwnType = true;
        this.orgBacklogListLength = 0;
        this.orgBacklogList = []; 
        let isShowAll = this.showStatus == 0?false:true;  //  true.全部  false.待办
        this.BacklogService.queryItemProjectsByPromise(searchtypeCode,1,isShowAll).then((res) => {
          this.sendMsg.emit({"daibanLength":res.length,"showDaiBan":false});   
          this.showLoad = false;
          this.orgBacklogListLength = res.length;
          this.orgBacklogList = this.groupByCategory(res); 
          for(let x in this.orgBacklogList){
                  for(let y in this.orgBacklogList[x].posts){
                    this.orgBacklogList[x].posts[y].projectName = this.sanitizer.bypassSecurityTrustHtml( this.orgBacklogList[x].posts[y].projectName);
                  }
          }

          this.countTime(this.orgBacklogList);
        });
      });    
    } else {  
      // userId：836779          orgId：1411
      this.ngZone.run(() => {
        this.showLoad = isshowLoad;
        this.getBill();
      });
    }
  }

  getBill() {
    this.showOwnType = false;
    this.orgBacklogList_daibanLength = 0;
    this.orgBacklogList_daiban = []; 
    this.BacklogService.getWorkItemTodoListById(this.userInfo['userId'],this.selected_org['orgId']).subscribe((res) => {
      this.showLoad = false;
      this.orgBacklogList_daibanLength = res.length;
      this.orgBacklogList_daiban = res;
      this.countToCurPostTime(this.orgBacklogList_daiban);
      this.sendMsg.emit({"daibanLength":res.length,"showDaiBan":true});   
      if (this.orgBacklogList_daibanLength > 0) {
        for (let backLog of this.orgBacklogList_daiban) {
          let reg = /^.+\?.+$/;
          let userVo = this.local.get('userInfo');
          let token = userVo.accessToken;
          let org = this.local.get('selected_org');
          let compid = org.orgId;
          if (reg.test(backLog.operatorUrl)) {
            backLog.operatorUrl += "&compid="+ compid + "&tokenid=" + token + "&ecpdatacontext.tokenid=" + token;
          } else {				
            backLog.operatorUrl += "?compid="+ compid + "&tokenid=" + token + "&ecpdatacontext.tokenid=" + token;
          }                
        }
      }
    });
  }

  countTime(list){
    //计算每个项目 跟 今天的时间差
    this.tillTime = new Date().getTime();
    let s1 = this.tillTime;
    for(let x in list){

      for(let y in list[x].posts){
        let s2 = list[x].posts[y].endTime;
        let runTime = (s2 - s1) / 1000;runTime = runTime % (86400 * 365);runTime = runTime % (86400 * 30);
        let day = Math.floor(runTime / 86400);
          runTime = runTime % 86400;
        var hour = Math.floor(runTime / 3600);
        list[x].posts[y].endTime_day = day;
       // list[x].posts[y].projectName = this.sanitizer.bypassSecurityTrustHtml( list[x].posts[y].projectName);
      }

    }
  }
  countToCurPostTime(list){
    this.tillTime = new Date().getTime();
    let s1 = this.tillTime;
    for(let y in list){
      let s2 = new Date(list[y].toCurPostTime).getTime();
      let runTime = (s2 - s1) / 1000;runTime = runTime % (86400 * 365);runTime = runTime % (86400 * 30);
      let day = Math.floor(runTime / 86400);
        runTime = runTime % 86400;
      var hour = Math.floor(runTime / 3600);
      list[y].endTime_day = Math.abs(day);
      list[y].endTime_dayDetail = s2;
    }
  }

  setItemStatus(project,status,ItemStatus){
  
    if(ItemStatus == status || this.todayStart > project.endTime)
      {
        return false;
      }
    let statusName = status==1?"未完成":"已完成";
    let r=confirm("确定修改状态为:"+statusName)
    if(r==true)
      {
        this.BacklogService.updateProjectUserStatus(project.projectId,project.orgId,status).subscribe((res) => {
          if(res.code == 0){
            this.ngZone.run(() => {
              //this.getDetail(this.selectItem,this.showStatus,false);
              project.lastReportDate = new Date().getTime();
              project.status = status;
            });
          }else{
            alert("修改状态失败");
          }
         
        });
      } 
    else
      {
        return false;
      }
  }

  openUrl(locationUrl){
    this.native.openExternal(locationUrl);
  }

  refreshBill() {
    if (!this.showOwnType) {
      this.showLoad = true;
      this.getBill();
    }
  }

}
