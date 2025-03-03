// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../../login.service';
import { provideHttpClient } from '@angular/common/http';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword: Boolean = true;
  errorMessage: string = '';

  // Mock user data
  private mockUsers = [
    { email: 'test@example.com', password: 'password123' },
    { email: 'user@example.com', password: '123456' }
  ];

  constructor(private fb: FormBuilder, private loginService: LoginService,
    private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    // Call the backend API for login
    this.loginService.login(email, password).subscribe({
      next: (response) => {
        // If login is successful, navigate to the dashboard
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          // If login fails, show an error message
          this.errorMessage = 'Invalid email or password';
        }
      },
      error: (err) => {
        // Handle any backend errors
        this.errorMessage = 'An error occurred during login. Please try again.';
        console.error(err);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']); 
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']); 
  }
}
