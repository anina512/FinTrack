import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  //Method to get income
  getIncomes(userID: any): Observable<any> {
    const params = new HttpParams().set('user_id', userID); 
    return this.http.get(`${this.baseUrl}/incomes`, { params });
  }
  //Method to delete income
  deleteIncome(incomeID: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/incomes/${incomeID}`);
  }
  // Method to add expense
  addExpense(expense: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses`, expense);
  }
  //Method to get expenses
  getExpenses(userID: any): Observable<any> {
    const params = new HttpParams().set('user_id', userID); 
    return this.http.get(`${this.baseUrl}/expenses`, { params });
  }
  //Method to delete expenses
  deleteExpense(expenseID: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expenses/${expenseID}`);
  }
  // Method to add budget
  addBudget(budget: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/budget`, budget);
  }
  //Method to get budget
  getBudget(userID: any): Observable<any> {
    const params = new HttpParams().set('user_id', userID); 
    return this.http.get(`${this.baseUrl}/budget`, { params });
  }
  //Method to delete budget
  deleteBudget(budgetId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/budget/${budgetId}`);
  }
  //Method to mark expense as paid
  updateExpense(expense: any) {
    return this.http.put(`${this.baseUrl}/expenses/${expense.id}/paid`, expense);
  }
  getUser(userId: number | null): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}`);
  }
}