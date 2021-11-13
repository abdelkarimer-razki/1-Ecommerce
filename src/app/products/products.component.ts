import { Component, OnInit } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from '../services/dashboard.service';
import { products } from '../backend/products';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  produits:any;
  loading:boolean=true;
  myimage: any;
  is:Boolean[]=[];
  product:products={idproducts:0,name:"",picture:"",description:"",prix:0,categorie:"null",mangable:false,prixf:0,taille:"0",taille2:"0",taille3:"0",prix2:0,prix3:0};
  more:Boolean[]=[];
  details:Boolean[]=[];
  pname:any="";
  add:boolean=false;
  constructor(private sanitizer: DomSanitizer,private dash:DashboardService) { }

  ngOnInit(): void {
    this.dash.showproducts().subscribe(data=>{this.produits = data;this.loading=false});
  }
  showmor(a:any){
    var s=document.getElementById(a.toString());
    if(s?.style.display=="none"){
      if(s) s.style.display="revert"
    }else
    {
      if(s) s.style.display="none"
    }
  }
  turnoff(i:any)
  {
    for(var j=0;j<this.is.length;j++)
    {
      if(i != j)
      {
        this.is[j]=false;
      }
    }
    for(var j=0;j<this.details.length;j++)
    {
      if(i != j)
      {
        this.details[j]=false;
      }
    }
    for(var j=0;j<this.more.length;j++)
    {
      if(i != j)
      {
        this.more[j]=false;
      }
    }
  }
  pic(st:any)
  {
    this.myimage=st;
  }
  disable(a:Number){
    var i;
    var s=document.getElementsByClassName("more");
    for(i=0;i<s.length;i++){
      var v=document.getElementById(i.toString());
      if(i!=a){
        if(v?.style.display!="none"){
          if(v) v.style.display="none"
        }
      }
    }
  }
  disableD(a:any)
  {
    var i;
    var s=document.getElementsByClassName("details");
    for(i=0;i<s.length;i++){
      var v=document.getElementById(i.toString()+'a');
      if(i + 'a'!=a){
        if(v?.style.display!="none"){
          if(v) v.style.display="none"
        }
      }
    }
  }
  onChange($event: Event) {
    const file = ($event.target as HTMLInputElement);
    if(file.files != null)
      this.convertToBase64(file.files[0]);
  }

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d)=>{
      this.myimage=d;
    });

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
  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);

    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = (error) => {
      subscriber.error(error);
      subscriber.complete();
    };
  }

  valider(product:products)
  {
    var re = /[/]/gi;
    product.picture=this.myimage.replace(re,"kigmfhhh");
    this.dash.updateProduct(product).subscribe(data =>{
      this.dash.showproducts().subscribe(data=>this.produits = data);
    });
  }
  change(){
    if(this.pname==""){
      this.dash.showproducts().subscribe(data=>this.produits = data);
    }
    else
    {
      this.produits=this.produits.filter(
        (res:any)=>{
        return res.name.toLocaleUpperCase().match(this.pname.toLocaleUpperCase());
      })
    }
  }
  addproduct()
  {
    var re = /[/]/gi;
    this.product.picture=this.myimage.replace(re,"kigmfhhh");
    console.log(this.product.picture);
    this.dash.addproduct(this.product).subscribe(data=>
      {
        this.add=false;
        this.dash.showproducts().subscribe(data=>this.produits = data);
      });
  }
  deletepro(id:any)
  {
    this.dash.deleteproduct(id).subscribe(data=>
      {
        this.dash.showproducts().subscribe(data=>this.produits = data);
      });
  }
}
