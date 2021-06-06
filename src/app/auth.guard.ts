import { Injectable } from '@angular/core';
import { CanActivate,Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router:Router,private login:LoginService ){}
  canActivate():boolean{
    if(this.login.isToken()){
      return true;
    }else{
      this.router.navigate(['/connexion']);
      return false;
    }
  }
}
