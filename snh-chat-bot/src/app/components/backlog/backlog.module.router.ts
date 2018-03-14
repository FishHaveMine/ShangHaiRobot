
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BacklogComponent } from './backlog.component';
import {BacklogcontentComponent} from './backlogcontent/backlogcontent.component'

const routes: Routes = [
  {
    path: '',
    component: BacklogComponent,
    children:[
      {
        path: '',
        component: BacklogcontentComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BacklogRoutingModule { }
