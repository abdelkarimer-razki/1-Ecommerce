import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilContComponent } from './acceuil-cont/acceuil-cont.component';
import { AproposComponent } from './apropos/apropos.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { BuyproductComponent } from './buyproduct/buyproduct.component';

const routes: Routes = [
  {path:'shopping',component:ShoppingComponent,},
  {path:'',component:AcceuilContComponent},
  {path:"Apropos",component:AproposComponent},
  {path:"produit/:idproducts",component:BuyproductComponent},
  {path:"**",component:PagenotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [ShoppingComponent,AcceuilContComponent]
