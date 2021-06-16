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
  connect(email:string,password:string){
    return this.http.get<any>(this.url+email+"&"+password);
  }
  isToken(){
    return !!localStorage.getItem('K2hM$4PAWCeFV8');
  }
  getToken() {
    return localStorage.getItem('K2hM$4PAWCeFV8');
  }
  logout(){
    localStorage.removeItem('user');
    localStorage.removeItem('userE');
    localStorage.removeItem('K2hM$4PAWCeFV8');
    localStorage.removeItem("#bsXpEcIouiz")
    this.route.navigate(["/connexion"]);
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
