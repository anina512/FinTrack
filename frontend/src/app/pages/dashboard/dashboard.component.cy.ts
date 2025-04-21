// cypress/component/dashboard.component.cy.ts
import { mount } from 'cypress/angular';
import { DashboardComponent } from 'src/app/pages/dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SideNavComponent } from 'src/app/shared/side-nav/side-nav.component';
import { ExpenseComponent } from 'src/app/pages/transactions/expense/expense.component';
import { IncomeComponent } from 'src/app/pages/transactions/income/income.component';
import { BudgetComponent } from 'src/app/pages/transactions/budget/budget.component';
import { ActivitiesModalComponent } from 'src/app/activities-modal/activities-modal.component';
import { TransactionsService } from 'src/app/services/transactions.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

// swallow any uncaught exceptions (including Chart.js errors)
Cypress.on('uncaught:exception', () => false);

describe('DashboardComponent', () => {
  beforeEach(() => {
    // Stub TransactionsService methods on the prototype
    cy.stub(TransactionsService.prototype, 'getIncomes')
      .returns(of([{ amount: 100, category: 'Salary', date: new Date().toISOString() }]));
    cy.stub(TransactionsService.prototype, 'getExpenses')
      .returns(of([
        { name: 'Rent', amount: 500, description: 'Monthly rent', date: new Date().toISOString(), Paid: false },
        { name: 'Gas',  amount:  50, description: 'Car fuel',    date: new Date().toISOString(), Paid: true  }
      ]));
    cy.stub(TransactionsService.prototype, 'getBudget')
      .returns(of([{ budget_amount: 1000, start_date: '2025-04-01', end_date: '2025-04-30', created_at: '2025-04-01' }]));
    cy.stub(TransactionsService.prototype, 'updateExpense')
      .returns(of({}))
      .as('updateExpenseStub');

    // Stub AuthService.getUserId
    cy.stub(AuthService.prototype, 'getUserId').returns(1);

    // Fake ActivatedRoute (no token in URL)
    const activatedRouteStub = { snapshot: { queryParamMap: { get: (_: string) => null } } };
    // Fake Router
    const routerStub = { navigate: cy.stub() };

    // Mount component, overriding only these providers
    mount(DashboardComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent,
        ExpenseComponent,
        IncomeComponent,
        BudgetComponent,
        ActivitiesModalComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router,          useValue: routerStub       },
        { provide: PLATFORM_ID,     useValue: 'server'         },
      ],
    });
  });

  it('renders the three stats cards', () => {
    cy.get('.income-card h2').should('contain.text', 'Income');
    cy.get('.expenses-card h2').should('contain.text', 'Expenses');
    cy.get('.savings-card h2').should('contain.text', 'Budget');
  });

  it('lists only the unpaid upcoming payments', () => {
    // wait for the subscription + change detection
    cy.get('.upcoming-payments ul li', { timeout: 10000 })
      .should('have.length', 1)
      .and('contain.text', 'Rent');
  });

  it('calls updateExpense when marking a payment paid', () => {
    cy.get('.upcoming-payments ul li', { timeout: 10000 })
      .first()
      .within(() => {
        cy.get('.paid-button').click();
      });
    cy.get('@updateExpenseStub').should('have.been.calledOnce');
  });

  it('opens the expense modal when Add Expense is clicked', () => {
    cy.get('.add-expense').click();
    cy.get('app-expense').should('exist');
  });

  it('opens the income modal when Add Income is clicked', () => {
    cy.get('.add-income').click();
    cy.get('app-income').should('exist');
  });

  it('opens the budget modal when Add Budget is clicked', () => {
    cy.get('.add-budget').click();
    cy.get('app-budget').should('exist');
  });

  it('opens the activities modal when View All Transactions is clicked', () => {
    cy.get('.view-all-activities-btn').click();
    cy.get('app-activities-modal').should('exist');
  });
});
