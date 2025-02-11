import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, CommonModule, MatFormField, MatCardModule, ReactiveFormsModule]
})
export class RegisterComponent {
  hidePassword = true; // For password field visibility toggle
  hideConfirmPassword = true; // For confirm password field visibility toggle

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword; // Toggles password visibility
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword; // Toggles confirm password visibility
  }
  
  registerForm: FormGroup;
  errorMessage: string = '';  

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.maxLength(10)] ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null
      : { mismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill out all fields correctly.';
      return;
    }

    const { fullName, username, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

     const newUser: User = {
            id: uuidv4(),
            fullName: fullName,
            username: username,
            email: email,
            password: password,
            date: Date.now().toString()
          };
          
      console.log("CREATED NEW USER: \n" + JSON.stringify(newUser))

    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }
  goToLogin() {
    this.router.navigate(['/login']); 
  }
}
