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
    ReactiveFormsModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  // Mock user data
  private mockUsers = [
    { email: 'test@example.com', password: 'password123' },
    { email: 'user@example.com', password: '123456' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    const { email, password } = this.loginForm.value;

    // Check if user exists in mock data or local storage
    const userExists = this.mockUsers.find(user => user.email === email && user.password === password) ||
                       JSON.parse(localStorage.getItem('registeredUsers') || '[]')
                        .find((user: any) => user.email === email && user.password === password);

    if (userExists) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }

  goToRegister() {
    this.router.navigate(['/register']); // Navigate to the register page
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']); // Navigate to the register page
  }
}
