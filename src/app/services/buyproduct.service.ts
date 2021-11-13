import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {count, products} from '../backend/products'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuyproductService {
  url="http://localhost:500/";

  constructor(private http:HttpClient) { }
  getProducts(id:String):Observable<products[]>{
    return this.http.get<products[]>(this.url+"buyProduct/"+id);
  }
  acheterorcart(idproducts:any,iduser:any,qte:any,prix:any,cart:any,taille:any)
  {
    return this.http.get(this.url+"acheterorcart/"+idproducts+"&"+iduser+"&"+qte+"&"+prix+"&"+cart+"&"+taille);
  }
  cartcheck(idproduct:any,iduser:any)
  {
    return this.http.get(this.url+"checkcart/"+iduser+"&"+idproduct);
  }
}
