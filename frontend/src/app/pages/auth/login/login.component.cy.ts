/// <reference types="cypress" />

import { LoginComponent } from './login.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// Mock components for routing
@Component({template: ''})
class MockDashboardComponent {}

@Component({template: ''})
class MockRegisterComponent {}

describe('LoginComponent', () => {
  let router: Router;

  beforeEach(() => {
    cy.mount(LoginComponent, {
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: MockDashboardComponent },
          { path: 'register', component: MockRegisterComponent }
        ]),
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        BrowserAnimationsModule
      ]
    }).as('component');

    cy.get('@component').then((wrapper) => {
      const component = wrapper.component as LoginComponent;
      router = component['router']; // Access the router from the component instance
      cy.stub(router, 'navigate').as('routerSpy');
    });
  });

  it('should display the login form', () => {
    cy.get('mat-card-title').should('contain', 'Welcome Back');
    cy.get('mat-card-subtitle').should('contain', 'Login to your account');
    cy.get('input[formControlName="email"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });

  it('should show error messages for invalid inputs', () => {
    cy.get('input[formControlName="email"]').type('invalidemail');
    cy.get('input[formControlName="password"]').type('short');
    cy.get('button[type="submit"]').click();
    cy.get('.error').should('contain', 'Invalid email.');
    cy.get('.error').should('contain', 'Invalid password.');
  });

  it('should navigate to dashboard on successful login', () => {
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('@routerSpy').should('have.been.calledWith', ['/dashboard']);
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[formControlName="email"]').type('wrong@example.com');
    cy.get('input[formControlName="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('.error').should('contain', 'Invalid email or password');
  });

  it('should navigate to register page when clicking register link', () => {
    cy.get('.register-link').click();

    cy.get('@routerSpy').should('have.been.calledWith', ['/register']);
  });
});
