import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class NonAdminGuard implements CanActivate {
  constructor(private router: Router, private login: LoginService) {}

  canActivate(): boolean {
    if (this.login.isToken() && this.login.isntAdmin()) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  }
}
