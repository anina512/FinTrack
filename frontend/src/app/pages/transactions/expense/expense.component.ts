// expense.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Expense } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsService } from '../../../services/transactions.service';

import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TransactionsService]
})
export class ExpenseComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() expenseSaved = new EventEmitter<any>();

  expense = {
    amount: '',
    category: '',
    date: '',
    description: ''
  };

  categories = ['bills', 'education', 'food', 'trip', 'transportation', 'gym', 'others'];

  constructor(private transactionsService: TransactionsService) {}

  close() {
    this.closeModal.emit();
  }

  saveExpense() {
    if (this.expense.amount && this.expense.category && this.expense.date) {
      const newExpense: Expense = {
        user_id: 1,
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
}