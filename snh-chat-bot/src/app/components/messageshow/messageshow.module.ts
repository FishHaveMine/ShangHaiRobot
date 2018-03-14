import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BootstrapModalModule } from 'ngx-bootstrap-modal';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DialogService } from "ngx-bootstrap-modal";
import { BsModalService } from "ngx-bootstrap/modal";
import { MessageshowComponent } from './messageshow.component';
import { MessageshowRoutingModule } from './messageshow.module.router';
import { FormsModule } from '@angular/forms';
import { MomentPipe } from '../../pipe/moment/moment.pipe';
import { ItemComponent } from '../item/item.component';
import { ItemModule } from '../item/item.module';


@NgModule({
  declarations: [
    MessageshowComponent,
    MomentPipe
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    BootstrapModalModule,
    ModalModule.forRoot(),
    CommonModule,
    MessageshowRoutingModule,
    ItemModule
  ],
  exports: [
    MessageshowComponent,
  ],
  entryComponents: [
    ItemComponent
  ],
  providers: [
    DialogService,
    BsModalService
  ]
})
export class MessageshowModule { }
