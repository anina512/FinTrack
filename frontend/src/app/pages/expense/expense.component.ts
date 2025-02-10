// expense.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
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

  categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'];

  close() {
    this.closeModal.emit();
  }

  saveExpense() {
    if (this.expense.amount && this.expense.category && this.expense.date) {
      const newExpense: Expense = {
        id: uuidv4(),
        amount: parseInt(this.expense.amount),
        category: this.expense.category,
        date: this.expense.date,
        description: this.expense.description,
        createdAt: new Date()
      };
      
      this.expenseSaved.emit(newExpense);
      this.close();
    }
}
}