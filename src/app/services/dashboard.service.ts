import { Injectable } from '@angular/core';
import {commands} from '../backend/commands'
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { products } from '../backend/products';
import { importType } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url1="http://localhost:500/";
  constructor(private http:HttpClient) { }
  RouterHere():Observable<commands[]>{
    return this.http.get<commands[]>(this.url1+'dashboard');
  }
  Vistis():Observable<Number>{
    return this.http.get<Number>(this.url1+'visits');
  }
  revenu():Observable<Number>{
    return this.http.get<Number>(this.url1+'revenu');
  }
  users(){
    return this.http.get<Number>(this.url1+'users');
  }
  revenuMois(mois:Number):Observable<Number>{
    return this.http.get<Number>(this.url1+'revenu/'+mois);
  }
  allCommandsE(){
    return this.http.get(this.url1+'commandnonEffectuer');
  }
  allCommandsN(){
    return this.http.get(this.url1+'commandEffectuer');
  }
  verfieCommande(id:Number,command:commands):Observable<commands>{
    return this.http.put<commands>(this.url1+"v/"+id,command);
  }
  unverfiedCommande(id:Number,command:commands):Observable<commands>{
    return this.http.put<commands>(this.url1+"v1/"+id,command);
  }
  effectueCommande(id:Number,commande:commands):Observable<commands>{
    return this.http.put<commands>(this.url1+"effectue/"+id,commande);
  }
  deeffectueCommande(id:Number,commande:commands):Observable<commands>{
    return this.http.put<commands>(this.url1+"effectue1/"+id,commande);
  }
  commandEffectueSearch(date:Date)
  {
    return this.http.get(this.url1+'commandEffectuer/'+date);
  }

  productCombobox()
  {
    return this.http.get(this.url1);
  }

//modfier commande

  changeAdressUser(id:Number,adress:string)
  {
    return this.http.get(this.url1+"userM/"+id+"&"+adress);
  }

  changeQteProduit(idcommande:Number,idProduit:Number,qte:Number)
  {
    return this.http.get(this.url1+"commandeChange/"+qte+"&"+idcommande+"&"+idProduit);
  }

//modifier produit
  updateProduct(product:products)
  {
    return this.http.post<products>(this.url1+"p12/",product);
  }
//ajouter produit
  addproduct(product:products)
  {
    return this.http.post<products>(this.url1+"addpro/",product);
  }
  showproducts()
  {
    return this.http.get(this.url1+"productshow");
  }
//show all products in cart
  allcart(id:any,cart:any)
  {
    return this.http.get(this.url1+"allcart/"+id+"&"+cart);
  }
//delete commande
  deletecommande(id:any)
  {
    return this.http.get(this.url1+"deletecommande/"+id);
  }
//delete products
  deleteproduct(id:any)
  {
    return this.http.get(this.url1+"deletepro/"+id);
  }
//updatecommande user
  updatecommande(taille:any,qte:any,cart:any,id:any,prix:any)
  {
    return this.http.get(this.url1+"updatecommande/"+id+"&"+taille+"&"+qte+"&"+cart+"&"+prix);
  }
//transfer a cart to achat
  cartotachat(id:any)
  {
    return this.http.get(this.url1+"cartotachat/"+id);
  }
}
