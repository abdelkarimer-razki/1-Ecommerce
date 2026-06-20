import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {count, products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  url="http://localhost:5000/seachC/";
  url1 = environment.apiUrl;
  constructor(private http:HttpClient) { }
  getCountM(categorie:string):Observable<products[]>{
    return this.http.get<products[]>(this.url+categorie);
  }
  cartcount(id:any)
  {
    return this.http.get(this.url1+"cartcount/"+id);
  }
  getConfig(): Observable<any> {
    return this.http.get<any>(this.url1 + "api/config");
  }
  saveConfig(config: any): Observable<any> {
    return this.http.post<any>(this.url1 + "api/config", config);
  }
}
