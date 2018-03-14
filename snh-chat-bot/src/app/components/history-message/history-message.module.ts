import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HistoryMessageComponent} from './history-message.component';
import { HistoryMessageRoutingModule } from './history-message.module.router';

@NgModule({
    declarations: [
        HistoryMessageComponent
    ],
    imports: [
        HttpClientModule,
        FormsModule,
        CommonModule,
        HistoryMessageRoutingModule
    ],
    exports: [
        HistoryMessageComponent
    ]
})

export class HistoryMessageModule {
    
}