// cypress/component/register.component.cy.ts
import { mount } from 'cypress/angular';
import { RegisterComponent } from 'src/app/pages/auth/register/register.component';
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

// swallow any uncaught Angular animation or routing errors
Cypress.on('uncaught:exception', () => false);

describe('RegisterComponent', () => {
  let routerStub: { navigate: Cypress.AgentStub };

  beforeEach(() => {
    // 1) Stub AuthService.registerUser on the prototype
    cy.stub(AuthService.prototype, 'registerUser').as('registerStub');

    // 2) Fake Router
    routerStub = { navigate: cy.stub() };

    // 3) Mount component, override only Router
    mount(RegisterComponent, {
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
        // AuthService is provided by component; its registerUser() is stubbed above
      ],
    }).then(({ component }) => {
      // spy on any component methods if needed
    });
  });

  it('should render all form fields and buttons', () => {
    cy.get('.title').should('have.text', 'Create Your Account');
    cy.get('input[formcontrolname="fullName"]').should('exist');
    cy.get('input[formcontrolname="username"]').should('exist');
    cy.get('input[formcontrolname="email"]').should('exist');
    cy.get('input[formcontrolname="password"]').should('exist');
    cy.get('input[formcontrolname="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('contain.text', 'Register');
    cy.get('.login-link').should('exist');
  });

  it('should show form‑level error when submitted empty', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('.error', 'Please fill out all fields correctly.').should('be.visible');
  });

  it('should show individual field errors when touched and invalid', () => {
    // Full Name required
    cy.get('input[formcontrolname="fullName"]').focus().blur();
    cy.contains('.error', 'Name is required.').should('be.visible');

    // Username required or length
    cy.get('input[formcontrolname="username"]').focus().blur();
    cy.contains('.error', 'Invalid username.').should('be.visible');

    // Email invalid
    cy.get('input[formcontrolname="email"]').type('bad-email').blur();
    cy.contains('.error', 'Invalid email.').should('be.visible');

    // Password min length
    cy.get('input[formcontrolname="password"]').type('123').blur();
    cy.contains('.error', 'Password must be at least 6 characters.').should('be.visible');

    // Confirm Password required
    cy.get('input[formcontrolname="confirmPassword"]').focus().blur();
    cy.contains('.error', 'Passwords must match.').should('be.visible');
  });

  it('should toggle password visibility for both password fields', () => {
    // Password field toggle
    cy.get('input[formcontrolname="password"]').should('have.attr', 'type', 'password');
    cy.get('mat-icon').eq(3).click({ force: true });
    cy.get('input[formcontrolname="password"]').should('have.attr', 'type', 'text');

    // Confirm Password field toggle
    cy.get('input[formcontrolname="confirmPassword"]').should('have.attr', 'type', 'password');
    cy.get('mat-icon').eq(4).click({ force: true });
    cy.get('input[formcontrolname="confirmPassword"]').should('have.attr', 'type', 'text');
  });

  it('should call registerUser and navigate on successful registration', () => {
    // arrange: stub a successful response
    cy.get('@registerStub').then((stub: any) => {
      stub.returns(of({ id: '123', fullName: 'Test User' }));
    });

    // fill valid form
    cy.get('input[formcontrolname="fullName"]').type('Test User');
    cy.get('input[formcontrolname="username"]').type('testuser');
    cy.get('input[formcontrolname="email"]').type('test@example.com');
    cy.get('input[formcontrolname="password"]').type('password123');
    cy.get('input[formcontrolname="confirmPassword"]').type('password123');

    // act
    cy.get('button[type="submit"]').click();

    // assert registerUser called with correct args
    cy.get('@registerStub').should('have.been.calledWith',
      'Test User', 'testuser', 'test@example.com', 'password123');
    // assert navigation to login
    cy.then(() => {
      expect(routerStub.navigate).to.have.been.calledWith(['/login']);
    });
  });

  it('should display server error when registration fails', () => {
    // arrange: stub an error response
    cy.get('@registerStub').then((stub: any) => {
      stub.returns(throwError({ error: { error: 'User exists.' } }));
    });

    // fill valid form
    cy.get('input[formcontrolname="fullName"]').type('Test User');
    cy.get('input[formcontrolname="username"]').type('testuser');
    cy.get('input[formcontrolname="email"]').type('test@example.com');
    cy.get('input[formcontrolname="password"]').type('password123');
    cy.get('input[formcontrolname="confirmPassword"]').type('password123');

    // act
    cy.get('button[type="submit"]').click();

    // assert error message
    cy.contains('.error', 'User exists.').should('be.visible');
  });

  it('should navigate to login when login link clicked', () => {
    cy.get('.login-link').click({ force: true });
    cy.then(() => {
      expect(routerStub.navigate).to.have.been.calledWith(['/login']);
    });
  });
});
