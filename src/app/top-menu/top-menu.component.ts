import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css']
})
export class TopMenuComponent implements OnInit {
  menuMore:boolean=false;
  name:any;
  email:any;
  constructor(public log:LoginService,private route:Router) {
    route.events.subscribe((val)=>{
      this.disableMenu();
      this.name=localStorage.getItem("user");
      this.email=localStorage.getItem("userE")
    })
   }

  ngOnInit(): void {
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
