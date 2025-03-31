// expense.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Expense } from '../../../models/transactions.model';
import { TransactionsService } from '../../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TransactionsService, AuthService]
})
export class ExpenseComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() expenseSaved = new EventEmitter<any>();

  @Input() mode: 'add' | 'view' = 'add'; // Mode to toggle between Add and View
  expensesList: Expense[] = []; 

  expense = {
    amount: '',
    category: '',
    date: '',
    description: ''
  };

  categories = [
    'Housing',       
    'Utilities',      
    'Food',
    'Transportation',
    'Healthcare',
    'Insurance',
    'Bills',         
    'Education',
    'Entertainment',
    'Fitness',
    'Personal Care',
    'Miscellaneous'   
  ];
  
  loggedInUserId: number | null = 1;

  constructor(
    private transactionsService: TransactionsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loggedInUserId = this.authService.getUserId();
    this.loadExpenses();
  }

  close() {
    this.closeModal.emit();
  }

  loadExpenses() {
    this.transactionsService.getExpenses(this.loggedInUserId).subscribe(
      (response: Expense[]) => {
        this.expensesList = response; 
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
  }

  saveExpense() {
    if (this.expense.amount && this.expense.category && this.expense.date) {
      const newExpense: Expense = {
        user_id: this.loggedInUserId,
        amount: parseInt(this.expense.amount),
        category: this.expense.category,
        date: new Date(this.expense.date).toISOString().split('T')[0],
        description: this.expense.description,
        created_at: new Date().toISOString()
      };
      
      this.transactionsService.addExpense(newExpense).subscribe(
        (response: any) => {
          this.expenseSaved.emit(response); 
          this.close();
        },
        (error) => {
          console.error('Error saving expense:', error);
        }
      );
    }
  }

  deleteExpense(expenseId: string) {
    this.transactionsService.deleteExpense(expenseId).subscribe(
      () => {
        this.expensesList = this.expensesList.filter(expense => expense.id !== expenseId);

      },
      (error) => {
        console.error('Error deleting expense:', error);
      }
    );
  }
}
