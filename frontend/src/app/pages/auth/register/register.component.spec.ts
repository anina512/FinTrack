// register.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { of, throwError } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authService: { registerUser: jest.Mock };
  let routerNavigate: jest.Mock;

  beforeEach(async () => {
    routerNavigate = jest.fn();
    authService = { registerUser: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, NoopAnimationsModule]
    })
      .overrideComponent(RegisterComponent, {
        set: {
          providers: [
            { provide: AuthService, useValue: authService },
            { provide: Router, useValue: { navigate: routerNavigate } }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles password visibility', () => {
    const start = component.hidePassword;
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBe(!start);
  });

  it('toggles confirm password visibility', () => {
    const start = component.hideConfirmPassword;
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword).toBe(!start);
  });

  it('passwordMatchValidator returns null for match', () => {
    const form = new FormGroup({
      password: new FormControl('p'),
      confirmPassword: new FormControl('p')
    });
    expect(component.passwordMatchValidator(form)).toBeNull();
  });

  it('passwordMatchValidator returns object for mismatch', () => {
    const form = new FormGroup({
      password: new FormControl('p'),
      confirmPassword: new FormControl('q')
    });
    expect(component.passwordMatchValidator(form)).toEqual({ mismatch: true });
  });

  it('sets error when form invalid', () => {
    component.registerForm.setValue({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    component.onRegister();
    expect(component.errorMessage).toBe('Please fill out all fields correctly.');
    expect(authService.registerUser).not.toHaveBeenCalled();
  });

  it('sets "Passwords do not match." when passwords differ and fields valid', () => {
    component.registerForm = new FormGroup({
      fullName: new FormControl('John', Validators.required),
      username: new FormControl('john', [Validators.required, Validators.maxLength(10)]),
      email: new FormControl('john@x.y', [Validators.required, Validators.email]),
      password: new FormControl('123456', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('654321', Validators.required)
    });
    component.onRegister();
    expect(component.errorMessage).toBe('Passwords do not match.');
    expect(authService.registerUser).not.toHaveBeenCalled();
  });

  it('navigates on successful registration', fakeAsync(() => {
    authService.registerUser.mockReturnValue(of({ ok: true }));
    component.registerForm.setValue({
      fullName: 'John Doe',
      username: 'john',
      email: 'john@x.y',
      password: '123456',
      confirmPassword: '123456'
    });
    component.onRegister();
    tick();
    expect(authService.registerUser).toHaveBeenCalledWith('John Doe', 'john', 'john@x.y', '123456');
    expect(routerNavigate).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessage).toBe('');
  }));

  it('sets backend error message when provided', fakeAsync(() => {
    authService.registerUser.mockReturnValue(throwError(() => ({ error: { error: 'fail' } })));
    component.registerForm.setValue({
      fullName: 'John',
      username: 'john',
      email: 'john@x.y',
      password: '123456',
      confirmPassword: '123456'
    });
    component.onRegister();
    tick();
    expect(component.errorMessage).toBe('fail');
    expect(routerNavigate).not.toHaveBeenCalled();
  }));

  it('falls back to default error when backend gives none', fakeAsync(() => {
    authService.registerUser.mockReturnValue(throwError(() => ({ error: {} })));
    component.registerForm.setValue({
      fullName: 'John',
      username: 'john',
      email: 'john@x.y',
      password: '123456',
      confirmPassword: '123456'
    });
    component.onRegister();
    tick();
    expect(component.errorMessage).toBe('Registration failed');
    expect(routerNavigate).not.toHaveBeenCalled();
  }));

  it('navigates to login page directly', () => {
    component.goToLogin();
    expect(routerNavigate).toHaveBeenCalledWith(['/login']);
  });
});
