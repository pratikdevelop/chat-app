import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.maxLength(150)],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.pattern(/^\d{10,15}$/)]], // Optional, 10-15 digits
      bio: ['', Validators.maxLength(160)],
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = new FormData();
      formData.append('first_name', this.signupForm.get('first_name')?.value);
      formData.append('last_name', this.signupForm.get('last_name')?.value || '');
      formData.append('email', this.signupForm.get('email')?.value);
      formData.append('password', this.signupForm.get('password')?.value);
      if (this.signupForm.get('phone')?.value) {
        formData.append('phone', this.signupForm.get('phone')?.value);
      }
      if (this.signupForm.get('bio')?.value) {
        formData.append('bio', this.signupForm.get('bio')?.value);
      }
      if (this.selectedFile) {
        formData.append('profile_image', this.selectedFile, this.selectedFile.name);
      }

      this.userService.signup(formData).subscribe({
        next: (response) => {
          console.log('Signup response:', response);
          if (response.status) {
            localStorage.setItem('access_token', response.tokens.access);
            localStorage.setItem('refresh_token', response.tokens.refresh);
            localStorage.setItem('userId', response.user.id.toString());
            this.router.navigate(['/dashboard']);
            this.showSuccess('Account created successfully!');
          }
        },
        error: (error) => {
          console.error('Signup error:', error);
          const errorMessage = error.error?.email?.[0] || error.error?.error || 'Signup failed. Please try again.';
          this.showError(errorMessage);
        },
      });
    } else {
      this.showError('Please fill in all required fields correctly.');
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}