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
  getUser: jest.fn()
};

describe('UserComponent (stand‑alone)', () => {
  let fixture: ComponentFixture<UserComponent>;
  let comp: UserComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent], // standalone component
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
    const apiUser = { id: 1, name: 'Alice' };
    mockTx.getUser.mockReturnValue(of(apiUser));
    comp.loggedInUserId = 1;
    comp.fetchUserData();
    expect(mockTx.getUser).toHaveBeenCalledWith(1);
    expect(comp.user).toEqual(apiUser);
  });

  it('fetchUserData logs error on failure', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockTx.getUser.mockReturnValue(throwError(() => new Error('boom')));
    comp.loggedInUserId = 2;
    comp.fetchUserData();
    expect(errSpy).toHaveBeenCalled();
  });

  it('editProfile logs action', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    comp.editProfile();
    expect(logSpy).toHaveBeenCalledWith('Editing profile...');
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
});
