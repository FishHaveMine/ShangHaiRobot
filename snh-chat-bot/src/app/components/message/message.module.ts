import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MessageComponent } from './message.component';
import { MessageRoutingModule } from './message.module.router';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MessageComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    MessageRoutingModule
  ],
  exports: [
    MessageComponent,
  ],
})
export class MessageModule { }
