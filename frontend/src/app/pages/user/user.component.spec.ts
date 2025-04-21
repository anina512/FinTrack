import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockAuthService = {
  getUserId: jest.fn()
};

const mockTx = {
  getUser: jest.fn(),
  updateUsername: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn()
};

describe('UserComponent (stand-alone)', () => {
  let fixture: ComponentFixture<UserComponent>;
  let comp: UserComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(UserComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: TransactionsService, useValue: mockTx }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    comp = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('ngOnInit fetches user when id exists', () => {
    mockAuthService.getUserId.mockReturnValue(1);
    const spy = jest.spyOn(comp, 'fetchUserData').mockImplementation(() => {});
    comp.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(comp.loggedInUserId).toBe(1);
  });

  it('ngOnInit does nothing when id missing', () => {
    mockAuthService.getUserId.mockReturnValue(null);
    const spy = jest.spyOn(comp, 'fetchUserData');
    comp.ngOnInit();
    expect(spy).not.toHaveBeenCalled();
    expect(comp.loggedInUserId).toBeNull();
  });

  it('fetchUserData populates user on success', () => {
    const apiUser = { id: 1, username: 'testuser', fullName: 'Test User', email: 'test@example.com' };
    mockTx.getUser.mockReturnValue(of(apiUser));
    comp.loggedInUserId = 1;
    comp.fetchUserData();
    expect(mockTx.getUser).toHaveBeenCalledWith(1);
    expect(comp.user).toEqual(apiUser);
    expect(comp.usernameForm.username).toBe(apiUser.username);
    expect(comp.emailForm.email).toBe(apiUser.email);
    expect(comp.errorMessage).toBe('');
  });

  it('fetchUserData logs error on failure', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockTx.getUser.mockReturnValue(throwError(() => new Error('boom')));
    comp.loggedInUserId = 2;
    comp.fetchUserData();
    expect(errSpy).toHaveBeenCalled();
    expect(comp.errorMessage).toBe('Failed to load user data');
  });

  it('logout clears storage and redirects', () => {
    localStorage.setItem('userId', '99');
    localStorage.setItem('token', 'tok');
    const originalLoc = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLoc, href: '' }
    });

    comp.logout();

    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLoc; // restore
  });

  it('toggleSettings toggles showSettings and resets forms', () => {
    const resetSpy = jest.spyOn(comp, 'resetForms');
    comp.showSettings = false;
    comp.errorMessage = 'Some error';
    comp.successMessage = 'Some success';

    comp.toggleSettings();
    expect(comp.showSettings).toBe(true);
    expect(comp.errorMessage).toBe('');
    expect(comp.successMessage).toBe('');
    expect(resetSpy).toHaveBeenCalled();

    comp.toggleSettings();
    expect(comp.showSettings).toBe(false);
    expect(resetSpy).toHaveBeenCalledTimes(2);
  });

  it('resetForms restores form values', () => {
    comp.user = { username: 'testuser', email: 'test@example.com' };
    comp.usernameForm.username = 'modified';
    comp.emailForm.email = 'modified@example.com';
    comp.passwordForm = {
      currentPassword: 'old',
      newPassword: 'new',
      confirmNewPassword: 'new'
    };

    comp.resetForms();

    expect(comp.usernameForm.username).toBe('testuser');
    expect(comp.emailForm.email).toBe('test@example.com');
    expect(comp.passwordForm).toEqual({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  });

  it('updateUsername updates user on success', () => {
    comp.loggedInUserId = 1;
    comp.user = { id: 1, username: 'testuser' };
    comp.usernameForm.username = 'newuser';
    const response = { message: 'Username updated successfully', user: { id: 1, username: 'newuser' } };
    mockTx.updateUsername.mockReturnValue(of(response));

    comp.updateUsername();

    expect(mockTx.updateUsername).toHaveBeenCalledWith(1, { username: 'newuser' });
    expect(comp.user).toEqual(response.user);
    expect(comp.successMessage).toBe(response.message);
    expect(comp.errorMessage).toBe('');
  });

  it('updateUsername handles empty username', () => {
    comp.usernameForm.username = '';
    comp.updateUsername();
    expect(mockTx.updateUsername).not.toHaveBeenCalled();
    expect(comp.errorMessage).toBe('Username cannot be empty');
    expect(comp.successMessage).toBe('');
  });

  it('updateUsername handles service error', () => {
    comp.loggedInUserId = 1;
    comp.usernameForm.username = 'newuser';
    mockTx.updateUsername.mockReturnValue(throwError(() => ({ error: { error: 'Username taken' } })));

    comp.updateUsername();

    expect(mockTx.updateUsername).toHaveBeenCalledWith(1, { username: 'newuser' });
    expect(comp.errorMessage).toBe('Username taken');
    expect(comp.successMessage).toBe('');
  });

  it('updateUsername fallback error message on unknown error', () => {
    comp.loggedInUserId = 1;
    comp.usernameForm.username = 'newuser';
    mockTx.updateUsername.mockReturnValue(throwError(() => ({})));

    comp.updateUsername();

    expect(comp.errorMessage).toBe('Failed to update username');
    expect(comp.successMessage).toBe('');
  });

  it('updateEmail updates user on success', () => {
    comp.loggedInUserId = 1;
    comp.user = { id: 1, email: 'test@example.com' };
    comp.emailForm.email = 'newemail@example.com';
    const response = { message: 'Email updated successfully', user: { id: 1, email: 'newemail@example.com' } };
    mockTx.updateEmail.mockReturnValue(of(response));

    comp.updateEmail();

    expect(mockTx.updateEmail).toHaveBeenCalledWith(1, { email: 'newemail@example.com' });
    expect(comp.user).toEqual(response.user);
    expect(comp.successMessage).toBe(response.message);
    expect(comp.errorMessage).toBe('');
  });

  it('updateEmail handles invalid email', () => {
    comp.emailForm.email = 'invalid';
    comp.updateEmail();
    expect(mockTx.updateEmail).not.toHaveBeenCalled();
    expect(comp.errorMessage).toBe('Please enter a valid email address');

    comp.emailForm.email = '';
    comp.updateEmail();
    expect(mockTx.updateEmail).not.toHaveBeenCalled();
    expect(comp.errorMessage).toBe('Please enter a valid email address');
  });

  it('updateEmail handles service error', () => {
    comp.loggedInUserId = 1;
    comp.emailForm.email = 'newemail@example.com';
    mockTx.updateEmail.mockReturnValue(throwError(() => ({ error: { error: 'Email already registered' } })));

    comp.updateEmail();

    expect(mockTx.updateEmail).toHaveBeenCalledWith(1, { email: 'newemail@example.com' });
    expect(comp.errorMessage).toBe('Email already registered');
    expect(comp.successMessage).toBe('');
  });

  it('updateEmail fallback error message on unknown error', () => {
    comp.loggedInUserId = 1;
    comp.emailForm.email = 'newemail@example.com';
    mockTx.updateEmail.mockReturnValue(throwError(() => ({})));

    comp.updateEmail();

    expect(comp.errorMessage).toBe('Failed to update email');
    expect(comp.successMessage).toBe('');
  });

  it('updatePassword updates password on success', () => {
    comp.loggedInUserId = 1;
    comp.passwordForm = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmNewPassword: 'newpassword'
    };
    const response = { message: 'Password updated successfully' };
    mockTx.updatePassword.mockReturnValue(of(response));
    const resetSpy = jest.spyOn(comp, 'resetForms');

    comp.updatePassword();

    expect(mockTx.updatePassword).toHaveBeenCalledWith(1, {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword'
    });
    expect(comp.successMessage).toBe(response.message);
    expect(comp.errorMessage).toBe('');
    expect(resetSpy).toHaveBeenCalled();
  });

  it('updatePassword handles password mismatch', () => {
    comp.passwordForm = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmNewPassword: 'different'
    };
    comp.updatePassword();
    expect(mockTx.updatePassword).not.toHaveBeenCalled();
    expect(comp.errorMessage).toBe('New passwords do not match');
    expect(comp.successMessage).toBe('');
  });

  it('updatePassword handles short password', () => {
    comp.passwordForm = {
      currentPassword: 'oldpassword',
      newPassword: 'short',
      confirmNewPassword: 'short'
    };
    comp.updatePassword();
    expect(mockTx.updatePassword).not.toHaveBeenCalled();
    expect(comp.errorMessage).toBe('New password must be at least 6 characters');
    expect(comp.successMessage).toBe('');
  });

  it('updatePassword handles service error', () => {
    comp.loggedInUserId = 1;
    comp.passwordForm = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmNewPassword: 'newpassword'
    };
    mockTx.updatePassword.mockReturnValue(throwError(() => ({ error: { error: 'Incorrect current password' } })));

    comp.updatePassword();

    expect(mockTx.updatePassword).toHaveBeenCalledWith(1, {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword'
    });
    expect(comp.errorMessage).toBe('Incorrect current password');
    expect(comp.successMessage).toBe('');
  });

  it('updatePassword fallback error message on unknown error', () => {
    comp.loggedInUserId = 1;
    comp.passwordForm = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
      confirmNewPassword: 'newpassword'
    };
    mockTx.updatePassword.mockReturnValue(throwError(() => ({})));

    comp.updatePassword();

    expect(comp.errorMessage).toBe('Failed to update password');
    expect(comp.successMessage).toBe('');
  });

});
