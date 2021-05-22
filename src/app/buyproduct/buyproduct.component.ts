import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { products } from '../backend/products';
import { BuyproductService } from '../services/buyproduct.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-buyproduct',
  templateUrl: './buyproduct.component.html',
  styleUrls: ['./buyproduct.component.css']
})
export class BuyproductComponent implements OnInit {
   id:String=this.route.snapshot.params['idproducts'];
   loading:boolean=true;
   product:products[]=[];
  constructor(private route:ActivatedRoute,private buyService:BuyproductService,private sanitizer: DomSanitizer,private titleService:Title) {
   }

  ngOnInit(): void {
    this.buyService.getProducts(this.id).subscribe(data=>{this.product=data;this.loading=false})
    /*this.titleService.setTitle(this.product.);*/
  }
  transform(pic:string){
      return this.sanitizer.bypassSecurityTrustUrl(pic);
  }

}
