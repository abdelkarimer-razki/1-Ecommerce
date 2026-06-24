import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingserviceService {
  url="http://localhost:5000";
  url1="http://localhost:5000/seachC/";
  url2="http://localhost:5000/mange/";
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

  getCategories(): Observable<any[]>{
    return this.http.get<any[]>(this.url+'/categories/all');
  }
}
