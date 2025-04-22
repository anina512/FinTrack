import { mount } from 'cypress/angular';
import { UserComponent } from 'src/app/pages/user/user.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from 'src/app/shared/side-nav/side-nav.component';
import { AuthService } from 'src/app/services/auth.service';
import { TransactionsService } from 'src/app/services/transactions.service';
import { of } from 'rxjs';

// ignore uncaught errors (from SideNav etc)
Cypress.on('uncaught:exception', () => false);

describe('UserComponent', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    fullName: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // stub getUser to always return our mock
    cy.stub(TransactionsService.prototype, 'getUser')
      .returns(of(mockUser))
      .as('getUserStub');
  });

  it('shows loader when no userId is returned', () => {
    // stub getUserId to null for loader state
    cy.stub(AuthService.prototype, 'getUserId').returns(null);

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    // loader visible, profile-card hidden, and getUser never called
    cy.get('.loader').should('be.visible');
    cy.contains('Loading profile...').should('be.visible');
    cy.get('.profile-card').should('not.exist');
    cy.get('@getUserStub').should('not.have.been.called');
  });

  it('fetches and displays user data and welcoming message when userId is present', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    // service called, loader gone, profile visible
    cy.get('@getUserStub').should('have.been.calledOnce');
    cy.get('.loader').should('not.exist');
    cy.get('.profile-card').should('be.visible');

    // welcome message
    cy.get('.welcome-message')
      .should('have.text', `Welcome, ${mockUser.fullName}!`);

    // check each info-item
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
    cy.stub(AuthService.prototype, 'getUserId').returns(1);

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    // settings hidden initially
    cy.get('.settings-section').should('not.exist');

    // open settings
    cy.get('.settings-button').contains('Edit Settings').click();
    cy.get('.settings-section').should('be.visible');

    // verify form headings
    cy.get('.settings-form').eq(0).contains('h3', 'Change Username');
    cy.get('.settings-form').eq(1).contains('h3', 'Change Email');
    cy.get('.settings-form').eq(2).contains('h3', 'Change Password');

    // verify ngModel initial values
    cy.get('#username').should('have.value', mockUser.username);
    cy.get('#email').should('have.value', mockUser.email);
    cy.get('#currentPassword').should('have.value', '');
    cy.get('#newPassword').should('have.value', '');
    cy.get('#confirmNewPassword').should('have.value', '');

    // close settings
    cy.get('.settings-button').contains('Close Settings').click();
    cy.get('.settings-section').should('not.exist');
  });

  it('updates username successfully', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);
    const updatedUser = { ...mockUser, username: 'newuser' };
    cy.stub(TransactionsService.prototype, 'updateUsername')
      .returns(of({ message: 'Username updated successfully', user: updatedUser }))
      .as('updateUsernameStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#username').clear().type('newuser');
    cy.get('.settings-form').eq(0).find('.submit-button').click();

    cy.get('@updateUsernameStub')
      .should('have.been.calledWith', 1, { username: 'newuser' });
    cy.get('.success-message')
      .should('have.text', 'Username updated successfully');
    cy.get('.info-item').eq(0)
      .find('.info-value').should('have.text', 'newuser');
  });

  it('updates email successfully', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);
    const updatedUser = { ...mockUser, email: 'new@example.com' };
    cy.stub(TransactionsService.prototype, 'updateEmail')
      .returns(of({ message: 'Email updated successfully', user: updatedUser }))
      .as('updateEmailStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#email').clear().type('new@example.com');
    cy.get('.settings-form').eq(1).find('.submit-button').click();

    cy.get('@updateEmailStub')
      .should('have.been.calledWith', 1, { email: 'new@example.com' });
    cy.get('.success-message')
      .should('have.text', 'Email updated successfully');
    cy.get('.info-item').eq(2)
      .find('.info-value').should('have.text', 'new@example.com');
  });

  it('updates password successfully', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);
    cy.stub(TransactionsService.prototype, 'updatePassword')
      .returns(of({ message: 'Password updated successfully' }))
      .as('updatePasswordStub');

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#currentPassword').type('oldpass');
    cy.get('#newPassword').type('newpass');
    cy.get('#confirmNewPassword').type('newpass');
    // force-click because it may be off-screen
    cy.get('.settings-form').eq(2)
      .find('.submit-button').click({ force: true });

    cy.get('@updatePasswordStub')
      .should('have.been.calledWith', 1, {
        currentPassword: 'oldpass',
        newPassword: 'newpass'
      });
    cy.get('.success-message')
      .should('have.text', 'Password updated successfully');
  });

  it('shows error when new passwords do not match', () => {
    cy.stub(AuthService.prototype, 'getUserId').returns(1);

    mount(UserComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        HttpClientModule,
        FormsModule,
        SideNavComponent
      ]
    });

    cy.get('.settings-button').click();
    cy.get('#currentPassword').type('oldpass');
    cy.get('#newPassword').type('newpass');
    cy.get('#confirmNewPassword').type('different');
    cy.get('.settings-form').eq(2)
      .find('.submit-button').click({ force: true });

    cy.get('.error-message')
      .should('have.text', 'New passwords do not match');
    cy.get('.success-message').should('not.exist');
  });
});