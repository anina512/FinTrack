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

  beforeEach(() => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);
    cy.stub(TransactionsService.prototype, 'getUser')
      .returns(of(mockUser))
      .as('getUserStub');
  });

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

  it('fetches and displays user data and welcoming message when userId is present', () => {
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

    // verify welcoming message
    cy.get('.welcome-message').should('have.text', `Welcome, ${mockUser.fullName}!`);

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

  it('toggles settings section and displays forms', () => {
    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    // settings section should be hidden initially
    cy.get('.settings-section').should('not.exist');

    // click to open settings
    cy.get('.settings-button').contains('Edit Settings').click();
    cy.get('.settings-section').should('be.visible');

    // verify form headers
    cy.get('.settings-form').eq(0).contains('h3', 'Change Username');
    cy.get('.settings-form').eq(1).contains('h3', 'Change Email');
    cy.get('.settings-form').eq(2).contains('h3', 'Change Password');

    // verify input fields
    cy.get('#username').should('have.value', mockUser.username);
    cy.get('#email').should('have.value', mockUser.email);
    cy.get('#currentPassword').should('have.value', '');
    cy.get('#newPassword').should('have.value', '');
    cy.get('#confirmNewPassword').should('have.value', '');

    // click to close settings
    cy.get('.settings-button').contains('Close Settings').click();
    cy.get('.settings-section').should('not.exist');
  });

  it('updates username successfully', () => {
    const updatedUser = { ...mockUser, username: 'newuser' };
    cy.stub(TransactionsService.prototype, 'updateUsername')
      .returns(of({ message: 'Username updated successfully', user: updatedUser }))
      .as('updateUsernameStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#username').clear().type('newuser');
    cy.get('.settings-form').eq(0).find('.submit-button').click();

    cy.get('@updateUsernameStub').should('have.been.calledWith', 1, { username: 'newuser' });
    cy.get('.success-message').should('have.text', 'Username updated successfully');
    cy.get('.info-item').eq(0).find('.info-value').should('have.text', 'newuser');
  });

  it('updates email successfully', () => {
    const updatedUser = { ...mockUser, email: 'newemail@example.com' };
    cy.stub(TransactionsService.prototype, 'updateEmail')
      .returns(of({ message: 'Email updated successfully', user: updatedUser }))
      .as('updateEmailStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#email').clear().type('newemail@example.com');
    cy.get('.settings-form').eq(1).find('.submit-button').click();

    cy.get('@updateEmailStub').should('have.been.calledWith', 1, { email: 'newemail@example.com' });
    cy.get('.success-message').should('have.text', 'Email updated successfully');
    cy.get('.info-item').eq(2).find('.info-value').should('have.text', 'newemail@example.com');
  });

  it('updates password successfully', () => {
    cy.stub(TransactionsService.prototype, 'updatePassword')
      .returns(of({ message: 'Password updated successfully' }))
      .as('updatePasswordStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#currentPassword').type('oldpassword');
    cy.get('#newPassword').type('newpassword');
    cy.get('#confirmNewPassword').type('newpassword');
    cy.get('.settings-form').eq(2).find('.submit-button').click();

    cy.get('@updatePasswordStub').should('have.been.calledWith', 1, {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword'
    });
    cy.get('.success-message').should('have.text', 'Password updated successfully');
  });

  it('shows error when passwords do not match', () => {
    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#currentPassword').type('oldpassword');
    cy.get('#newPassword').type('newpassword');
    cy.get('#confirmNewPassword').type('differentpassword');
    cy.get('.settings-form').eq(2).find('.submit-button').click();

    cy.get('.error-message').should('have.text', 'New passwords do not match');
    cy.get('.success-message').should('not.exist');
  });
});