// cypress/component/user.component.cy.ts
import { mount } from 'cypress/angular';
import { UserComponent } from 'src/app/pages/user/user.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SideNavComponent } from 'src/app/shared/side-nav/side-nav.component';
import { AuthService } from 'src/app/services/auth.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { of } from 'rxjs';

// ignore uncaught errors (e.g. from SideNav)
Cypress.on('uncaught:exception', () => false);

describe('UserComponent', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com'
  };

  it('shows loader when no userId is returned', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(null);
    cy.stub(TransactionsService.prototype, 'getUser').as('getUserStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    cy.get('.loader').should('be.visible');
    cy.contains('Loading profile...').should('be.visible');
    cy.get('.profile-card').should('not.exist');
    cy.get('@getUserStub').should('not.have.been.called');
  });

  it('fetches and displays user data when userId is present', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);
    cy.stub(TransactionsService.prototype, 'getUser')
      .returns(of(mockUser))
      .as('getUserStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    // confirm the service was called
    cy.get('@getUserStub').should('have.been.calledOnce');

    // loader should NOT be visible once data arrives
    cy.get('.loader').should('not.exist');

    // profile card should appear
    cy.get('.profile-card').should('be.visible');

    // verify displayed user info
    cy.get('.info-item').eq(0).within(() => {
      cy.get('.info-label').should('have.text', 'Username');
      cy.get('.info-value').should('have.text', mockUser.username);
    });
    cy.get('.info-item').eq(1).within(() => {
      cy.get('.info-label').should('have.text', 'Full Name');
      cy.get('.info-value').should('have.text', mockUser.fullName);
    });
    cy.get('.info-item').eq(2).within(() => {
      cy.get('.info-label').should('have.text', 'Email Address');
      cy.get('.info-value').should('have.text', mockUser.email);
    });
  });
});
