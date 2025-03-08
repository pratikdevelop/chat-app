import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { User } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  /** 🔹 Sign up a new user (public endpoint) */
  signup(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}signup/`, formData).pipe(
      catchError((error) => {
        return of({
          message: 'Signup unsuccessful',
          open: true,
          variant: 'error',
          error: error.message,
        });
      })
    );
    }

      /** 🔹 Fetch available users */
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}users/`);
  }

  /** 🔹 Log in a user (public endpoint) */
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}signin/`, data).pipe(
      catchError((error) => {
        return of({
          message: 'Login unsuccessful',
          open: true,
          variant: 'error',
          error: error.message,
        });
      })
    );
  }

  /** 🔹 Get user by ID (protected endpoint, handled by interceptor) */
  getUser(userId:any = null): Observable<any> {
    return this.http.get(`${this.apiUrl}user/${userId}/`).pipe(
      catchError((error) => {
        return of({
          message: `User response not fetched, ${error.message}`,
          open: true,
          variant: 'error',
        });
      })
    );
  }

  /** 🔹 Verify OTP for password reset (public endpoint) */
  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}verify-otp/`, { email, otp }).pipe(
      catchError((error) => {
        return of({
          message: 'OTP verification failed',
          open: true,
          variant: 'error',
          error: error.message,
        });
      })
    );
  }

  /** 🔹 Request password reset (send OTP) (public endpoint) */
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}reset-password/`, { email }).pipe(
      catchError((error) => {
        return of({
          message: 'Password reset request failed',
          open: true,
          variant: 'error',
          error: error.message,
        });
      })
    );
  }
  getUserById(id: number) {
    return this.http.get<User>(`http://localhost:8000/api/users/${id}/`);
  }
  
  searchUsers(query: string) {
    return this.http.get<{ users: User[] }>(`http://localhost:8000/api/users/?search=${query}`);
  }
}