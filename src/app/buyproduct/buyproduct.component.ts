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
   prix:boolean=true;
   qte:any=1;
   achate:boolean=false;
   cart:boolean=false;
   prix2:boolean=false;
   prix3:boolean=false;
   admin:boolean=false;

   product:products[]=[];
  constructor(private route:ActivatedRoute,private login:LoginService,private router:Router,private buyService:BuyproductService,private sanitizer: DomSanitizer,private titleService:Title) {
   }

  ngOnInit(): void {
   this.buyService.getProducts(this.id).subscribe(data=>{this.product=data;this.loading=false})
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
    /*this.titleService.setTitle(this.product.);*/
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
  change(i:Number){
    if(i == 1)
    {
      this.prix=true;
      this.prix2=false;
      this.prix3=false;
    }
    else if(i == 2)
    {
      this.prix=false;
      this.prix2=true;
      this.prix3=false;
    }
    else if(i == 3)
    {
      this.prix=false;
      this.prix2=false;
      this.prix3=true;
    }
  }
  acheter(idproducts:any,prix1:any,prix2:any,prix3:any,cart:any,taille1:any,taille2:any,taille3:any)
  {
    if(cart==false)
    {
      this.achate=true;
    }
    if(!!localStorage.getItem("userId")==false)
    {
      this.router.navigate(['/connexion']);
    }
    else
    {
      if(this.prix==true)
        this.buyService.acheterorcart(idproducts,localStorage.getItem("userId"),this.qte,this.qte*prix1,cart,taille1).subscribe(data=>{
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
      else if(this.prix2==true)
        this.buyService.acheterorcart(idproducts,localStorage.getItem("userId"),this.qte,this.qte*prix2,cart,taille2).subscribe(data=>{if(cart==true){
          this.cart=true;
          localStorage.removeItem('cart');
          }else
          {
            localStorage.setItem('cart','false');
            this.router.navigate(['/cart']);
          }
          this.achate=false});
      else if(this.prix3==true)
        this.buyService.acheterorcart(idproducts,localStorage.getItem("userId"),this.qte,this.qte*prix3,cart,taille3).subscribe(data=>{if(cart==true){
          this.cart=true;
          localStorage.removeItem('cart');
          }else
          {
            localStorage.setItem('cart','false');
            this.router.navigate(['/cart']);
          }
          this.achate=false;});
    }
  }
}
