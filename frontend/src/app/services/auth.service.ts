import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly mockUser = { email: 'user@example.com', password: 'password123' };

  login(email: string, password: string): boolean {
    return email === this.mockUser.email && password === this.mockUser.password;
  }
}
