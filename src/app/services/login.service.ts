import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { users } from '../backend/users';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  name:any;
  email:any;
  url="http://localhost:500/login/"
  constructor(private http:HttpClient,private route:Router) {
  }
  connect(user:users){
    return this.http.post<users>(this.url,user);
  }
  isToken(){
    return !!localStorage.getItem('K2hM$4PAWCeFV8');
  }
  getToken() {
    return localStorage.getItem('K2hM$4PAWCeFV8');
  }
  logout(){
    localStorage.clear();
    this.route.navigate(["/connexion"]).then(()=>{
      window.location.reload();
    });
   /* localStorage.removeItem('user');
    localStorage.removeItem('userE');
    localStorage.removeItem('K2hM$4PAWCeFV8');
    localStorage.removeItem("#bsXpEcIouiz")*/


  }
  isntAdmin(){
    if((localStorage.getItem("#bsXpEcIouiz")=="UF7wcFy9rl&wv$adaLGkkJ@0KX$wWKTt*")&&(this.isToken())){
      return true;
    }
    else{
      return false;
    }
  }
  isuser(){
    if((localStorage.getItem("#bsXpEcIouiz")!="UF7wcFy9rl&wv$adaLGkkJ@0KX$wWKTt*")&&(this.isToken())){
      return true;
    }
    else{
      return false;
    }
  }
}
