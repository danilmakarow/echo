import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import {UserDialog} from "../../../../user-data.service";
import firebase from "firebase/compat";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DialogComponent implements AfterViewChecked{
  @Input() public dialogs$ = new BehaviorSubject<UserDialog[] | null>(null);
  @Output() selectedDialog = new EventEmitter<UserDialog>();

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.selected?.classList.remove('selected');
    this.selected = null;
  };

  selected: HTMLElement | null = null;

  //TODO Refactor this to identify opened dialog by its ID, not element
  public onclick(doc: UserDialog, element: any): void{
    if (this.selected) this.selected.classList.remove('selected');
    element.classList.add('selected');
    this.selected = element;
    this.selectedDialog.emit(doc)
  }

  ngAfterViewChecked() {
    if(this.selected && !this.selected.classList.contains('selected')) this.selected.classList.add('selected')
  }
}
