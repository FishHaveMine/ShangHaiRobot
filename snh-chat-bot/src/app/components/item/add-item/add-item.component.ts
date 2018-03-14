import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DialogComponent, DialogService } from 'ngx-bootstrap-modal';
import { UEditorComponent } from 'ngx-ueditor';
export interface ItemModel {
    type:string;
}
@Component({
    selector: 'add-item',
    templateUrl: './add-item.component.html',
    styleUrls: ['./add-item.component.scss']
})

export class AddItemComponent extends DialogComponent<ItemModel, boolean> implements ItemModel, OnInit {
    type: string;
    activeYears = [];
    activeMonths = [];
    itemStatus: string = "未发布";
    
    full_source: string = ""; 
    config = {toolbars: [[
        "FullScreen", 
        "forecolor", 
        "Bold",
        "italic",
        "underline",
        "fontfamily",
        "fontsize"
    ]], autoClearinitialContent: true,  wordCount: false }



    @ViewChild('full') full: UEditorComponent;

    constructor(dialogService: DialogService,
               private el: ElementRef) {
        super(dialogService);
    }

    ngOnInit() {
        this.getActiveYearsAndMonths();
        
    }

    getActiveYearsAndMonths() {
        let currentYear = new Date().getFullYear();
        let min = currentYear - 10;
        let max = currentYear + 10;
        for (let i = min; i < max; i++) {
            this.activeYears.push(i + "年");
        }
        for (let i = 1; i < 13; i++) {
            this.activeMonths.push(i + "月");
        }
    }

    confirm() {
        // on click on confirm button we set dialog result as true,
        // ten we can get dialog result from caller code
        this.close(true);
    }
    cancel() {
        this.close(false);
    }

    getAllHtml() {
        // 通过 `this.full.Instance` 访问ueditor实例对象
        alert(this.full.Instance.getAllHtml())
        // 事件监听
        this.full.addListener('focus', () => {
            this.focus = `fire focus in ${new Date().getTime()}`;
        });
        // 事件移除
        this.full.removeListener('focus');
    }
    

}