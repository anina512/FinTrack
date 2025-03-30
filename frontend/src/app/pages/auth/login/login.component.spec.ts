import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

// Create a mock router; this one is still used for navigation.
const routerMock = {
  navigate: jest.fn()
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: { navigate: jest.Mock };
  let authService: AuthService; // We'll override its login method below

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock }
        // Note: We don't provide AuthService here because the component's own provider will be used.
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    // Get the AuthService instance created by the component's providers.
    authService = fixture.debugElement.injector.get(AuthService);
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  }));

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

  it('should display error message on invalid credentials', waitForAsync(() => {
    const errorResponse = { error: { error: 'Invalid email or password' } };
    // Override the login method on the component's AuthService instance
    jest.spyOn(authService, 'login').mockReturnValue(throwError(errorResponse));

    component.loginForm.setValue({ email: 'wrong@example.com', password: 'wrongpass' });
    component.onSubmit();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.errorMessage).toBe('Invalid email or password');
    });
  }));

  it('should navigate to dashboard on valid credentials', waitForAsync(() => {
    const successResponse = { token: 'valid_token' };
    // Override the login method on the component's AuthService instance
    jest.spyOn(authService, 'login').mockReturnValue(of(successResponse));

    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
    // Check that form is valid
    expect(component.loginForm.valid).toBe(true);

    component.onSubmit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  }));

  it('should navigate to register page when goToRegister is called', () => {
    component.goToRegister();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/register']);
  });
});
