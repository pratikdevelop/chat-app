import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('access_token');
    if (token) {
      return true; // User is authenticated
    } else {
      router.navigate(['/auth/login']); // Redirect to login if not authenticated
      return false;
    }
};



// src/app/guards/auth.guard.ts