import { Injectable } from '@angular/core';
import { CanActivate,Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

@Injectable({
  providedIn: 'root'
})
export class CsGuard implements CanActivate {
  constructor(private router:Router,private login:LoginService ){}
  canActivate():boolean{
    if(this.login.isToken()){
      this.router.navigate(['/']);
      return false;
    }else{
      return true;
    }
  }

}
