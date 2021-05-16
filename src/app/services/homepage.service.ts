import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {count, products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomepageService {
  url="http://localhost:500/";
  constructor(private http:HttpClient) { }
  getCount(categorie:string):Observable<count>{
    return this.http.get<count>(this.url+categorie);
  }

}
