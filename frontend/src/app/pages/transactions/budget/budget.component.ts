import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';
// import { TransactionsService } from '../../../services/transactions.service';
import { TransactionsService } from '../../../services/transactions.service';

import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TransactionsService]
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

  constructor(private transactionsService: TransactionsService) {}

  close() {
    this.closeModal.emit();
  }

  saveBudget() {
    if (this.budget.name && this.budget.monthlyIncome && this.budget.startDate && this.budget.endDate) {
      const newBudget: Budget = {
        user_id: 1,
        budget_name: this.budget.name,
        monthly_income: parseFloat(this.budget.monthlyIncome),
        start_date:  new Date(this.budget.startDate).toISOString().split('T')[0],
        end_date: new Date(this.budget.endDate).toISOString().split('T')[0],
        details:this.budget.details,
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