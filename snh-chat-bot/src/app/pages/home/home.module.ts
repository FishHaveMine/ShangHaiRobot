import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home.module.router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatTabsModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    HomeRoutingModule,
    MatButtonModule,
    MatTabsModule,
    MatInputModule,
  ],
  declarations: [
    HomeComponent
  ],
  exports: [
    HomeComponent
  ],
})
export class HomeModule { }
