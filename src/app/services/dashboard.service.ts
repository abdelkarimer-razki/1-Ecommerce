import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url1="http://localhost:500/";
  constructor(private http:HttpClient) { }
  RouterHere(){
    return this.http.get(this.url1+'dashboard');
  }
}
