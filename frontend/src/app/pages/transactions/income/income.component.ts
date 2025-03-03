// income.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Income } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class IncomeComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() incomeSaved = new EventEmitter<any>();

  income = {
    amount: '',
    category: '',
    date: '',
    description: ''
  };

  categories = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities'];

  close() {
    this.closeModal.emit();
  }

  saveIncome() {
    if (this.income.amount && this.income.category && this.income.date) {
      const newIncome: Income = {
        id: uuidv4(),
        amount: parseInt(this.income.amount),
        category: this.income.category,
        date: this.income.date,
        description: this.income.description,
        createdAt: new Date()
      };
      
      this.incomeSaved.emit(newIncome);
      this.close();
    }
}
}