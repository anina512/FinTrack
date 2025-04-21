// cypress/component/activities-modal.component.cy.ts
import { mount } from 'cypress/angular';
import { ActivitiesModalComponent } from 'src/app/shared/activities-modal/activities-modal.component';
import { CommonModule } from '@angular/common';

// swallow any unexpected errors
Cypress.on('uncaught:exception', () => false);

describe('ActivitiesModalComponent', () => {
  it('displays "No activities found" when there are no activities', () => {
    mount(ActivitiesModalComponent, {
      imports: [CommonModule],
      componentProperties: {
        combinedActivities: []
      }
    });

    cy.get('.no-transactions')
      .should('be.visible')
      .and('contain.text', 'No activities found');

    cy.get('.activities-table').should('not.exist');
  });

  it('renders a row for each activity with correct content and styling', () => {
    const activities = [
      { date: '2025-04-20', type: 'income', category: 'Salary', amount: 100 },
      { date: '2025-04-19', type: 'expense', category: 'Food', amount: 50 },
      {
        date: '2025-04-01',
        type: 'budget',
        start_date: '2025-04-01',
        end_date: '2025-04-30',
        budget_amount: 500
      }
    ];

    mount(ActivitiesModalComponent, {
      imports: [CommonModule],
      componentProperties: {
        combinedActivities: activities
      }
    }).then(({ component }) => {
      // spy on the closeModal emitter
      cy.spy(component.closeModal, 'emit').as('closeSpy');
    });

    // Table should exist and have three rows
    cy.get('.activities-table').should('exist');
    cy.get('.activities-table tbody tr').should('have.length', 3);

    // Row 0: Income
    cy.get('.activities-table tbody tr').eq(0).within(() => {
      cy.get('.date').should('contain.text', '4/20/25');
      cy.get('.type')
        .should('contain.text', 'INCOME')
        .and('have.css', 'color', 'rgb(46, 204, 113)');
      cy.get('.details').should('contain.text', 'Salary');
      cy.get('.amount').should('contain.text', '+$100.00');
      cy.root().should('have.css', 'border-left', '4px solid rgb(46, 204, 113)');
    });

    // Row 1: Expense
    cy.get('.activities-table tbody tr').eq(1).within(() => {
      cy.get('.date').should('contain.text', '4/19/25');
      cy.get('.type')
        .should('contain.text', 'EXPENSE')
        .and('have.css', 'color', 'rgb(231, 76, 60)');
      cy.get('.details').should('contain.text', 'Food');
      cy.get('.amount').should('contain.text', '-$50.00');
      cy.root().should('have.css', 'border-left', '4px solid rgb(231, 76, 60)');
    });

    // Row 2: Budget
    cy.get('.activities-table tbody tr').eq(2).within(() => {
      cy.get('.date').should('contain.text', '4/1/25');
      cy.get('.type')
        .should('contain.text', 'BUDGET')
        .and('have.css', 'color', 'rgb(52, 152, 219)');
      cy.get('.details').should('contain.text', '4/1/25 - 4/30/25');
      cy.get('.amount').should('contain.text', '$500.00');
      cy.root().should('have.css', 'border-left', '4px solid rgb(52, 152, 219)');
    });
  });

  it('emits closeModal when close buttons are clicked', () => {
    mount(ActivitiesModalComponent, {
      imports: [CommonModule],
      componentProperties: {
        combinedActivities: []
      }
    }).then(({ component }) => {
      cy.spy(component.closeModal, 'emit').as('closeSpy');
    });

    // top-right "×" button
    cy.get('.close-btn').click();
    cy.get('@closeSpy').should('have.been.calledOnce');

    // footer "Close" button
    cy.get('.btn-close').click();
    cy.get('@closeSpy').should('have.been.calledTwice');
  });
});