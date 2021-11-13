import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BuyproductService } from '../services/buyproduct.service';
@Component({
  selector: 'app-apropos',
  templateUrl: './apropos.component.html',
  styleUrls: ['./apropos.component.css']
})
export class AproposComponent implements OnInit {
  isEffectuer:boolean=true;
  cartcount:any;
  achate:boolean=false;
  carts:any;
  nada:any=true;
  nocart:any=false;
  product:any;
  total:any=0;
  constructor(private sanitizer: DomSanitizer,private titleService:Title,private dash:DashboardService,private buy:BuyproductService) { }

  ngOnInit(): void {
    this.titleService.setTitle("Panier");
    this.cartcount=localStorage.getItem("count");
    if(!!localStorage.getItem('cart')==true)
    {
      this.isEffectuer=false;
    }
    setInterval(()=>
    {
      this.cartcount=localStorage.getItem("count");
    },1000)
    this.dash.allcart(localStorage.getItem("userId"),this.isEffectuer).subscribe(data=>{this.carts=data;
      this.total=0;
      for(var i=0;i<this.carts.length;i++)
      {
        this.total=this.carts[i].prix+this.total;
      };
      if(this.carts.length == 0)
      {
        this.nocart=true;
      }else
      {
        this.nocart=false
      }})
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
  change(i:any)
  {
    if(i==1)
    {
      this.dash.allcart(localStorage.getItem("userId"),false).subscribe(data=>{this.carts=data;
        this.total=0;
        for(var i=0;i<this.carts.length;i++)
        {
          this.total=this.carts[i].prix+this.total;
        };
        if(this.carts.length == 0)
        {
          this.nocart=true;
        }else
        {
          this.nocart=false
        }});
      this.isEffectuer=false;
    }
    else if(i==2)
    {
      this.dash.allcart(localStorage.getItem("userId"),true).subscribe(data=>{this.carts=data;
        this.total=0;
        for(var i=0;i<this.carts.length;i++)
        {
          this.total=this.carts[i].prix+this.total;
        };
        if(this.carts.length == 0)
        {
          this.nocart=true;
        }else
        {
          this.nocart=false
        }});
      this.isEffectuer=true;
    }
  }
  deletecommande(id:any,test:any)
  {
    this.dash.deletecommande(id).subscribe();
    setTimeout(()=>{
        this.dash.allcart(localStorage.getItem("userId"),this.isEffectuer).subscribe(data=>{this.carts=data;
      this.total=0;
    for(var i=0;i<this.carts.length;i++)
    {
      this.total=this.carts[i].prix+this.total;
    };
    if(this.carts.length == 0)
    {
      this.nocart=true;
    }else
    {
      this.nocart=false
    }})},1000);
  }
  change1(id:any,taille:any,qte:any,taille1:any,taille2:any,taille3:any,prix1:any,prix2:any,prix3:any)
  {
    if(taille==taille1)
      this.dash.updatecommande(taille,qte,true,id,qte*prix1).subscribe();
    else if(taille==taille2)
      this.dash.updatecommande(taille,qte,true,id,qte*prix2).subscribe();
    else if(taille==taille3)
      this.dash.updatecommande(taille,qte,true,id,qte*prix3).subscribe();
    setTimeout(()=>{this.dash.allcart(localStorage.getItem("userId"),true).subscribe(data=>{this.carts=data;
      this.total=0;
    for(var i=0;i<this.carts.length;i++)
    {
      this.total=this.carts[i].prix+this.total;
    };
    if(this.carts.length == 0)
    {
      this.nocart=true;
    }else
    {
      this.nocart=false
    }})},1000);
  }
  achetercart(id:any)
  {
    this.dash.cartotachat(id).subscribe();
    setTimeout(()=>{this.dash.allcart(localStorage.getItem("userId"),true).subscribe(data=>{this.carts=data;
      this.total=0;
    for(var i=0;i<this.carts.length;i++)
    {
      this.total=this.carts[i].prix+this.total;
    };
    if(this.carts.length == 0)
    {
      this.nocart=true;
    }else
    {
      this.nocart=false
    }})},1000);
  }
  achetertous()
  {
    this.achate=true;
    for(var i=0;i<this.carts.length;i++)
    {
      this.dash.cartotachat(this.carts[i].idcommande).subscribe();
    }
    setTimeout(()=>{this.dash.allcart(localStorage.getItem("userId"),true).subscribe(data=>{this.carts=data;
      this.total=0;
    for(var i=0;i<this.carts.length;i++)
    {
      this.total=this.carts[i].prix+this.total;
    }
  this.achate=false;
  if(this.carts.length == 0)
  {
    this.nocart=true;
  }else
  {
    this.nocart=false
  }})},1000);
  }
}
