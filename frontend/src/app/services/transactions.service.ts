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
  //Method to get income
  getIncomes(userID: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/incomes`, userID);
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
    return this.http.get(`${this.baseUrl}/expenses`, userID);
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
    return this.http.get(`${this.baseUrl}/budget`, userID);
  }
  //Method to delete budget
  deleteBudget(budgetId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/budget/${budgetId}`);
  }
}