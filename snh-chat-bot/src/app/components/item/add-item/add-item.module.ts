import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddItemComponent } from './add-item.component';
import { AddItemRoutingModule } from './add-item.module.router';
import { UEditorModule } from "ngx-ueditor";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AddItemRoutingModule,
        UEditorModule.forRoot({
            // 指定ueditor.js路径目录
            path: 'assets/ueditor/',
            // 默认全局配置项
            options: {
                themePath: 'assets/ueditor/themes/'
            }
        })
    ],
    declarations: [
        AddItemComponent
    ],
    exports: [
        AddItemComponent
    ]
})

export class AddItemModule {

}