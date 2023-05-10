import { Injectable } from '@angular/core';
import {
  from,
  Observable,
  switchMap,
  map,
  forkJoin,
  BehaviorSubject,
  filter
} from "rxjs";
import {UserDataService, UserDialog} from "../../../user-data.service";
import {DocumentSnapshot} from "@angular/fire/compat/firestore";
import {DocumentReference} from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat';
import {chat, UserDB, message} from "../../../../shared/interfaces/firebase";

@Injectable({
  providedIn: 'root'
})

export class DialogsDataService {
  public dialogs$ = new BehaviorSubject<UserDialog[] | null>(null);

  constructor(private userData: UserDataService) {
    //Sub to current user
    //TODO Could be done better way
    userData.curUserData$
        .pipe(
            filter(user => !!user?.dialogs[0]),
            switchMap(user => {
              const dialogObservables = user?.dialogs.map(this.getDialogAndOtherUser);
              return forkJoin(dialogObservables || []);
            }),
            map(dialogs =>
              this.sortDialogs(dialogs)
            ),
        ).subscribe(
            dialogs => this.dialogs$.next(dialogs)
        );
  }

  // Func to get data about other user from dialog
  public getOtherUserData = (users: DocumentReference<UserDB>[]): Observable<DocumentSnapshot<UserDB>> => {
    const otherUser = this.userData.getOtherUser(users);
    // @ts-ignore
    return from(otherUser.get());
  };

  // Fixes message's length to fit left sidebar
  public messageLengthFix(message: message):message {
    if(message.content.length > 60) message.content = message.content.slice(0, 60) + '...';
    return message;
  }

  // Craft UserDialog object for dialogs component
  private createUserDialog = (dialogData: firebase.firestore.DocumentSnapshot<chat>, otherUserData: DocumentSnapshot<UserDB>): UserDialog => {
      const lastMessage = dialogData.data()?.message.slice(-1)[0] as message;
      if (lastMessage) this.messageLengthFix(lastMessage);
      return {
          ref: dialogData.ref,
          lastMessageValue: lastMessage?.content,
          lastMessageTime: lastMessage?.time,
          otherUserName: otherUserData.data()?.name as string,
          otherUserPhoto: otherUserData.data()?.photo as string
      };
  };

  // Get dialog & users data from DB and pass it on
  private getDialogAndOtherUser = (dialog: DocumentReference<chat>): Observable<UserDialog> => {
    return from(dialog.get()).pipe(
      switchMap((dialogData) => {
          return this.getOtherUserData(dialogData.data()?.users as DocumentReference<UserDB>[]).pipe(
            map(otherUserData => this.createUserDialog(dialogData, otherUserData))
          )
        }
      )
    );
  };

  // Sorting dialog by date
  private sortDialogs(dialogs: UserDialog[]): UserDialog[] {
    return dialogs.sort((a, b) => new Date(b.lastMessageTime as string).getTime() - new Date(a.lastMessageTime as string).getTime());
  }
}
