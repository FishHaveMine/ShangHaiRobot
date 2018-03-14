
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoryMessageComponent} from './history-message.component';

const routes: Routes = [
  {
    path: '',
    component: HistoryMessageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HistoryMessageRoutingModule { }
