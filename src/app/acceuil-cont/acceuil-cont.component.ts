import { Component, OnInit } from '@angular/core';
import { count } from '../backend/products';
import { HomepageService } from '../services/homepage.service';

@Component({
  selector: 'app-acceuil-cont',
  templateUrl: './acceuil-cont.component.html',
  styleUrls: ['./acceuil-cont.component.css']
})
export class AcceuilContComponent implements OnInit {
   countO:count={count:0};
   countH:count={count:0};
  constructor(private HomepageService:HomepageService) { }

  ngOnInit(): void {
    this.getCountOil();
    this.getCountHoney();
  }
  getCountOil(){
    this.HomepageService.getCount("HUILE").subscribe(data=>{
      this.countO=data;
    })
  }
    getCountHoney(){
    this.HomepageService.getCount("MIEL").subscribe(data=>{
      this.countH=data;
    })
    }

}
