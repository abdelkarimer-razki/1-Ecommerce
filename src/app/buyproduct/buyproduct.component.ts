import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { products } from '../backend/products';
import { BuyproductService } from '../services/buyproduct.service';
import { Title } from '@angular/platform-browser';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-buyproduct',
  templateUrl: './buyproduct.component.html',
  styleUrls: ['./buyproduct.component.css']
})
export class BuyproductComponent implements OnInit {
   id:String=this.route.snapshot.params['idproducts'];
   loading:boolean=true;
   qte:any=1;
   achate:boolean=false;
   cart:boolean=false;
   admin:boolean=false;
   selectedSize: any = null;

   product:products[]=[];
  constructor(private route:ActivatedRoute,private login:LoginService,private router:Router,private buyService:BuyproductService,private sanitizer: DomSanitizer,private titleService:Title) {
   }

  ngOnInit(): void {
    this.buyService.getProducts(this.id).subscribe(data=>{
      this.product=data;
      this.loading=false;
      if (this.product && this.product[0]) {
        if (!this.product[0].sizes || this.product[0].sizes.length === 0) {
          this.product[0].sizes = [];
          if (this.product[0].taille && this.product[0].taille !== '0') {
            this.product[0].sizes.push({ taille: String(this.product[0].taille), prix: Number(this.product[0].prix) });
          }
          if (this.product[0].taille2 && this.product[0].taille2 !== '0') {
            this.product[0].sizes.push({ taille: String(this.product[0].taille2), prix: Number(this.product[0].prix2) });
          }
          if (this.product[0].taille3 && this.product[0].taille3 !== '0') {
            this.product[0].sizes.push({ taille: String(this.product[0].taille3), prix: Number(this.product[0].prix3) });
          }
        }
        if (this.product[0].sizes && this.product[0].sizes.length > 0) {
          this.selectedSize = this.product[0].sizes[0];
        }
      }
    });

    this.buyService.cartcheck(this.id,localStorage.getItem("userId")).subscribe((data:any)=>
    {
      if(data[0].count>0)
      {
        this.cart=true;
      }
    })
    if(this.login.isntAdmin())
    {
      this.admin=true;
    }
  }

  transform(pic:string){
    var re = /kigmfhhh/gi;
    var pic1=pic.replace(re,"/");
    if(pic1==null){
      return null;
    }else{
      return this.sanitizer.bypassSecurityTrustUrl(pic1);
    }
  }

  selectSize(size: any) {
    this.selectedSize = size;
  }

  acheter(idproducts:any,cart:any)
  {
    if(cart==false)
    {
      this.achate=true;
    }
    if(!localStorage.getItem("userId"))
    {
      this.router.navigate(['/connexion']);
      return;
    }
    if (!this.selectedSize) {
      this.achate = false;
      return;
    }

    const price = Number(this.selectedSize.prix);
    const sizeName = this.selectedSize.taille;

    this.buyService.acheterorcart(idproducts,localStorage.getItem("userId"),this.qte,this.qte*price,cart,sizeName).subscribe(data=>{
      if(cart==true){
        this.cart=true;
        localStorage.removeItem('cart');
      }else
      {
        localStorage.setItem('cart','false');
        this.router.navigate(['/cart']);
      }
      this.achate=false;
    });
  }
}
