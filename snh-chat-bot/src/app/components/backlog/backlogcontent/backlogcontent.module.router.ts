
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BacklogcontentComponent } from './backlogcontent.component';

const routes: Routes = [
  {
    path: '',
    component: BacklogcontentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BacklogRoutingModule { }
