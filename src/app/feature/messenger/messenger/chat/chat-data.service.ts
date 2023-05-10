import { Injectable } from '@angular/core';
import {DialogTransferService} from "../../../dialog-transfer.service";
import {BehaviorSubject, filter, from, map, Observable, switchMap, tap} from "rxjs";
import {UserDialog, UserDataService} from "../../../user-data.service";
import {Action, AngularFirestore, DocumentReference, DocumentSnapshot} from "@angular/fire/compat/firestore";
import {arrayUnion, updateDoc} from "@angular/fire/firestore";
import {chat, message, UserDB} from "../../../../shared/interfaces/firebase";

export interface ChatData {
  name: string,
  photo: string,
  ref: DocumentReference<chat>
}

export interface messageDB {
  content: string,
  senderId: DocumentReference,
  time: string
}

export interface chatData {
  currentChat: DocumentReference<chat>,
  senderId: DocumentReference<UserDB>,
  messages: string[]
}

@Injectable({
  providedIn: 'root'
})

export class ChatDataService {
  public chatData$ = new BehaviorSubject<ChatData | null>(null);
  public messagesData$ = new BehaviorSubject<message[] | null>(null);

  constructor(
      private userData: UserDataService,
      private dialogTrans: DialogTransferService,
      private store: AngularFirestore,
  ) {
    //Subscription to changes in opened Dialog
    dialogTrans.dialog$.pipe(
        filter(Boolean),
        switchMap((dialog: UserDialog) => this.getMessagesData(dialog)),

        filter(data => (data.payload.data()?.message.length as number) > (this.messagesData$.getValue()?.length as number)),
        filter(dialog => dialog.type === 'modified'),

        tap(data => (data.payload.id === 'test-chat')? this.onTestChat(data) : null),
        map(data => data.payload.data()?.message),
    ).subscribe(messages =>
        this.messagesData$.next(messages as message[])
    )
  }

  public onSendMessage(messageEl: HTMLTextAreaElement): void {
    const message = messageEl.value.trim();
    if (!message) return;

    messageEl.value = '';
    this.messageHeightCalc(messageEl);

    this.sendMessageToDB(
      this.chatData$.getValue()?.ref as DocumentReference<chat>,
      this.createMessageForDB(message)
    )
  }

  public messageHeightCalc(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // Resetting height
    textarea.style.height = textarea.scrollHeight - 22 + 'px'; // Setting new height based on content height
  }

  private createMessageForDB(message: string, user: DocumentReference = this.userData.curUserDoc?.ref): messageDB {
    return {
      content: message,
      senderId: user,
      time: new Date().toISOString()
    }
  }

  private getMessagesData(dialog: UserDialog): Observable<Action<DocumentSnapshot<chat>>> {
    from(dialog.ref.get()).subscribe(chat =>
      this.setNewUserAndMessages(dialog.otherUserName, dialog.otherUserPhoto, dialog.ref, chat.data()?.message as message[])
    )
    return this.store.doc<chat>(`chats/${dialog.ref.id}`).snapshotChanges()
  }

  private setNewUserAndMessages(name: string, photo: string, ref: DocumentReference<chat>, messages: message[]): void {
    this.chatData$.next({name, photo, ref})
    this.messagesData$.next(messages)
  }

  private randomBoolean(): boolean {
    return Math.random() < 0.4;
  }

  private getTestMessageData(): chatData {
    const currentChat = this.chatData$.getValue()?.ref as DocumentReference<chat>;
    const senderId = this.store.doc<UserDB>(`users/H89Non7WmWztp02NPxMO`).ref;
    const messages = [
      'Hello👋! This message was sent automatically for you to see the application in action.',
      "It is sends with a 40% probability. You're lucky if you see it. Have a nice day🎉"
    ];
    return {
      currentChat,
      senderId,
      messages
    }
  }

   private onTestChat(test: Action<DocumentSnapshot<chat>>): void{
    const random = this.randomBoolean()
    if(test.payload.data()?.message.slice(-1)[0].senderId.id === 'test--main' && random) {
      const {currentChat, senderId, messages } = this.getTestMessageData();
      //Sending Test Messages
      setTimeout(() =>
        this.sendMessageToDB(currentChat, this.createMessageForDB(messages[0], senderId))
      ,500);
       setTimeout(() =>
        this.sendMessageToDB(currentChat, this.createMessageForDB(messages[1], senderId))
      ,800);
    }
  }

  private sendMessageToDB(chat: DocumentReference<chat>, message: messageDB): void {
    updateDoc(
      chat,
      {message: arrayUnion(message)}
    )
  }
}
