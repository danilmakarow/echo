import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  myForm: FormGroup
  showPassword: boolean = false

  signup(){
    if (this.myForm.valid) {
      console.log('✅ Form is Valid')
    } else console.log(`⛔ Form error: `,this.myForm.controls)
  }

  constructor(
    public router:Router,
  ) {
    this.myForm = new FormGroup({
      "Email": new FormControl("", [
        Validators.required,
        Validators.pattern(/\S+@\S+\.\S+/)
      ]),
      "Password": new FormControl("", [
        Validators.required
      ])
    });
  }
}
