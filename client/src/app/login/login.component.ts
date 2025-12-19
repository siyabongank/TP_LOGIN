import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  submitForm() {
    // Reset error message
    this.errorMessage = '';
    
    // Simple validation
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    
    // Use the LoginService to send data to server
    this.loginService.loginUser(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        console.error('Login error', err);
        
        if (err.status === 400) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 500) {
          this.errorMessage = 'Internal server error. Please try again later.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }
}
