/// <reference types="cypress" />

import { DashboardComponent } from './dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExpenseComponent } from '../transactions/expense/expense.component';
import { IncomeComponent } from '../transactions/income/income.component';
import { BudgetComponent } from '../transactions/budget/budget.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { TransactionsService } from '../../services/transactions.service';

describe('DashboardComponent', () => {
  beforeEach(() => {
    cy.mount(DashboardComponent, {
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ExpenseComponent,
        IncomeComponent,
        BudgetComponent,
        SideNavComponent
      ],
      providers: [
        TransactionsService
      ]
    }).as('component');
  });

  it('should display the dashboard', () => {
    cy.get('.dashboard').should('exist');
    cy.get('.income-card').should('exist');
    cy.get('.expenses-card').should('exist');
    cy.get('.savings-card').should('exist');
    cy.get('.weekly-expenses-card').should('exist');
  });

  it('should display correct financial data', () => {
    cy.get('.income-card .card-footer p').should('contain', '27,632');
    cy.get('.expenses-card .card-footer p').should('contain', '27,632');
    cy.get('.savings-card .card-footer p').should('contain', '89,236');
  });

  it('should open expense modal when "Add Expense" button is clicked', () => {
    cy.get('.add-expense').click();
    cy.get('app-expense').should('be.visible');
  });

  it('should open income modal when "Add Income" button is clicked', () => {
    cy.get('.add-income').click();
    cy.get('app-income').should('be.visible');
  });

  it('should open budget modal when "Add Budget" button is clicked', () => {
    cy.get('.add-budget').click();
    cy.get('app-budget').should('be.visible');
  });

  it('should display upcoming payments', () => {
    cy.get('.upcoming-payments ul li').should('have.length', 3);
    cy.get('.upcoming-payments ul li').first().should('contain', 'Home Rental - February 15, 2025');
  });

  it('should display recent activities', () => {
    cy.get('.recent-activities ul li').should('have.length', 5);
    cy.get('.recent-activities ul li').first().should('contain', 'Electric Bill - Success');
  });

  it('should render charts', () => {
    cy.get('#incomeChart').should('exist');
    cy.get('#expensesChart').should('exist');
    cy.get('#savingsChart').should('exist');
    cy.get('#weeklyExpensesChart').should('exist');
  });
});
