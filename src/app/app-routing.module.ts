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
import { AdminComponent } from './admin/admin.component';
import { CommandsComponent } from './commands/commands.component';
import { ProductsComponent } from './products/products.component';
import { CategoriesComponent } from './categories/categories.component';
import { ConnectedGuard } from './connected.guard';
import { SettingsComponent } from './settings/settings.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { MessagesComponent } from './messages/messages.component';

const routes: Routes = [
  {path:'shopping',component:ShoppingComponent},
  {path:'',component:AcceuilContComponent},
  {path:'cart',component:AproposComponent,canActivate:[ConnectedGuard]},
  {path:'checkout',component:CheckoutComponent},
  {path:'produit/:idproducts',component:BuyproductComponent},
  {path:'connexion',component:LoginComponent,canActivate:[CsGuard]},
  {path:'inscrire',component:RegistreComponent,canActivate:[CsGuard]},
  {path:'admin',component:AdminComponent,canActivate:[AuthGuard],
  children:[
    {path:'dashboard',component:DashboardComponent,canActivate:[AuthGuard]},
    {path:'commands',component:CommandsComponent,canActivate:[AuthGuard]},
    {path:'categories',component:CategoriesComponent,canActivate:[AuthGuard]},
    {path:'products',component:ProductsComponent,canActivate:[AuthGuard]},
    {path:'messages',component:MessagesComponent,canActivate:[AuthGuard]},
    {path:'settings',component:SettingsComponent,canActivate:[AuthGuard]}
  ]},
  {path:'**',component:PagenotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [ShoppingComponent,AcceuilContComponent]
