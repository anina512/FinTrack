import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';
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

  budget = {
    name: '',
    monthlyIncome: '',
    startDate: '',
    endDate: '',
    details: ''
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

    deleteExpense(budgetId: string) {
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
    if (this.budget.name && this.budget.monthlyIncome && this.budget.startDate && this.budget.endDate) {
      const newBudget: Budget = {
        user_id: this.loggedInUserId,
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