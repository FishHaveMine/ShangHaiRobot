import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BacklogComponent } from './backlog.component';
import { BacklogRoutingModule } from './backlog.module.router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatTabsModule, MatInputModule } from '@angular/material';
import { BacklogcontentModule } from './backlogcontent/backlogcontent.module';

@NgModule({
  declarations: [
    BacklogComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    BacklogRoutingModule,
    BacklogcontentModule,
    MatButtonModule,
    MatTabsModule,
    MatInputModule,
  ],
  exports: [
    BacklogComponent
  ],
})
export class BacklogModule { }
