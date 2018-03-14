import { Component, OnInit, ViewEncapsulation, ElementRef, NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgModel } from '@angular/forms';
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { HttpService } from '../../service/HttpService';
import { DownloadFileService } from '../../service/DownloadFileService';

declare let window;

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AboutUsComponent implements OnInit {

  aboutusVersion: string;

  constructor(
    private el: ElementRef,
    private ngZone: NgZone,
    private local: LocalstorageService,
    private native: NativeService,
    private http: HttpService,
    private doenloadFile: DownloadFileService,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {

    let pkg;
    let updater = window.require('node-webkit-updater');
    pkg = window.require('../../../package.json');
    this.aboutusVersion = pkg.version;
    console.log(pkg);

  }

  closeaboutus(){
    this.native.close();
  }

  
}
