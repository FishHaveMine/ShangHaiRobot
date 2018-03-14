import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BacklogcontentComponent } from './backlogcontent.component';
import { BacklogRoutingModule } from './backlogcontent.module.router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatTabsModule, MatInputModule } from '@angular/material';
import { MomentcoverPipe } from '../../../pipe/moment/momentcover.pipe';
@NgModule({
  declarations: [
    BacklogcontentComponent,
    MomentcoverPipe
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    BacklogRoutingModule,
    MatButtonModule,
    MatTabsModule,
    MatInputModule,
  ],
  exports: [
    BacklogcontentComponent
  ],
})
export class BacklogcontentModule { }
