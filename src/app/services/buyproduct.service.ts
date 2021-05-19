import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {count, products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuyproductService {
  url="http://localhost:500/buyProduct/";

  constructor(private http:HttpClient) { }
  getProducts(id:String):Observable<products[]>{
    return this.http.get<products[]>(this.url+id);
  }
}
