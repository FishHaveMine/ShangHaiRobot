import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AboutUsComponent } from './aboutus.component';
import { FormsModule } from '@angular/forms';
import { AboutusRoutingModule } from './aboutus.module.router';


@NgModule({
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    AboutusRoutingModule
  ],
  declarations: [
    AboutUsComponent
  ],
  exports: [
    AboutUsComponent
  ],
})
export class AboutusModule { }
