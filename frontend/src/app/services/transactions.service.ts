import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private baseUrl = 'http://localhost:8080';  

  constructor(private http: HttpClient) {}

  // Method to add income
  addIncome(income: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/incomes`, income);
  }

  // Method to add expense
  addExpense(expense: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses`, expense);
  }

  // Method to add budget
  addBudget(budget: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/budget`, budget);
  }
}
