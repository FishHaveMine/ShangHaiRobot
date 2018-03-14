import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ngx-bootstrap-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AddItemComponent } from './add-item/add-item.component';
export interface ItemModel {
    type:string;
}
@Component({
    selector: 'item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss']
})

export class ItemComponent extends DialogComponent<ItemModel, boolean> implements ItemModel, OnInit {
    type: string;
    activeYears = [];
    activeMonths = [];
    itemStatus: string = "未发布";

    constructor(dialogService: DialogService,
        private router: Router,) {
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

     // 通过路由传递参数到子页面
  goAddItemDetail(event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['detail'], {
      relativeTo: this.route
    });
  }

  showAddItem(option) {
    this.dialogService.addDialog(AddItemComponent, {
      title: option
    }, {
      backdrop: 'static',
      keyboard: false
    }).subscribe((isConfirmed) => {
    });
  }

}