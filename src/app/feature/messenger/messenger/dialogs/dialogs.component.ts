import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {UserDialog} from "../../../user-data.service";
import {DialogTransferService} from "../../../dialog-transfer.service";
import {BehaviorSubject, Observable, skip, Subject, takeUntil, tap} from "rxjs";
import {DialogsDataService} from "./dialogs-data.service";
import {chat, message} from "../../../../shared/interfaces/firebase";

export interface newMessage {
  ref: string,
  mes: Observable<message | undefined>
}

@Component({
  selector: 'app-dialogs',
  templateUrl: './dialogs.component.html',
  styleUrls: ['./dialogs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogsComponent implements OnInit, OnDestroy {
  public dialogs$ = new BehaviorSubject<UserDialog[] | null>(null);

  constructor(
      private store: AngularFirestore,
      public dialogTrans:DialogTransferService,
      private dialogData: DialogsDataService,
      private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.subscribeToDialogs();
  }

  // Getting dialogs and sending them to subscription func
  subscribeToDialogs() {
    this.dialogData.dialogs$.pipe(
      takeUntil(this.unsubscribe$),
      tap(dialogs => this.dialogs$.next(dialogs as UserDialog[])),
    ).subscribe(
        dialogs =>
          dialogs?.forEach(dialog => this.dialogSubscription(dialog))
        );
  }

  // Sub to changes to each dialog
  private dialogSubscription(dialog: UserDialog): void {
    this.store.doc<chat>(`chats/${dialog.ref.id}`).valueChanges()
        .pipe(
          takeUntil(this.unsubscribe$),
          skip(1),
        ).subscribe(
          newDialog => {
            this.createDialogUpdate(dialog, newDialog as chat);
          }
        );
  }

  // Takes old dialog and modifies it with data from updated one
  private createDialogUpdate(dialog: UserDialog, newDialog:chat): void {
    let dialogEl = this.dialogs$.getValue()?.find(dialogEl => dialogEl === dialog)
    dialogEl = this.changeDialog(dialogEl as UserDialog, newDialog)
    this.dialogToTop(dialogEl)
  }

  // Cuts dialog from dialogs array and puts it on top
  private dialogToTop(dialog: UserDialog): void {
    const dialogs = this.dialogs$.getValue()
    dialogs?.splice(dialogs?.findIndex(el => el.ref.id === dialog.ref.id), 1);
    dialogs?.unshift(dialog);
    this.dialogs$.next(dialogs)
    this.cdr.markForCheck()
  }

  // Takes last message from updated dialog and modifies old one
  private changeDialog(oldDialog: UserDialog, updatedDialog: chat): UserDialog {
    const lastMessage = updatedDialog.message.slice(-1)[0];
    this.dialogData.messageLengthFix(lastMessage)
    oldDialog.lastMessageValue = lastMessage?.content;
    oldDialog.lastMessageTime = lastMessage?.time;
    return oldDialog
  }

  private unsubscribe$ = new Subject<void>();
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

