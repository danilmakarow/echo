import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {Router} from "@angular/router";
import {BehaviorSubject, filter, tap} from 'rxjs';
import {ChatDataService} from "./chat-data.service";
import {DocumentReference} from "@angular/fire/compat/firestore";
import {message} from "../../../../shared/interfaces/firebase";

export interface User {
  name: string,
  photo: string,
  dialogs?: DocumentReference<message>[]
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('message', {static: false}) private messageInput!: ElementRef;

  @HostListener('document:keydown.escape', ['$event'])
  private handleEscapeKey(event: KeyboardEvent): void {
    this.router.navigateByUrl('') //Close component on Escape
  };

  @HostListener('document:keydown.enter', ['$event'])
  private handleEnterKey(event: KeyboardEvent): void {
    this.chatData.onSendMessage(this.messageInput.nativeElement)//Send message on Enter
  }

  public user$ = new BehaviorSubject<User>({
    name: 'Loading',
    photo: ''
  });
  public messages$ = new BehaviorSubject<message[]>([]);

  constructor(
      private router: Router,
      public chatData: ChatDataService
  ) {}

  ngOnInit() {
    //Subscriptions on changes in messages and dialogs
    this.chatData.chatData$.pipe(
      filter(Boolean),
      tap(messages => this.user$.next(messages))
    ).subscribe();

    this.chatData.messagesData$.pipe(
      filter(Boolean),
      tap(messages => this.messages$.next(messages))
    ).subscribe();
  }

  ngAfterViewChecked() {
    this.messageInput.nativeElement.focus();
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey)
      event.preventDefault();
  }
}
