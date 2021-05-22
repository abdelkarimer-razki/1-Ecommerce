import { Component, OnInit } from '@angular/core';
import { count, products } from '../backend/products';
import { HomepageService } from '../services/homepage.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-acceuil-cont',
  templateUrl: './acceuil-cont.component.html',
  styleUrls: ['./acceuil-cont.component.css']
})
export class AcceuilContComponent implements OnInit {
   countO:Number=0;
   loading:boolean=true;
   countH:Number=0;
  constructor(private HomepageService:HomepageService,private titleService:Title) { }

  ngOnInit(): void {
    this.getCountOil();
    this.titleService.setTitle("COOP BABMANSOUR");
    this.getCountHoney();
  }
    getCountOil(){
    this.HomepageService.getCountO("HUILE").subscribe(data=>{
      this.countO=data.length;
      this.loading=false;
    })
    }
    getCountHoney(){
    this.HomepageService.getCountM("MIEL").subscribe(data=>{
      this.countH=data.length;
      this.loading=false;
    })
    }

}
