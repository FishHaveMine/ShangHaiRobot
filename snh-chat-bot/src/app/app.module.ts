
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app.module.router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LocalstorageService } from './service/LocalstorageService';
import { NativeService } from './service/NativeService';
import { HttpService } from './service/HttpService';
import { WebsocketService } from './service/WebsocketService';
import { RobotKingMuResourceService } from './service/resource/robot-kingmu-resource.service';
import { MessageService } from './service/MessageService';
import { BacklogService } from './service/BacklogService';
import { DownloadFileService } from './service/DownloadFileService';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    HttpModule,
    RouterModule,
    AppRoutingModule,
  ],
  providers: [
    LocalstorageService,
    NativeService,
    HttpService,
    WebsocketService,
    RobotKingMuResourceService,
    BacklogService,
    MessageService,
    DownloadFileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
