import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

// Strings are what isPlatformBrowser/Server check for –
// cast to object to satisfy the PLATFORM_ID token’s type.
const BROWSER_ID = 'browser' as unknown as object;
const SERVER_ID  = 'server'  as unknown as object;

describe('AuthService – browser platform', () => {
  let service: AuthService;
  let http:   HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: PLATFORM_ID, useValue: BROWSER_ID }, AuthService]
    });

    service = TestBed.inject(AuthService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('registerUser should POST /register', () => {
    const mock = { ok: true };

    service
      .registerUser('John', 'john', 'john@example.com', 'pw')
      .subscribe(r => expect(r).toEqual(mock));

    const req = http.expectOne('http://localhost:8080/register');
    expect(req.request.method).toBe('POST');
    req.flush(mock);
  });

  it('login should persist userId and update observable', () => {
    const resp = { userId: 42 };
    let obsVal: number | null = null;

    service.getUserIdObservable().subscribe(v => (obsVal = v));

    service.login('john@example.com', 'pw').subscribe(r => {
      expect(r).toEqual(resp);
    });
    http.expectOne('http://localhost:8080/login').flush(resp);

    expect(sessionStorage.getItem('userId')).toBe('42');
    expect(service.getUserId()).toBe(42);
    expect(obsVal).toBe(42);
  });

  it('getUserId should read from sessionStorage on construction', () => {
    sessionStorage.setItem('userId', '88');
    const fresh = new AuthService(TestBed.inject(HttpClient), BROWSER_ID);
    expect(fresh.getUserId()).toBe(88);
  });

  it('observable should emit userId taken from sessionStorage', () => {
    sessionStorage.setItem('userId', '101');
    const fresh = new AuthService(TestBed.inject(HttpClient), BROWSER_ID);

    fresh.getUserIdObservable().subscribe(v => {
      expect(v).toBe(101);
    });
  });

  it('logout should clear storage and emit null', () => {
    sessionStorage.setItem('userId', '77');
    localStorage.setItem('jwt', 'token');

    let latest: number | null | undefined;
    service.getUserIdObservable().subscribe(v => (latest = v));

    service.logout();

    expect(sessionStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('jwt')).toBeNull();
    expect(latest).toBeNull();
  });

  it('constructor should decode JWT when no session userId', () => {
    localStorage.setItem('jwt', 'tok');
    (jwtDecode as jest.Mock).mockReturnValue({ userId: 123 });

    const fresh = new AuthService(TestBed.inject(HttpClient), BROWSER_ID);
    expect(sessionStorage.getItem('userId')).toBe('123');
    expect(fresh.getUserId()).toBe(123);
  });

  it('should handle bad JWT gracefully', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('jwt', 'bad');
    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error('bad');
    });

    new AuthService(TestBed.inject(HttpClient), BROWSER_ID);

    expect(spy).toHaveBeenCalledWith('Failed to decode JWT:', expect.any(Error));
  });
});

describe('AuthService – server platform', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: PLATFORM_ID, useValue: SERVER_ID }, AuthService]
    });

    service = TestBed.inject(AuthService);
  });

  it('getUserId should return null on server', () => {
    expect(service.getUserId()).toBeNull();
  });

  it('logout on server should not touch browser storage', () => {
    sessionStorage.setItem('userId', '55');
    localStorage.setItem('jwt', 'abc');

    service.logout();

    expect(sessionStorage.getItem('userId')).toBe('55');
    expect(localStorage.getItem('jwt')).toBe('abc');
  });

  it('getUserId should return null when sessionStorage is empty', () => {
    sessionStorage.clear();                                
    const fresh = new AuthService(TestBed.inject(HttpClient), BROWSER_ID);
    expect(fresh.getUserId()).toBeNull();                  
  });
  
});
