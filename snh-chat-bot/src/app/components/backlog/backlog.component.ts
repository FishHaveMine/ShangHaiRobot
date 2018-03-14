import { Component, OnInit,NgZone, ViewEncapsulation, ViewChild,ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Params } from '@angular/router/src/shared';
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { WebsocketService } from '../../service/WebsocketService';
import { BacklogcontentComponent } from './backlogcontent/backlogcontent.component'

@Component({
  selector: 'app-backlog',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
  encapsulation: ViewEncapsulation.Native// None | Emulated | Native
})
export class BacklogComponent implements OnInit {

  public backlogType: any;
  public selectedBacklogType: String;
  public showStatus: number = 0;
  public setTheHeight: String = '80%';  
  public loading: boolean = true;
  public getFromContent: any;
  public showDaiBanInHeader:boolean = false;
  public scrollAmount: number = 0;

  constructor(
    private router: Router,
    private http: Http,
    private ngZone: NgZone,
    private local: LocalstorageService,
    private native: NativeService,
    private elementRef: ElementRef,
    private websocket: WebsocketService,
    private route: ActivatedRoute) { }

    
  ngOnInit() {
    this.backlogType = ["月结", "年结", "年终决算", "单据待办"];
    this.selectedBacklogType = "月结";
    Observable.fromEvent(window,'resize').subscribe((event) => {
      this.setContentHeight();
    });
  }
  
  setContentHeight(){
    let setHeight;
    if(this.selectedBacklogType != "单据待办"){
       setHeight = window.innerHeight-47-88;
    }else{
       setHeight = window.innerHeight-96;
    }
    this.setTheHeight = setHeight+"px";
  }

  @ViewChild(BacklogcontentComponent)  // 注意！！
  childCmp: BacklogcontentComponent;

  ngAfterViewInit() {
    
  }
  // 销毁组件时清除定时器
  ngOnDestroy() {
    
  }
 

  selectItem(item) {
    this.selectedBacklogType = item;
    this.setContentHeight();
    this.childCmp.getDetail(this.selectedBacklogType,this.showStatus,this.loading);
  }
  selectItemStatus(status){
    this.showStatus = status;
    this.setContentHeight();
    this.childCmp.getDetail(this.selectedBacklogType,this.showStatus,this.loading);
  }

  public setBacklogType(index) {
    index = parseInt(index);
    this.showStatus = 0;  //跳转默认显示全部
    if (index >= 0 && index < this.backlogType.length) {
      this.selectedBacklogType = this.backlogType[index];
    } else {
      this.selectedBacklogType = "月结";
    }
    this.setContentHeight();           
    this.selectItem(this.selectedBacklogType);
  }
  getSonMsg(event){
    this.getFromContent = event;
    this.ngZone.run(() => {
    this.showDaiBanInHeader =  this.getFromContent.showDaiBan;
    });
  }

  refreshBill() {
    this.childCmp.refreshBill();
  }


  handlerScroll(event){
    console.log(event);
    this.ngZone.run(() => {
      this.scrollAmount ++;
      console.log(this.scrollAmount);
    });
     
  }
}
