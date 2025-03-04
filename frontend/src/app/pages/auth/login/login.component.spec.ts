import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

// Mock the Router
const routerMock = {
  navigate: jest.fn()
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: { navigate: jest.Mock }; // Define the type of router
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, // Import the standalone component
        CommonModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        ReactiveFormsModule,
        BrowserAnimationsModule // Import BrowserAnimationsModule
      ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock } // Provide the mock
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as any; // Inject the Router
    formBuilder = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
  });

  it('should validate email field', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalidemail');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password field', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('123');
    expect(passwordControl?.valid).toBeFalsy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should display error message on invalid credentials', () => {
    component.loginForm.setValue({ email: 'wrong@example.com', password: 'wrongpass' });
    component.onSubmit();
    fixture.detectChanges(); // Wait for the component to update
    expect(component.errorMessage).toBe('Invalid email or password');
  });

  it('should navigate to dashboard on valid credentials', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
    component.onSubmit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to register page when goToRegister is called', () => {
    component.goToRegister();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should navigate to dashboard when goToDashboard is called', () => {
    component.goToDashboard();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
