import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemComponent } from './item.component';
import { ItemRoutingModule } from './item.module.router';
import { AddItemModule } from './add-item/add-item.module';
import { AddItemComponent } from './add-item/add-item.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DialogService } from "ngx-bootstrap-modal";
import { BsModalService } from "ngx-bootstrap/modal";
import { BootstrapModalModule } from 'ngx-bootstrap-modal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ItemRoutingModule,
        AddItemModule,
        BootstrapModalModule,
    ModalModule.forRoot(),
        
    ],
    declarations: [
        ItemComponent
        
    ],
    entryComponents: [
        AddItemComponent
      ],
    exports: [
        ItemComponent
    ],
    providers: [
        DialogService,
        BsModalService
      ]
})

export class ItemModule {

}