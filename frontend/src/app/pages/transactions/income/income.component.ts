// income.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Income } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsService } from '../../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TransactionsService, AuthService]
})
export class IncomeComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() incomeSaved = new EventEmitter<any>();

   @Input() mode: 'add' | 'view' = 'add'; // Mode to toggle between Add and View
    incomeList: Income[] = []; 

  income = {
    amount: '',
    category: '',
    date: '',
    description: ''
  };

  categories = ['Salary', 'Freelance', 'Business', 'Investments', 'Rent', 'Benefits', 'Gifts', 'Other'];

  loggedInUserId: number | null = null;

  constructor(
    private transactionsService: TransactionsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loggedInUserId = this.authService.getUserId();
    this.loadIncomes();
  }

  close() {
    this.closeModal.emit();
  }

   loadIncomes() {
      this.transactionsService.getIncomes(this.loggedInUserId).subscribe(
        (response: Income[]) => {
          this.incomeList = response; 
        },
        (error) => {
          console.error('Error fetching incomes:', error);
        }
      );
    }

    deleteIncome(incomeId: string) {
      this.transactionsService.deleteIncome(incomeId).subscribe(
        () => {
          this.incomeList = this.incomeList.filter(income => income.id !== incomeId);
  
        },
        (error) => {
          console.error('Error deleting income:', error);
        }
      );
    }

  saveIncome() {
    if (this.income.amount && this.income.category && this.income.date) {
      const newIncome: Income = {
        user_id: this.loggedInUserId,
        amount: parseInt(this.income.amount),
        category: this.income.category,
        date: new Date(this.income.date).toISOString().split('T')[0],
        description: this.income.description,
        created_at: new Date().toISOString()
      };
      this.transactionsService.addIncome(newIncome).subscribe(
        (response: any) => {
          this.incomeSaved.emit(response); 
          this.close();
        },
        (error) => {
          console.error('Error saving income:', error);
        }
      );
    }
}
}