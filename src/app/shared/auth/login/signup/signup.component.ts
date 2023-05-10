import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  myForm: FormGroup
  showPassword: boolean = false

  signup(){
    if (this.myForm.valid) {
      console.log('✅Form is Valid')
    } else console.log(`⛔Form error: `,this.myForm.controls)
  }

  constructor(
    public router:Router,
  ) {
    this.myForm = new FormGroup({
      "Email": new FormControl("", [
        Validators.required,
        Validators.pattern(/\S+@\S+\.\S+/)
      ]),
      "Phone": new FormControl("+380", [
        Validators.required,
        Validators.pattern(/^\+\d{12}$/)
      ]),
      "Password": new FormControl("", [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(16),
        Validators.pattern(/^(?=.*[a-zA-Z])/)
      ])
    });
  }
}
