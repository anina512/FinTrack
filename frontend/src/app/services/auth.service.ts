import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080';
  private userId = new BehaviorSubject<number | null>(null);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUserId = sessionStorage.getItem('userId');

      if (storedUserId) {
        this.userId.next(Number(storedUserId));
      } else {
        const token = localStorage.getItem('jwt');
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const userIdFromToken = decoded.userId;
            if (userIdFromToken) {
              sessionStorage.setItem('userId', userIdFromToken.toString());
              this.userId.next(userIdFromToken);
            }
          } catch (err) {
            console.error('Failed to decode JWT:', err);
          }
        }
      }
    }
  }

  registerUser(fullName: string, username: string, email: string, password: string): Observable<any> {
    const user = { fullName, username, email, password };
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(email: string, password: string): Observable<any> {
    const user = { email, password };
    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap(response => {
        if (response && response.userId && isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('userId', response.userId.toString());
          this.userId.next(response.userId);
        }
      })
    );
  }

  getUserId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const userId = sessionStorage.getItem('userId');
      return userId ? Number(userId) : null;
    }
    return null;
  }

  getUserIdObservable(): Observable<number | null> {
    return this.userId.asObservable(); 
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('userId');
      localStorage.removeItem('jwt');
      this.userId.next(null);
    }
  }
}
