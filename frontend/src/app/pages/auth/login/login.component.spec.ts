import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: { login: jest.Mock };
  let routerNavigate: jest.Mock;

  beforeEach(async () => {
    routerNavigate = jest.fn();
    authService    = { login: jest.fn() };

    // Stub out all console.log / console.error calls
    jest.spyOn(console, 'log'  ).mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule]
    })
    .overrideComponent(LoginComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: Router,      useValue: { navigate: routerNavigate } }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set errorMessage when form invalid', () => {
    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Please enter a valid email and password.');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should navigate on successful login', fakeAsync(() => {
    authService.login.mockReturnValue(of({ token: 'tok' }));
    component.loginForm.setValue({ email: 'a@b.c', password: '123456' });
    component.onSubmit();
    tick();
    expect(routerNavigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBe('');
  }));

  it('should set specific errorMessage on login error', fakeAsync(() => {
    authService.login.mockReturnValue(
      throwError(() => ({ error: { error: 'Invalid' } }))
    );
    component.loginForm.setValue({ email: 'a@b.c', password: '123456' });
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBe('Invalid');
    expect(routerNavigate).not.toHaveBeenCalled();
  }));

  it('should fallback to default errorMessage when backend gives none', fakeAsync(() => {
    authService.login.mockReturnValue(
      throwError(() => ({ error: {} }))
    );
    component.loginForm.setValue({ email: 'a@b.c', password: '123456' });
    component.onSubmit();
    tick();
    expect(component.errorMessage).toBe('Invalid email or password.');
    expect(routerNavigate).not.toHaveBeenCalled();
  }));

  it('should navigate to register', () => {
    component.goToRegister();
    expect(routerNavigate).toHaveBeenCalledWith(['/register']);
  });

  it('should redirect to google login', () => {
    component.loginWithGoogle();
    expect((window.location as any).href).toBe('http://localhost:8080/login/google');
  });
});