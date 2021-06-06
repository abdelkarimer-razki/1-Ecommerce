import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcceuilContComponent } from './acceuil-cont/acceuil-cont.component';
import { AproposComponent } from './apropos/apropos.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { BuyproductComponent } from './buyproduct/buyproduct.component';
import { LoginComponent } from './login/login.component';
import { RegistreComponent } from './registre/registre.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { CsGuard } from './cs.guard';

const routes: Routes = [
  {path:'shopping',component:ShoppingComponent,},
  {path:'',component:AcceuilContComponent},
  {path:"Apropos",component:AproposComponent},
  {path:"produit/:idproducts",component:BuyproductComponent},
  {path:"connexion",component:LoginComponent,canActivate:[CsGuard]},
  {path:"inscrire",component:RegistreComponent,canActivate:[CsGuard]},
  {path:"dashboard",component:DashboardComponent,canActivate:[AuthGuard]},
  {path:"**",component:PagenotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [ShoppingComponent,AcceuilContComponent]
