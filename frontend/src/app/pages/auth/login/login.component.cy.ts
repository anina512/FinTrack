// cypress/component/login.component.cy.ts
import { mount } from 'cypress/angular';
import { LoginComponent } from 'src/app/pages/auth/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

// swallow Angular animation & routing errors
Cypress.on('uncaught:exception', () => false);

describe('LoginComponent', () => {
  let routerStub: { navigate: Cypress.AgentStub };

  beforeEach(() => {
    // 1) Stub AuthService.login at the prototype level and alias it
    cy.stub(AuthService.prototype, 'login').as('loginStub');

    // 2) Fake Router
    routerStub = { navigate: cy.stub() };

    // 3) Mount component, override only Router
    mount(LoginComponent, {
      imports: [
        NoopAnimationsModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: Router, useValue: routerStub },
      ],
    }).then(({ component }) => {
      // 4) Stub loginWithGoogle so it never actually navigates
      cy.stub(component, 'loginWithGoogle').as('loginWithGoogleStub');
    });
  });

  it('should render the form controls and buttons', () => {
    cy.get('.title').should('have.text', 'Welcome Back');
    cy.get('input[formcontrolname="email"]').should('exist');
    cy.get('input[formcontrolname="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
    cy.get('.google-icon-btn').should('exist');
    cy.get('.register-link').should('exist');
  });

  it('should show form‑level error when submitted empty', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('.error', 'Please enter a valid email and password.').should('be.visible');
  });

  it('should show field errors when touched and invalid', () => {
    cy.get('input[formcontrolname="email"]').type('not-an-email').blur();
    cy.contains('.error', 'Invalid email.').should('be.visible');
    cy.get('input[formcontrolname="password"]').type('123').blur();
    cy.contains('.error', 'Invalid password.').should('be.visible');
  });

  it('should call AuthService.login and navigate on success', () => {
    // arrange: make the stub return a successful Observable
    cy.get('@loginStub').then((stub: any) => {
      stub.returns(of({ token: 'abc' }));
    });

    // act
    cy.get('input[formcontrolname="email"]').type('user@example.com');
    cy.get('input[formcontrolname="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // assert stub call
    cy.get('@loginStub').should('have.been.calledWith', 'user@example.com', 'password123');
    // assert navigation
    cy.then(() => {
      expect(routerStub.navigate).to.have.been.calledWith(['/dashboard']);
    });
  });

  it('should display server error message on login failure', () => {
    // arrange: make the stub throw an error
    cy.get('@loginStub').then((stub: any) => {
      stub.returns(throwError({ error: { error: 'Invalid credentials.' } }));
    });

    // act
    cy.get('input[formcontrolname="email"]').type('user@example.com');
    cy.get('input[formcontrolname="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // assert error message
    cy.contains('.error', 'Invalid credentials.').should('be.visible');
  });

  it('should toggle password visibility when icon clicked', () => {
    cy.get('input[formcontrolname="password"]').should('have.attr', 'type', 'password');
    cy.get('mat-icon').eq(1).click({ force: true });
    cy.get('input[formcontrolname="password"]').should('have.attr', 'type', 'text');
  });

  it('should call loginWithGoogle on Google button click', () => {
    cy.get('.google-icon-btn').click({ force: true });
    cy.get('@loginWithGoogleStub').should('have.been.calledOnce');
  });

  it('should navigate to register page when register link clicked', () => {
    cy.get('.register-link').click({ force: true });
    cy.then(() => {
      expect(routerStub.navigate).to.have.been.calledWith(['/register']);
    });
  });
});
