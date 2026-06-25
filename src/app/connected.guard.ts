import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate,Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectedGuard implements CanActivate {
  constructor(private router:Router,private login:LoginService ){}
  canActivate():boolean
  {
    if(this.login.isToken()&&!this.login.isntAdmin()){
      return true;
    }else{
      if (this.login.isntAdmin()) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }
  }
}
