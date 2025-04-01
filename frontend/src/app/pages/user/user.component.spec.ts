import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';
import { of, throwError } from 'rxjs';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockTransactionsService: jest.Mocked<TransactionsService>;
  let httpTestingController: HttpTestingController; // Declare without immediate assignment

  const mockUserData = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(async () => {
    mockAuthService = {
      getUserId: jest.fn().mockReturnValue(1),
    } as any;

    mockTransactionsService = {
      getUser: jest.fn().mockReturnValue(of(mockUserData)),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientTestingModule,
        SideNavComponent,
        UserComponent
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TransactionsService, useValue: mockTransactionsService }
      ]
    })
    .overrideProvider(TransactionsService, { useValue: mockTransactionsService })
    .overrideProvider(AuthService, { useValue: mockAuthService })
    .compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController); // Assign here after TestBed is configured
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify(); // Safe to use now as it’s assigned in beforeEach
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with loggedInUserId from AuthService and fetch user data', fakeAsync(() => {
    const fetchUserDataSpy = jest.spyOn(component, 'fetchUserData');
    fixture.detectChanges(); // Trigger ngOnInit here
    tick(); // Simulate async operations
    expect(mockAuthService.getUserId).toHaveBeenCalledTimes(1);
    expect(component.loggedInUserId).toBe(1);
    expect(fetchUserDataSpy).toHaveBeenCalledTimes(1);
    expect(component.user).toEqual(mockUserData);
  }));

  it('should not fetch user data if loggedInUserId is null', () => {
    mockAuthService.getUserId.mockReturnValue(null);
    const fetchUserDataSpy = jest.spyOn(component, 'fetchUserData');
    fixture.detectChanges(); // Trigger ngOnInit
    expect(component.loggedInUserId).toBeNull();
    expect(fetchUserDataSpy).not.toHaveBeenCalled();
  });

  describe('fetchUserData', () => {
    it('should fetch user data successfully and assign it to user property', fakeAsync(() => {
      component.loggedInUserId = 1;
      component.fetchUserData();
      tick();
      expect(mockTransactionsService.getUser).toHaveBeenCalledWith(1);
      expect(component.user).toEqual(mockUserData);
    }));

    it('should log an error if fetching user data fails', fakeAsync(() => {
      const errorResponse = new Error('Failed to fetch user');
      mockTransactionsService.getUser.mockReturnValue(throwError(() => errorResponse));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component.loggedInUserId = 1;
      component.fetchUserData();
      tick();

      expect(mockTransactionsService.getUser).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user data:', errorResponse);
      consoleErrorSpy.mockRestore();
    }));
  });

  describe('editProfile', () => {
    it('should log a message when editProfile is called', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      component.editProfile();
      expect(consoleLogSpy).toHaveBeenCalledWith('Editing profile...');
      consoleLogSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should clear localStorage and redirect to login', () => {
      const localStorageSpy = jest.spyOn(Storage.prototype, 'removeItem');
      delete (window as any).location;
      window.location = { href: '' } as any;
      const locationSpy = jest.fn();
      Object.defineProperty(window.location, 'href', {
        set: locationSpy,
        configurable: true
      });

      component.logout();

      expect(localStorageSpy).toHaveBeenCalledWith('userId');
      expect(localStorageSpy).toHaveBeenCalledWith('token');
      expect(locationSpy).toHaveBeenCalledWith('/login');
    });
  });
});