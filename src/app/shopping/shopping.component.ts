import { getSafePropertyAccessString } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { products } from '../backend/products';
import { Title } from '@angular/platform-browser';
import { ShoppingserviceService } from '../services/shoppingservice.service';


@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit {
  products:products[]=[{idproducts:0, name:"",picture:"",description:"",mangable:true,prix:0,categorie:"",prixf:0}];
  img:string[]=[];
  /*HUILE:Boolean=true;*/
  pname:any="";
  categorieS:boolean=false;
  failed:boolean=false;
  loading:boolean=true;
  constructor(private shop:ShoppingserviceService,private shop1:ShoppingserviceService,private sanitizer: DomSanitizer,private router:Router,private titleService:Title) {
   }
  ngOnInit(): void {
    this.showAllData();
    this.titleService.setTitle("Shopping");
  }
  showAllData(){
    this.shop.getAllProducts().subscribe(data=>{
      this.products=data;
      this.loading=false;
      this.categorieS=false;
    })
  }
 /* showDataSearch(){
    this.shop1.getAllProducts().subscribe(data=>{
      this.products=data;
      this.loading=false;
    })
  }*/
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
    this.categorieS=true;
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

  routerBuyProduct(product:products){
    this.router.navigate(['/produit',product.idproducts]);
  }
  change(){
    if(this.categorieS==true){
      this.showAllData();
      this.categorieS=false;
    }
    if(this.pname==""){
      this.ngOnInit();
      this.failed=false;
    }
    else
    {
      this.products=this.products.filter(res=>{
        if(res.name.toLocaleUpperCase().match(this.pname.toLocaleUpperCase())==null){
          this.failed=true;
          return null;
        }else{
          this.failed=false;
          return res.name.toLocaleUpperCase().match(this.pname.toLocaleUpperCase());
        }
      })
    }
  }
}
