import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { users } from '../backend/users';
@Injectable({
  providedIn: 'root'
})
export class RegistreService {
  url="http://localhost:500/"
  constructor(private http:HttpClient,private route:Router) { }
  registre(user:users)
  {
    return this.http.post<users>(this.url+"registre/",user);
  }
  testemail(test:any)
  {
    return this.http.get(this.url+"test/"+test);
  }
}
