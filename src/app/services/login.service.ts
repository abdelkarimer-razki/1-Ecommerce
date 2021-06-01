import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { users } from '../backend/users';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  url="http://localhost:500/login/"
  constructor(private http:HttpClient) { }
  connect(email:string,password:string){
    return this.http.get<any>(this.url+email+"&"+password);
  }
  isToken(){
    return !!localStorage.getItem('token');
  }
}
