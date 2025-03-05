import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080'; // Your Go backend URL

  constructor(private http: HttpClient) {}

  // registerUser(username: string, password: string): Observable<any> {
  //   const user = { username, password };
  //   return this.http.post(`${this.apiUrl}/register`, user);
  // }
  registerUser(fullName: string, username: string, email: string, password: string): Observable<any> {
    const user = { fullName, username, email, password };
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(email: string, password: string): Observable<any> {
    const user = { email, password };
    return this.http.post(`${this.apiUrl}/login`, user);
  }
}
