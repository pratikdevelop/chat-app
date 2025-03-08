import { Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component'; // New component for profile
import { AuthGuard } from './auth.guard'; // Guard for authenticated routes

export const routes: Routes = [
  // Public Routes (Authentication)
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Default to login under /auth
    ],
  },

  // Protected Routes (Require Authentication)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // Protect dashboard with auth guard
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard], // Protect profile page
  },

  // Default and Wildcard Routes
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, // Default route to login
  { path: '**', redirectTo: 'auth/login' }, // Wildcard route for 404-like behavior
];