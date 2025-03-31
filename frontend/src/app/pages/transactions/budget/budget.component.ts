import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget } from '../../../models/transactions.model';
import { TransactionsService } from '../../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TransactionsService, AuthService]
})
export class BudgetComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() budgetSaved = new EventEmitter<Budget>();

  @Input() mode: 'add' | 'view' = 'add'; // Mode to toggle between Add and View
  budgetList: Budget[] = [];

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  budget = {
    name: '',
    budgetAmount: '',
    month: new Date().getMonth() + 1, // Default to current month
    year: new Date().getFullYear(),  // Default to current year
    notes: '',
    startDate: '',
    endDate: ''
  };

  loggedInUserId: number | null = null;

  constructor(private transactionsService: TransactionsService, private authService: AuthService) {}

  ngOnInit() {
    this.loggedInUserId = this.authService.getUserId();
    this.loadBudget();
  }

  loadBudget() {
    this.transactionsService.getBudget(this.loggedInUserId).subscribe(
      (response: Budget[]) => {
        this.budgetList = response;
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
  }

  // Calculate start and end dates based on the selected month and year
  calculateDates() {
    const { month, year } = this.budget;

    // Get the first day of the selected month and year
    const startDate = new Date(year, month - 1, 1); // Months are 0-indexed
    this.budget.startDate = startDate.toISOString().split('T')[0]; // format: YYYY-MM-DD

    // Get the last day of the selected month and year
    const endDate = new Date(year, month, 0); // 0th day of next month gives the last day of the current month
    this.budget.endDate = endDate.toISOString().split('T')[0]; // format: YYYY-MM-DD
  }

  deleteBudget(budgetId: string) {
    this.transactionsService.deleteBudget(budgetId).subscribe(
      () => {
        this.budgetList = this.budgetList.filter(budget => budget.id !== budgetId);
      },
      (error) => {
        console.error('Error deleting expense:', error);
      }
    );
  }

  close() {
    this.closeModal.emit();
  }

  saveBudget() {
    if (this.budget.name && this.budget.budgetAmount && this.budget.month && this.budget.year) {
      // Calculate the start and end dates based on month and year before saving
      this.calculateDates();

      const newBudget: Budget = {
        user_id: this.loggedInUserId,
        budget_name: this.budget.name,
        budget_amount: parseFloat(this.budget.budgetAmount), 
        start_date: this.budget.startDate,
        end_date: this.budget.endDate,
        notes: this.budget.notes, 
        created_at: new Date().toISOString()
      };

      this.transactionsService.addBudget(newBudget).subscribe(
        (response: any) => {
          this.budgetSaved.emit(response);
          this.close();
        },
        (error) => {
          console.error('Error saving budget:', error);
        }
      );
    }
  }
}
