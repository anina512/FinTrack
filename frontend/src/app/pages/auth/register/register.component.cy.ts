/// <reference types="cypress" />

import { RegisterComponent } from './register.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../../services/auth.service';

describe('RegisterComponent', () => {
  beforeEach(() => {
    cy.mount(RegisterComponent, {
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: {} as any },
          { path: 'dashboard', component: {} as any }
        ]),
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [AuthService]
    }).as('component');
  });

  it('should display the register form', () => {
    cy.get('mat-card-title').should('contain', 'Create Your Account');
    cy.get('mat-card-subtitle').should('contain', 'Join us today!');
    cy.get('input[formControlName="fullName"]').should('exist');
    cy.get('input[formControlName="username"]').should('exist');
    cy.get('input[formControlName="email"]').should('exist');
    cy.get('input[formControlName="password"]').should('exist');
    cy.get('input[formControlName="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Register');
  });

  it('should show error messages for invalid inputs', () => {
    cy.get('input[formControlName="fullName"]').type('a').clear();
    cy.get('input[formControlName="username"]').type('toolongusername');
    cy.get('input[formControlName="email"]').type('invalidemail');
    cy.get('input[formControlName="password"]').type('short');
    cy.get('input[formControlName="confirmPassword"]').type('different');
    cy.get('button[type="submit"]').click();

    cy.get('.error').should('contain', 'Name is required');
    cy.get('.error').should('contain', 'Invalid username');
    cy.get('.error').should('contain', 'Invalid email');
    cy.get('.error').should('contain', 'Password must be at least 6 characters');
    cy.get('.error').should('contain', 'Please fill out all fields correctly');
  });

  it('should navigate to login page when clicking login link', () => {
    cy.get('@component').then((wrapper: any) => {
      const component = wrapper.component as RegisterComponent;
      cy.spy(component['router'], 'navigate').as('routerSpy');
    });
    cy.get('.login-link').click();
    cy.get('@routerSpy').should('have.been.calledWith', ['/login']);
  });

  it('should attempt registration with valid inputs', () => {
    cy.intercept('POST', '**/register', { statusCode: 200, body: { message: 'Registration successful' } }).as('registerRequest');

    cy.get('@component').then((wrapper: any) => {
      const component = wrapper.component as RegisterComponent;
      cy.spy(component['router'], 'navigate').as('routerSpy');
    });

    cy.get('input[formControlName="fullName"]').type('Test User');
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('input[formControlName="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerRequest').its('request.body').should('deep.equal', {
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    cy.get('@routerSpy').should('have.been.calledWith', ['/login']);
  });

  it('should show error message for registration failure', () => {
    cy.intercept('POST', '**/register', { statusCode: 400, body: { error: 'Registration failed' } }).as('registerRequest');

    cy.get('input[formControlName="fullName"]').type('Test User');
    cy.get('input[formControlName="username"]').type('testuser');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('password123');
    cy.get('input[formControlName="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('.error').should('contain', 'Registration failed');
  });

  it('should toggle password visibility', () => {
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
    cy.get('mat-form-field').eq(3).find('mat-icon').click({force: true});
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');
  });

  it('should toggle confirm password visibility', () => {
    cy.get('input[formControlName="confirmPassword"]').should('have.attr', 'type', 'password');
    cy.get('mat-form-field').eq(4).find('mat-icon').click({force: true});
    cy.get('input[formControlName="confirmPassword"]').should('have.attr', 'type', 'text');
  });
});
