/// <reference types="cypress" />
import { DashboardComponent } from './dashboard.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExpenseComponent } from '../transactions/expense/expense.component';
import { IncomeComponent } from '../transactions/income/income.component';
import { BudgetComponent } from '../transactions/budget/budget.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { TransactionsService } from '../../services/transactions.service';

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Canvas is already in use')) {
    return false; // Prevent Chart.js errors from failing tests
  }
});

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
      providers: [TransactionsService]
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

  it('should open expense modal and display expense form when "Add Expense" button is clicked', () => {
    cy.get('.add-expense').click();
    cy.wait(500);
    
    cy.get('app-expense').should('exist').and('be.visible');
    cy.get('app-expense .modal-header h2').should('contain', 'Add New Expense');
    
    cy.get('app-expense input[name="amount"]').should('exist');
    cy.get('app-expense select[name="category"]').should('exist');
    cy.get('app-expense input[name="date"]').should('exist');
    cy.get('app-expense textarea[name="description"]').should('exist');

    cy.get('app-expense button.cancel').should('exist').and('contain', 'Cancel');
    cy.get('app-expense button.save').should('exist').and('contain', 'Save Expense');

    cy.get('app-expense select[name="category"]').should('exist');
    cy.wait(500);
    cy.get('app-expense select[name="category"] option').should('have.length', 8);

    cy.get('app-expense select[name="category"]').select('food');
    cy.get('app-expense select[name="category"]').should('have.value', 'food');
  });

  it('should open income modal and display income form when "Add Income" button is clicked', () => {
    cy.get('.add-income').click();
    cy.wait(500);

    cy.get('app-income').should('exist').and('be.visible');
    cy.get('app-income .modal-header h2').should('contain', 'Add New Income');

    cy.get('app-income input[name="amount"]').should('exist');
    cy.get('app-income select[name="category"]').should('exist');
    cy.get('app-income input[name="date"]').should('exist');
    cy.get('app-income textarea[name="description"]').should('exist');

    cy.get('app-income button.cancel').should('exist').and('contain', 'Cancel');
    cy.get('app-income button.save').should('exist').and('contain', 'Save Income');

    cy.get('app-income select[name="category"]').should('exist');
    cy.wait(500);
    cy.get('app-income select[name="category"] option').should('have.length', 6);

    cy.get('app-income select[name="category"]').select('Food');
    cy.get('app-income select[name="category"]').should('have.value', 'Food');
  });

  it('should open budget modal and display budget form when "Add Budget" button is clicked', () => {
    cy.get('.add-budget').click();
    cy.wait(500);

    cy.get('app-budget').should('exist').and('be.visible');
    cy.get('app-budget .modal-header h2').should('contain', 'Add New Budget');

    // Wait for mode to be 'add' before checking the form elements
    cy.get('app-budget .budget-form').should('be.visible');
    
    cy.get('app-budget input[name="name"]').should('exist');
    cy.get('app-budget input[name="monthlyIncome"]').should('exist');
    cy.get('app-budget input[name="startDate"]').should('exist');
    cy.get('app-budget input[name="endDate"]').should('exist');
    cy.get('app-budget textarea[name="details"]').should('exist');

    cy.get('app-budget button.cancel').should('exist').and('contain', 'Cancel');
    cy.get('app-budget button.save').should('exist').and('contain', 'Save Budget');
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
