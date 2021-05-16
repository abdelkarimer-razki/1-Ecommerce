import { getSafePropertyAccessString } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { products } from '../backend/products';
import { ShoppingserviceService } from '../services/shoppingservice.service';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit {
  products:products[]=[{idproducts:0, name:"",picture:"",description:"",mangable:true,prix:0,categorie:""}];
  img:string[]=[];
  /*HUILE:Boolean=true;*/
  loading:boolean=true;
  constructor(private shop:ShoppingserviceService,private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.showAllData();
  }
  showAllData(){
    this.shop.getAllProducts().subscribe(data=>{
      this.products=data;
      this.loading=false;
    })
  }
  transform(pic:string){
    if(pic==null){
      return null;
    }else{
      return this.sanitizer.bypassSecurityTrustUrl(pic);
    }
  }

  getProductsCategorie(categorie:string){
    /*if(categorie=="MIEL"){
      this.HUILE=false;
    }else{
      this.HUILE=true;
    }*/
    this.shop.getProductsCategorie(categorie).subscribe(data=>{
      this.products=data;
      this.loading=false;
    })
  }

  getProductsMangable(mangable:boolean){
    this.shop.getProductsMangable(mangable).subscribe(data=>{
      this.products=data;
      this.loading=false;
    })
  }
}
