// user.component.ts
import { Component, OnInit } from '@angular/core';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  imports: [CommonModule, SideNavComponent, HttpClientModule],
  providers: [AuthService, TransactionsService]
})
export class UserComponent implements OnInit {
  user: any = {};
  loggedInUserId: any = null;


  constructor(
    private authservice: AuthService,
    private transactionService: TransactionsService,
  ) { }

  ngOnInit(): void {
    // Get user ID from route or local storage
    console.log('hengjsbvjs')
    this.loggedInUserId = this.authservice.getUserId();
    console.log(this.loggedInUserId)
    if (this.loggedInUserId) {
      this.fetchUserData();
    }
  }

  fetchUserData(): void {
    this.transactionService.getUser(this.loggedInUserId).subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
    console.log(this.user)
  }

  editProfile(): void {
    // Redirect to edit profile page or open a modal to edit user details
    console.log('Editing profile...');
  }

  logout(): void {
    // Clear user data and redirect to login
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}