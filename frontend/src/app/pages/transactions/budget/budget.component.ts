// budget.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ],
  standalone: true
})
export class BudgetComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() budgetSaved = new EventEmitter<Budget>();

  budget = {
    name: '',
    monthlyIncome: '',
    startDate: '',
    endDate: '',
    details: ''
  };

  close() {
    this.closeModal.emit();
  }

  saveBudget() {
    if (this.budget.name && this.budget.monthlyIncome && this.budget.startDate && this.budget.endDate) {
      const newBudget: Budget = {
        id: uuidv4(),
        name: this.budget.name,
        monthlyIncome: parseFloat(this.budget.monthlyIncome),
        startDate: this.budget.startDate,
        endDate: this.budget.endDate,
        details: this.budget.details,
        createdAt: new Date()
      };
      
      this.budgetSaved.emit(newBudget);
      this.close();
    }
  }
}