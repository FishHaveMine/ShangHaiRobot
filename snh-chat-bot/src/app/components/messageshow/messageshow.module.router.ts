
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MessageshowComponent } from './messageshow.component';

const routes: Routes = [
  {
    path: '',
    component: MessageshowComponent,
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
export class MessageshowRoutingModule { }
