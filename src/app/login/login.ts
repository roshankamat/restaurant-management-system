import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  auth = inject(AuthService);
  db = inject(DatabaseService);
  private router = inject(Router);

  loginMode: 'CREDENTIALS' | 'PIN' = 'CREDENTIALS';

  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  pinDigits: string = '';
  errorMessage: string = '';
  shakeError: boolean = false;
  isSubmitting: boolean = false;

  get shiftGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'शुभ प्रभात • Morning Service Shift';
    if (hour < 17) return 'नमस्ते • Lunch & Afternoon Shift';
    return 'शुभ संध्या • Royal Dinner Service';
  }

  onCredentialsSubmit(): void {
    this.errorMessage = '';
    if (!this.username.trim() || !this.password) {
      this.triggerError('Please enter both Admin Username and Password.');
      return;
    }

    this.isSubmitting = true;
    const result = this.auth.login(this.username, this.password);
    this.isSubmitting = false;

    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.triggerError(result.message);
    }
  }

  pressPinDigit(digit: string): void {
    this.errorMessage = '';
    if (this.pinDigits.length >= 4) return;
    this.pinDigits += digit;

    if (this.pinDigits.length === 4) {
      setTimeout(() => this.verifyPin(), 120);
    }
  }

  backspacePin(): void {
    this.errorMessage = '';
    this.pinDigits = this.pinDigits.slice(0, -1);
  }

  clearPin(): void {
    this.errorMessage = '';
    this.pinDigits = '';
  }

  verifyPin(): void {
    const result = this.auth.loginWithPin(this.pinDigits);
    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.triggerError(result.message);
      setTimeout(() => {
        this.pinDigits = '';
      }, 380);
    }
  }

  quickDemoLogin(username: string, password: string): void {
    this.username = username;
    this.password = password;
    this.loginMode = 'CREDENTIALS';
    this.onCredentialsSubmit();
  }

  private triggerError(msg: string): void {
    this.errorMessage = msg;
    this.shakeError = false;
    setTimeout(() => (this.shakeError = true), 10);
    setTimeout(() => (this.shakeError = false), 520);
  }
}
