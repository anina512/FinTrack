import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerUser', () => {
    it('should send a POST request to register a user', () => {
      const mockUser = { fullName: 'user', email: 'user@gmail.com', username: 'testuser', password: 'testpass' };

      service.registerUser(mockUser.fullName, mockUser.username, mockUser.email, mockUser.password, ).subscribe(response => {
        expect(response).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUser);

      req.flush(mockUser);
    });
  });

  describe('login', () => {
    it('should send a POST request to login a user', () => {
      const mockCredentials = { email: 'testuser', password: 'testpass' };
      const mockResponse = { token: 'fake-jwt-token' };

      service.login(mockCredentials.email, mockCredentials.password).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);

      req.flush(mockResponse);
    });
  });
});
