import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import {LoginComponent} from './login/login.component'

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/signup', component: SignupComponent },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, // Default route to login
];
