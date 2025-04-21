import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: { registerUser: jest.Mock };
  let mockRouter: { navigate: jest.Mock };

  beforeEach(async () => {
    mockAuthService = {
      registerUser: jest.fn().mockReturnValue(of({ success: true })),
    };
    mockRouter = {
      navigate: jest.fn(),
    };

    // Stub out console methods so they don't pollute test output
    jest.spyOn(console, 'log'  ).mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    // override the injected dependencies
    (component as any).authService = mockAuthService as AuthService;
    (component as any).router      = mockRouter      as Router;

    fixture.detectChanges();
  });

  it('should create the component and initialize form controls', () => {
    expect(component).toBeTruthy();
    const ctrls = component.registerForm.controls;
    ['fullName', 'username', 'email', 'password', 'confirmPassword']
      .forEach(key => expect(ctrls[key]).toBeInstanceOf(FormControl));
  });

  describe('passwordMatchValidator', () => {
    let form: FormGroup;
    beforeEach(() => {
      form = new FormGroup({
        password:        new FormControl('123456'),
        confirmPassword: new FormControl('123456'),
      });
    });

    it('should return null when passwords match', () => {
      expect(component.passwordMatchValidator(form)).toBeNull();
    });

    it('should return mismatch error when passwords differ', () => {
      form.patchValue({ confirmPassword: 'other' });
      const result = component.passwordMatchValidator(form)!;
      expect(result.mismatch).toBe(true);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle hidePassword', () => {
      const orig = component.hidePassword;
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBe(!orig);
    });
  });

  describe('toggleConfirmPasswordVisibility', () => {
    it('should toggle hideConfirmPassword', () => {
      const orig = component.hideConfirmPassword;
      component.toggleConfirmPasswordVisibility();
      expect(component.hideConfirmPassword).toBe(!orig);
    });
  });

  describe('onRegister', () => {
    function fillValidForm() {
      component.registerForm.setValue({
        fullName:        'Test User',
        username:        'tester',
        email:           'test@example.com',
        password:        'abcdef',
        confirmPassword: 'abcdef',
      });
    }

    it('should set errorMessage if form is invalid', () => {
      component.registerForm.setValue({
        fullName:        'X',
        username:        'X',
        email:           'not-an-email',
        password:        '123',
        confirmPassword: '123',
      });
      component.onRegister();
      expect(component.errorMessage).toBe('Please fill out all fields correctly.');
      expect(mockAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('should set errorMessage if passwords do not match', () => {
      fillValidForm();
      component.registerForm.setValidators(null);
      component.registerForm.updateValueAndValidity();
      component.registerForm.patchValue({ confirmPassword: 'xxx' });
      component.onRegister();
      expect(component.errorMessage).toBe('Passwords do not match.');
      expect(mockAuthService.registerUser).not.toHaveBeenCalled();
    });

    it('should call AuthService.registerUser and navigate on success', () => {
      fillValidForm();
      component.registerForm.setValidators(null);
      component.registerForm.updateValueAndValidity();
      mockAuthService.registerUser.mockReturnValueOnce(of({ id: '123' }));
      component.onRegister();
      expect(mockAuthService.registerUser)
        .toHaveBeenCalledWith('Test User', 'tester', 'test@example.com', 'abcdef');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage from server error on failure', () => {
      fillValidForm();
      component.registerForm.setValidators(null);
      component.registerForm.updateValueAndValidity();
      const serverErr = { error: { error: 'Email taken' } };
      mockAuthService.registerUser.mockReturnValueOnce(throwError(() => serverErr));
      component.onRegister();
      expect(component.errorMessage).toBe('Email taken');
    });

    it('should use fallback errorMessage when server error has no message', () => {
      fillValidForm();
      component.registerForm.setValidators(null);
      component.registerForm.updateValueAndValidity();
      mockAuthService.registerUser.mockReturnValueOnce(throwError(() => ({ error: {} })));
      component.onRegister();
      expect(component.errorMessage).toBe('Registration failed');
    });
  });

  it('goToLogin should navigate to /login', () => {
    component.goToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
