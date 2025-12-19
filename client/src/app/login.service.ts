import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = 'http://localhost:3000/login'; 

  constructor(private http: HttpClient) { }

  loginUser(username: string, password: string): Observable<any> {
    const formData = { username, password };
    return this.http.post(this.loginUrl, formData);
  }
}
