import { Component, OnInit } from '@angular/core';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: [CommonModule, SideNavComponent, HttpClientModule, FormsModule],
  providers: [AuthService, TransactionsService]
})
export class UserComponent implements OnInit {
  user: any = {};
  loggedInUserId: any = null;
  showSettings = false;
  usernameForm = {
    username: ''
  };
  emailForm = {
    email: ''
  };
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit(): void {
    this.loggedInUserId = this.authService.getUserId();
    if (this.loggedInUserId) {
      this.fetchUserData();
    }
  }

  fetchUserData(): void {
    this.transactionService.getUser(this.loggedInUserId).subscribe({
      next: (data) => {
        this.user = data;
        this.usernameForm.username = data.username;
        this.emailForm.email = data.email;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.errorMessage = 'Failed to load user data';
      }
    });
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForms();
  }

  resetForms(): void {
    this.usernameForm.username = this.user.username;
    this.emailForm.email = this.user.email;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  updateUsername(): void {
    if (!this.usernameForm.username.trim()) {
      this.errorMessage = 'Username cannot be empty';
      return;
    }

    this.transactionService.updateUsername(this.loggedInUserId, this.usernameForm).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.successMessage = response.message;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update username';
        this.successMessage = '';
      }
    });
  }

  updateEmail(): void {
    if (!this.emailForm.email.trim() || !this.emailForm.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.transactionService.updateEmail(this.loggedInUserId, this.emailForm).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.successMessage = response.message;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update email';
        this.successMessage = '';
      }
    });
  }

  updatePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmNewPassword) {
      this.errorMessage = 'New passwords do not match';
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters';
      return;
    }

    this.transactionService.updatePassword(this.loggedInUserId, {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (response: any) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.resetForms();
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to update password';
        this.successMessage = '';
      }
    });
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}