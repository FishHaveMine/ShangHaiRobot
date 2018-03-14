
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MessageComponent } from './message.component';

const routes: Routes = [
  {
    path: '',
    component: MessageComponent,
    // children: [
    //   {
    //     path: 'messagetxt',
    //     loadChildren: 'app/pages/message/messagetxt/messagetxt.module#MessagetxtModule'
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule { }
