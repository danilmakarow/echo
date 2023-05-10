import { NgModule } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './login/signin/signin.component';
import { SignupComponent } from './login/signup/signup.component';

import { CommonModule } from '@angular/common';
import {RouterModule, RouterOutlet, Routes} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {AngularFireDatabaseModule} from "@angular/fire/compat/database";

const appRoutes: Routes =[
  { path: 'auth', redirectTo: 'auth/signin', pathMatch:'full'},
  { path: 'auth',
    children:[
      { path: 'signin', component: SigninComponent},
      { path: 'signup', component: SignupComponent},
    ],
    component: LoginComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes),
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    AngularFireDatabaseModule
  ],
  declarations: [
    LoginComponent,
    SigninComponent,
    SignupComponent,
  ],
  exports: [
    LoginComponent,
    SigninComponent,
    SignupComponent
  ],
})
export class AuthModule { }
