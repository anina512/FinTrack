// income.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Income } from '../../../models/transactions.model';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsService } from '../../../services/transactions.service';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TransactionsService]
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

  constructor(private transactionsService: TransactionsService) {}

  close() {
    this.closeModal.emit();
  }

  saveIncome() {
    if (this.income.amount && this.income.category && this.income.date) {
      const newIncome: Income = {
        user_id: 1,
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