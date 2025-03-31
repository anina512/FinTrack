import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsService } from '../../services/transactions.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

@Component({
  selector: 'app-objectives',
  templateUrl: './objectives.component.html',
  styleUrls: ['./objectives.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule], // Add FormsModule for form handling
  standalone: true,
  providers: [TransactionsService]
})
export class ObjectivesComponent implements OnInit {
  objectivesList = [
    { name: 'Save $5000', status: 'In Progress' },
    { name: 'Reduce Expenses by 10%', status: 'Completed' },
    { name: 'Invest in Stocks', status: 'Pending' }
  ];

  upcomingPayments: any[] = [];
  newPayment = {
    amount: 0,
    type: 'expense', // Default type
    category: '',
    description: '',
    dueDate: '',
    userId: 1 // Replace with actual user ID (e.g., from AuthService)
  };

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    this.loadUpcomingPayments();
  }

  loadUpcomingPayments(): void {
    const userId = 1; // Replace with actual user ID from AuthService
    this.transactionsService.getUpcomingPayments(userId).subscribe({
      next: (payments) => {
        this.upcomingPayments = payments;
      },
      error: (err) => {
        console.error('Error fetching upcoming payments:', err);
      }
    });
  }

  addPayment(): void {
    this.transactionsService.addUpcomingPayment(this.newPayment).subscribe({
      next: (payment) => {
        this.upcomingPayments.push(payment);
        this.resetNewPayment();
      },
      error: (err) => {
        console.error('Error adding payment:', err);
      }
    });
  }

  deletePayment(id: number): void {
    this.transactionsService.deleteUpcomingPayment(id).subscribe({
      next: () => {
        this.upcomingPayments = this.upcomingPayments.filter(p => p.id !== id);
      },
      error: (err) => {
        console.error('Error deleting payment:', err);
      }
    });
  }

  markAsPaid(id: number): void {
    this.transactionsService.markAsPaid(id).subscribe({
      next: () => {
        const payment = this.upcomingPayments.find(p => p.id === id);
        if (payment) payment.status = 'paid';
      },
      error: (err) => {
        console.error('Error marking payment as paid:', err);
      }
    });
  }

  resetNewPayment(): void {
    this.newPayment = {
      amount: 0,
      type: 'expense',
      category: '',
      description: '',
      dueDate: '',
      userId: 1 // Replace with actual user ID
    };
  }
}