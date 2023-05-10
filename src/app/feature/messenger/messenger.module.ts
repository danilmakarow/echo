import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessengerComponent } from './messenger/messenger.component';
import { DialogsComponent } from './messenger/dialogs/dialogs.component';
import { DialogComponent } from './messenger/dialogs/dialog/dialog.component';
import { ChatComponent } from './messenger/chat/chat.component';
import { MessageComponent } from './messenger/chat/message/message.component';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {RouterModule, Routes} from "@angular/router";
import {MatMenuModule} from "@angular/material/menu";

const appRoutes: Routes =[
  { path: '', redirectTo: 'chat', pathMatch:'full'},
  { path: 'chat',
    component: MessengerComponent,
    children: [{ path: ':id', component: ChatComponent }]
  },
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
    ],
    declarations: [
        MessengerComponent,
        DialogsComponent,
        DialogComponent,
        ChatComponent,
        MessageComponent
    ],
    exports: [
        MessengerComponent,
    ],
})
export class MessengerModule { }
