import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingserviceService {
  url="http://localhost:500";
  url1="http://localhost:500/seachC/";
  url2="http://localhost:500/mange/";
  constructor(private http:HttpClient) { }
  getAllProducts():Observable<products[]>{
    return this.http.get<products[]>(this.url);
  }

  getProductsCategorie(categorie:String):Observable<products[]>{
    return this.http.get<products[]>(this.url1+categorie);
  }

  getProductsMangable(mangable:boolean):Observable<products[]>{
    return this.http.get<products[]>(this.url2+mangable);
  }
}
