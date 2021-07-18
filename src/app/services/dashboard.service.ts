import { Injectable } from '@angular/core';
import {commands} from '../backend/commands'
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';


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
}
