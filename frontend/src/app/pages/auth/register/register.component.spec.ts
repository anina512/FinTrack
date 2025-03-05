import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Mock the Router
const routerMock = {
  navigate: jest.fn()
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: { navigate: jest.Mock };
  let authService: AuthService;
  let formBuilder: FormBuilder;
  let httpTestingController: HttpTestingController;
  const registerUrl = 'http://localhost:8080/register'; // Define here

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        RegisterComponent,
        CommonModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerMock },
        AuthService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as any;
    authService = TestBed.inject(AuthService);
    formBuilder = TestBed.inject(FormBuilder);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the register form', () => {
    expect(component.registerForm).toBeDefined();
  });

  it('should require all fields in the form', () => {
    const form = component.registerForm;
    form.setValue({
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    expect(form.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors).toBeTruthy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should validate password min length', () => {
    const passwordControl = component.registerForm.get('password');
    passwordControl?.setValue('123');
    expect(passwordControl?.errors).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.errors).toBeNull();
  });

  it('should validate that passwords match', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'differentPassword'
    });

    // Manually trigger validation
    component.registerForm.updateValueAndValidity();

    expect(component.registerForm.errors).toEqual({ mismatch: true });
  });

  it('should set errorMessage on form invalid', () => {
    component.registerForm.setErrors({ invalid: true });
    component.onRegister();
    expect(component.errorMessage).toEqual('Please fill out all fields correctly.');
  });

  it('should set errorMessage if passwords do not match', () => {
    component.registerForm.setValue({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'differentPassword'
    });
    component.registerForm.updateValueAndValidity();
    component.onRegister();
    fixture.detectChanges();

    expect(component.errorMessage).toEqual('Please fill out all fields correctly.');
  });  

  it('should navigate to /login when goToLogin is called', () => {
    component.goToLogin();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
