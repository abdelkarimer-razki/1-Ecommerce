import { Injectable } from '@angular/core';
import {commands} from '../backend/commands'
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { products } from '../backend/products';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url1="http://localhost:5000/";
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
  commandEffectueSearch(date:any){
    return this.http.get(this.url1+'commandEffectuer/'+date);
  }
  productCombobox(){
    return this.http.get(this.url1);
  }

  //modifier commande
  changeAdressUser(id:Number,adress:string){
    return this.http.get(this.url1+"userM/"+id+"&"+adress);
  }
  changeQteProduit(idcommande:Number,idProduit:Number,qte:Number){
    return this.http.get(this.url1+"commandeChange/"+qte+"&"+idcommande+"&"+idProduit);
  }

  //modifier produit
  updateProduct(product:products){
    return this.http.post<products>(this.url1+"p12/",product);
  }
  //ajouter produit
  addproduct(product:products){
    return this.http.post<products>(this.url1+"addpro/",product);
  }
  showproducts(){
    return this.http.get(this.url1+"productshow");
  }

  //delete commande item
  deletecommande(id:any){
    return this.http.get(this.url1+"deletecommande/"+id);
  }
  //delete products
  deleteproduct(id:any){
    return this.http.get(this.url1+"deletepro/"+id);
  }

  // Delete entire order group
  deleteOrderGroup(idgroup: any){
    return this.http.delete(this.url1+"order-group/"+idgroup);
  }

  // Checkout (multi-product)
  checkout(order: any){
    return this.http.post(this.url1+"checkout", order);
  }

  // Add manual in-store command (multi-product)
  addManualCommand(command: any){
    return this.http.post(this.url1 + "addManualCommand", command);
  }

  // Legacy cart methods (used by apropos/cart page)
  allcart(id:any, cart:any){
    return this.http.get(this.url1+"allcart/"+id+"&"+cart);
  }
  updatecommande(taille:any, qte:any, cart:any, id:any, prix:any){
    return this.http.get(this.url1+"updatecommande/"+id+"&"+taille+"&"+qte+"&"+cart+"&"+prix);
  }
  cartotachat(id:any){
    return this.http.get(this.url1+"cartotachat/"+id);
  }
  cartotachatAll(iduser:any){
    return this.http.get(this.url1+"cartotachatall/"+iduser);
  }
}
