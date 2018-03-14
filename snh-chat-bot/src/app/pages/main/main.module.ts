import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MainComponent } from './main.component';
import { MainRoutingModule } from './main.module.router';
import { FormsModule } from '@angular/forms';
import { MessageModule } from '../../components/message/message.module';
import { MessageshowModule } from '../../components/messageshow/messageshow.module';
import { BacklogModule } from '../../components/backlog/backlog.module';
import { UsualCommandModule } from '../../components/usual-command/usual-command.module';
import { HistoryMessageModule } from '../../components/history-message/history-message.module';

@NgModule({
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    MainRoutingModule,
    MessageModule,
    MessageshowModule,
    BacklogModule,
    UsualCommandModule,
    HistoryMessageModule
  ],
  declarations: [
    MainComponent
  ],
  exports: [
    MainComponent
  ],
})
export class MainModule { }
