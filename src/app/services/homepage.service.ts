import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {count, products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  url="http://localhost:500/seachC/";
  url1="http://localhost:500/";
  constructor(private http:HttpClient) { }
  getCountM(categorie:string):Observable<products[]>{
    return this.http.get<products[]>(this.url+categorie);
  }
  cartcount(id:any)
  {
    return this.http.get(this.url1+"cartcount/"+id);
  }
}
