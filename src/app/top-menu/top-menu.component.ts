import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { HomepageService } from '../services/homepage.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  menuMore:boolean=false;
  name:any;
  email:any;
  cart:Number=0;
  constructor(public log:LoginService,private route:Router,private homepage:HomepageService) {
    route.events.subscribe((val)=>{
      this.disableMenu();
      this.name=localStorage.getItem("user");
      this.email=localStorage.getItem("userE")
    })
   }

  ngOnInit(): void {
    if(!!localStorage.getItem("userId")==true)
    {
      this.homepage.cartcount(localStorage.getItem("userId")).subscribe((data:any)=>{this.cart=data[0].count;
      localStorage.setItem('count',data[0].count)})
      setInterval(()=>{this.homepage.cartcount(localStorage.getItem("userId")).subscribe((data:any)=>{this.cart=data[0].count;localStorage.setItem('count',data[0].count)})},1000);
    }
  }
  showMenu(){
    /*if(this.menuMore==true)
    this.menuMore=false;
    else
    this.menuMore=true;*/
    this.menuMore=!this.menuMore
  }
  disableMenu(){
    this.menuMore=false;
  }

}
